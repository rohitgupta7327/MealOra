import authService from "./authService";

const API_BASE = "/api/orders";

// High-speed client cache for immediate 0ms calculations
const clientCalcCache = new Map();
const MAX_CLIENT_CACHE = 64;

// AbortController to cancel stale in-flight calculation requests
let inFlightCalcController = null;

const roundCurrency = (val) => Math.round(val * 100) / 100;

function buildClientKey(items, discount, taxRate) {
  let key = `${discount}_${taxRate}_`;
  for (let i = 0; i < items.length; i++) {
    key += `${items[i].id}:${items[i].quantity}|`;
  }
  return key;
}

/**
 * Standardized authenticated headers with JWT Bearer token
 */
function getAuthHeaders(extraHeaders = {}) {
  const token = authService.getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
}

/**
 * Handle 401 unauthorized responses (e.g., token expired while sitting on page)
 */
function handleAuthError(response) {
  if (response.status === 401) {
    console.warn("🔐 Session expired or invalid. Logging out.");
    authService.logout();
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.history.pushState({}, "", "/login");
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  }
}

const orderService = {
  /**
   * Recalculates bill with in-flight cancellation & client-side memoization.
   * If identical cart state was calculated before, returns in 0ms without network round-trip.
   */
  async calculateBill(items = [], discountPercent = 0, taxRate = 0.05) {
    if (!items || items.length === 0) {
      return {
        subtotal: 0,
        discountPercent: 0,
        discountAmount: 0,
        taxableAmount: 0,
        taxRate,
        tax: 0,
        finalTotal: 0,
        itemsCount: 0,
        serverVerified: true,
      };
    }

    const cacheKey = buildClientKey(items, discountPercent, taxRate);
    if (clientCalcCache.has(cacheKey)) {
      return clientCalcCache.get(cacheKey);
    }

    // Abort previous in-flight request if user rapidly clicked buttons
    if (inFlightCalcController) {
      inFlightCalcController.abort();
    }
    inFlightCalcController = new AbortController();

    try {
      // Lightweight payload
      const payload = {
        items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
        discountPercent,
        taxRate,
      };

      const response = await fetch(`${API_BASE}/calculate`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
        signal: inFlightCalcController.signal,
      });

      handleAuthError(response);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const calc = data.calculation;

      // Store in LRU cache
      if (clientCalcCache.size >= MAX_CLIENT_CACHE) {
        const oldest = clientCalcCache.keys().next().value;
        clientCalcCache.delete(oldest);
      }
      clientCalcCache.set(cacheKey, calc);

      return calc;
    } catch (err) {
      if (err.name === "AbortError") {
        return null;
      }

      console.warn("Client fallback calculation:", err.message);

      // Fast single-pass integer math fallback
      let subtotal = 0;
      let count = 0;
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        subtotal += it.price * it.quantity;
        count += it.quantity;
      }

      subtotal = roundCurrency(subtotal);
      const discountAmount = roundCurrency((subtotal * discountPercent) / 100);
      const taxableAmount = Math.max(0, roundCurrency(subtotal - discountAmount));
      const tax = roundCurrency(taxableAmount * taxRate);
      const finalTotal = roundCurrency(taxableAmount + tax);

      return {
        subtotal,
        discountPercent,
        discountAmount,
        taxableAmount,
        taxRate,
        tax,
        finalTotal,
        itemsCount: count,
        serverVerified: false,
      };
    }
  },

  /**
   * Submit new order to server (Enforces JWT Bearer token)
   */
  async createOrder(orderPayload) {
    const response = await fetch(API_BASE, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(orderPayload),
    });

    handleAuthError(response);

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to create order on server.");
    }

    return data.order;
  },

  /**
   * Fetch all orders from MongoDB (Uses authenticated server query)
   */
  async getOrders() {
    try {
      const response = await fetch(API_BASE, {
        headers: getAuthHeaders(),
      });
      handleAuthError(response);
      if (!response.ok) return null;
      const data = await response.json();
      return data.orders || [];
    } catch (err) {
      console.warn("Could not fetch remote orders:", err.message);
      return null;
    }
  },

  /**
   * Update workflow status (Requires JWT Bearer token)
   */
  async updateOrderStatus(orderId, status) {
    try {
      const response = await fetch(`${API_BASE}/${encodeURIComponent(orderId)}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      handleAuthError(response);
      return await response.json();
    } catch (err) {
      console.warn("Status update fallback:", err.message);
      return null;
    }
  },

  /**
   * Update payment method & settlement status (Requires JWT Bearer token)
   */
  async updatePayment(orderId, paymentMethod, paymentStatus = "Paid") {
    try {
      const response = await fetch(`${API_BASE}/${encodeURIComponent(orderId)}/payment`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ paymentMethod, paymentStatus }),
      });
      handleAuthError(response);
      return await response.json();
    } catch (err) {
      console.warn("Payment update fallback:", err.message);
      return null;
    }
  },
};

export default orderService;
