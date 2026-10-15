import React, { useState, useEffect, useMemo, useCallback } from "react";
import Header from "./components/Header";
import AnalyticsCards from "./components/AnalyticsCards";
import MenuSection from "./components/MenuSection";
import CartDrawer from "./components/CartDrawer";
import RecentOrdersTable from "./components/RecentOrdersTable";
import OrderModal from "./components/OrderModal";
import KitchenOrdersView from "./components/KitchenOrdersView";
import AdminMenuView from "./components/AdminMenuView";
import DashboardOverview from "./components/DashboardOverview";
import LoginPage from "./components/LoginPage";
import TeamManagementModal from "./components/TeamManagementModal";
import authService from "./services/authService";
import orderService from "./services/orderService";
import menuService from "./services/menuService";
import {
  INITIAL_CATEGORIES,
  INITIAL_MENU_ITEMS,
  INITIAL_ORDERS,
} from "./data/mockData";
import { CheckCircle2, X, Lock } from "lucide-react";

export default function App() {
  // Theme State with LocalStorage Persistence
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("mealora_theme");
      if (saved === "light" || saved === "dark") return saved;
    }
    return "dark"; // Default signature warm dark mode
  });

  // Sync theme class with <html> documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
    try {
      localStorage.setItem("mealora_theme", theme);
    } catch {
      // storage unavailable
    }
  }, [theme]);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => {
      const nextTheme = prev === "dark" ? "light" : "dark";
      const root = document.documentElement;
      if (nextTheme === "dark") {
        root.classList.add("dark");
        root.classList.remove("light");
      } else {
        root.classList.remove("dark");
        root.classList.add("light");
      }
      try {
        localStorage.setItem("mealora_theme", nextTheme);
      } catch {
        // storage unavailable
      }
      return nextTheme;
    });
  }, []);

  // URL <-> Tab Canonical Mapping
  const TAB_URL_MAP = useMemo(
    () => ({
      Dashboard: "/Dashboard",
      "POS Terminal": "/POS",
      "Kitchen Orders": "/Kitchen",
      "Admin Menu": "/Admin",
    }),
    []
  );

  const getTabFromUrl = useCallback((path) => {
    const clean = (path || "").toLowerCase().replace(/\/$/, "");
    if (!clean || clean === "" || clean === "/dashboard") return "Dashboard";
    if (clean === "/pos" || clean === "/pos-terminal") return "POS Terminal";
    if (clean === "/kitchen" || clean === "/kitchen-orders") return "Kitchen Orders";
    if (clean === "/admin" || clean === "/admin-menu") return "Admin Menu";
    if (clean === "/login") return "Login";
    return "Dashboard";
  }, []);

  const getUrlFromTab = useCallback(
    (tab) => TAB_URL_MAP[tab] || "/Dashboard",
    [TAB_URL_MAP]
  );

  // Toast notification state
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Authentication State with LocalStorage Persistence
  const [currentUser, setCurrentUser] = useState(() => authService.getUser());
  const [authToken, setAuthToken] = useState(() => authService.getToken());

  // Navigation State with URL parsing
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      const u = authService.getUser();
      // If this tab was converted from staff to admin on reload, open Admin page
      if (authService.checkAndClearConvertedFlag() && u?.role === "admin") {
        window.history.replaceState({}, "", "/Admin");
        return "Admin Menu";
      }

      const clean = (window.location.pathname || "").toLowerCase().replace(/\/$/, "");
      if (clean === "/pos" || clean === "/pos-terminal") return "POS Terminal";
      if (clean === "/kitchen" || clean === "/kitchen-orders") return "Kitchen Orders";
      if (clean === "/admin" || clean === "/admin-menu") {
        if (!u || u.role !== "admin") {
          return "POS Terminal";
        }
        return "Admin Menu";
      }
    }
    return "Dashboard";
  });

  // Verify session validity with backend on mount
  useEffect(() => {
    if (authToken) {
      authService.verifySession().then((verifiedUser) => {
        if (verifiedUser) {
          setCurrentUser(verifiedUser);
        } else {
          setCurrentUser(null);
          setAuthToken(null);
        }
      });
    }
  }, [authToken]);

  // Security Verification: URL Synchronization & Authentication Route Guard
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!currentUser || !authToken) {
      // Unauthenticated: MUST stay at /login
      if (window.location.pathname !== "/login") {
        window.history.replaceState({}, "", "/login");
      }
    } else {
      // Role Guard: Staff users CANNOT access or stay on /Admin
      if (currentUser.role !== "admin") {
        const path = window.location.pathname.toLowerCase();
        if (activeTab === "Admin Menu" || path === "/admin" || path === "/admin-menu") {
          setActiveTab("POS Terminal");
          window.history.replaceState({}, "", "/POS");
          return;
        }
      }

      // Authenticated: If on /login or root /, navigate to /Dashboard
      const path = window.location.pathname;
      if (path === "/login" || path === "/" || path === "") {
        const canonical = getUrlFromTab(activeTab);
        window.history.replaceState({}, "", canonical);
      } else {
        const canonical = getUrlFromTab(activeTab);
        if (path.toLowerCase() !== canonical.toLowerCase()) {
          window.history.replaceState({}, "", canonical);
        }
      }
    }
  }, [currentUser, authToken, activeTab, getUrlFromTab]);

  // Handle browser Back / Forward navigation (popstate)
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === "undefined") return;
      const path = window.location.pathname;

      if (!currentUser || !authToken) {
        if (path !== "/login") {
          window.history.replaceState({}, "", "/login");
        }
        return;
      }

      const tab = getTabFromUrl(path);
      if (tab === "Login") {
        window.history.replaceState({}, "", "/Dashboard");
        setActiveTab("Dashboard");
      } else if (tab === "Admin Menu" && currentUser?.role !== "admin") {
        window.history.replaceState({}, "", "/POS");
        setActiveTab("POS Terminal");
      } else {
        setActiveTab(tab);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [currentUser, authToken, getTabFromUrl]);

  // Admin Team Management Modal
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);

  // Menu & Category State
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [menuItems, setMenuItems] = useState(INITIAL_MENU_ITEMS);

  // Cart & Active Ticket State
  const [orderSequence, setOrderSequence] = useState(1002);
  const [orderType, setOrderType] = useState("Dine-In");
  const [customerName, setCustomerName] = useState("");
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Gourmet Cheeseburger",
      price: 12.5,
      quantity: 2,
    },
    {
      id: 6,
      name: "Crispy Truffle Fries",
      price: 6.5,
      quantity: 1,
    },
  ]);

  // Orders State with MongoDB sync
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState(null);

  // Load existing orders and dishes from MongoDB Atlas on mount
  useEffect(() => {
    orderService.getOrders().then((remoteOrders) => {
      if (remoteOrders && remoteOrders.length > 0) {
        setOrders(remoteOrders);
      }
    });

    menuService.getMenuItems().then((remoteDishes) => {
      if (remoteDishes && remoteDishes.length > 0) {
        setMenuItems(remoteDishes);
      }
    });
  }, []);


  // Cart Actions - Memoized stable function references
  const handleAddToCart = useCallback((item) => {
    if (!item.inStock) return;
    setCartItems((prev) => {
      const idx = prev.findIndex((ci) => ci.id === item.id);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
        },
      ];
    });
  }, []);

  const handleUpdateQuantity = useCallback((itemId, delta) => {
    setCartItems((prev) => {
      return prev
        .map((ci) => {
          if (ci.id === itemId) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter(Boolean);
    });
  }, []);

  const handleRemoveItem = useCallback((itemId) => {
    setCartItems((prev) => prev.filter((ci) => ci.id !== itemId));
  }, []);

  const handleClearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  /**
   * OPTIMIZATION: O(M) Hash Map for O(1) instantaneous stock validation
   */
  const stockStatusMap = useMemo(() => {
    const map = new Map();
    for (let i = 0; i < menuItems.length; i++) {
      map.set(menuItems[i].id, menuItems[i].inStock);
    }
    return map;
  }, [menuItems]);

  // One-click batch removal of 86'd out-of-stock items from active cart
  const handleRemoveOutOfStock = useCallback(() => {
    setCartItems((prev) =>
      prev.filter((ci) => stockStatusMap.get(ci.id) !== false)
    );
    showToast("Out-of-stock items removed from cart");
  }, [stockStatusMap, showToast]);

  // Place Order Action with Authoritative Server Calculation & MongoDB Storage
  const handlePlaceOrder = useCallback(
    async (orderData) => {
      // INVENTORY INTEGRITY CHECK: O(C) verification against current stock map
      const unavailable = orderData.cartItems.filter(
        (item) => stockStatusMap.get(item.id) === false
      );

      if (unavailable.length > 0) {
        showToast(
          `❌ Order blocked: ${unavailable.map((u) => u.name).join(", ")} was marked Out of Stock!`
        );
        return;
      }

      try {
        // Enforce authoritative server calculation and persist in MongoDB
        const serverOrder = await orderService.createOrder({
          orderType: orderData.orderType,
          customerName: orderData.customerName,
          cartItems: orderData.cartItems,
          discountPercent: orderData.discountPercent,
          paymentMethod: orderData.paymentMethod || "Cash",
          paymentStatus: orderData.paymentStatus || "Paid",
          notes: orderData.notes,
        });

        setOrders((prev) => [serverOrder, ...prev]);
        setCartItems([]);
        setOrderSequence((prev) => prev + 1);
        showToast(
          `Order ${serverOrder.orderNumber} placed & verified in MongoDB ($${serverOrder.finalTotal.toFixed(2)} • ${serverOrder.paymentMethod})! Ticket sent to Kitchen.`
        );
      } catch (err) {
        // Safe fallback in case backend is offline
        const fallbackOrder = {
          id: orderData.orderNumber,
          customer: `${orderData.orderType} • ${orderData.customerName}`,
          type: orderData.orderType,
          itemsCount: orderData.cartItems.reduce((acc, i) => acc + i.quantity, 0),
          itemsSummary: orderData.cartItems
            .map((i) => `${i.quantity}x ${i.name}`)
            .join(", "),
          items: orderData.cartItems,
          total: orderData.finalTotal,
          subtotal: orderData.subtotal,
          tax: orderData.tax,
          status: "Pending",
          time: "Just now",
          paymentMethod: orderData.paymentMethod || "Cash",
          paymentStatus: orderData.paymentStatus || "Paid",
        };

        setOrders((prev) => [fallbackOrder, ...prev]);
        setCartItems([]);
        setOrderSequence((prev) => prev + 1);
        showToast(
          `Order ${orderData.orderNumber} saved locally ($${fallbackOrder.total.toFixed(2)}).`
        );
      }
    },
    [showToast, stockStatusMap]
  );

  // Status updates (sync with MongoDB)
  const handleUpdateOrderStatus = useCallback((orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId || o.orderNumber === orderId ? { ...o, status: newStatus } : o))
    );
    setSelectedOrderForModal((prev) =>
      prev && (prev.id === orderId || prev.orderNumber === orderId) ? { ...prev, status: newStatus } : prev
    );
    orderService.updateOrderStatus(orderId, newStatus);
    showToast(`Order ${orderId} status updated to ${newStatus}`);
  }, [showToast]);

  // Update Payment Method & Status (sync with MongoDB)
  const handleUpdatePayment = useCallback(
    (orderId, paymentMethod, paymentStatus = "Paid") => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId || o.orderNumber === orderId ? { ...o, paymentMethod, paymentStatus } : o
        )
      );
      setSelectedOrderForModal((prev) =>
        prev && (prev.id === orderId || prev.orderNumber === orderId)
          ? { ...prev, paymentMethod, paymentStatus }
          : prev
      );
      orderService.updatePayment(orderId, paymentMethod, paymentStatus);
      showToast(
        `Payment for ${orderId} updated to ${paymentMethod} (${paymentStatus})`
      );
    },
    [showToast]
  );

  // Toggle stock in Admin view (syncs with MongoDB Atlas)
  const handleToggleStock = useCallback(
    async (itemId) => {
      // Optimistic state update
      setMenuItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, inStock: !i.inStock } : i))
      );
      try {
        const updated = await menuService.toggleStock(itemId);
        showToast(
          `"${updated.name}" is now ${updated.inStock ? "IN STOCK" : "86'd / OUT OF STOCK"}`
        );
      } catch (err) {
        // Revert on failure
        setMenuItems((prev) =>
          prev.map((i) => (i.id === itemId ? { ...i, inStock: !i.inStock } : i))
        );
        showToast(`Stock update failed: ${err.message}`);
      }
    },
    [showToast]
  );

  // Add menu item in Admin view with backend image upload & MongoDB Atlas storage
  const handleAddMenuItem = useCallback(
    async (formData) => {
      try {
        const savedDish = await menuService.createMenuItem(formData);
        setMenuItems((prev) => [savedDish, ...prev]);
        showToast(
          `✨ Dish "${savedDish.name}" saved to MongoDB & photo saved in backend!`
        );
        return savedDish;
      } catch (err) {
        showToast(`❌ Failed to add dish: ${err.message}`);
        throw err;
      }
    },
    [showToast]
  );

  // Edit menu item in Admin view (syncs with MongoDB Atlas)
  const handleEditMenuItem = useCallback(
    async (dishId, formData) => {
      try {
        const updatedDish = await menuService.updateMenuItem(dishId, formData);
        setMenuItems((prev) =>
          prev.map((i) => (i.id === updatedDish.id ? updatedDish : i))
        );
        showToast(`Dish "${updatedDish.name}" updated successfully!`);
        return updatedDish;
      } catch (err) {
        showToast(`❌ Update failed: ${err.message}`);
        throw err;
      }
    },
    [showToast]
  );

  // Delete dish from Admin view and MongoDB Atlas
  const handleDeleteMenuItem = useCallback(
    async (itemId) => {
      try {
        await menuService.deleteMenuItem(itemId);
        setMenuItems((prev) => prev.filter((i) => i.id !== itemId));
        showToast("Dish removed from menu & database.");
      } catch (err) {
        showToast(`❌ Failed to delete dish: ${err.message}`);
      }
    },
    [showToast]
  );

  /**
   * OPTIMIZATION: Single-pass O(O) aggregation for analytics metrics.
   * Consolidates three separate passes into a single iteration.
   */
  const { totalOrdersCount, completedOrdersCount, activeKitchenCount, dailyRevenue } =
    useMemo(() => {
      let completed = 118;
      let kitchenActive = 0;
      let revenue = 1000.0;

      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        revenue += order.total;
        if (order.status === "Completed") {
          completed++;
        } else if (order.status === "Pending" || order.status === "Preparing") {
          kitchenActive++;
        }
      }

      return {
        totalOrdersCount: orders.length + 40,
        completedOrdersCount: completed,
        activeKitchenCount: kitchenActive,
        dailyRevenue: revenue,
      };
    }, [orders]);

  const handleTabChange = useCallback(
    (newTab) => {
      if (newTab === "Admin Menu" && currentUser?.role !== "admin") {
        showToast("🔒 Admin Privileges Required: Access restricted to Administrators.");
        return;
      }
      setActiveTab(newTab);
      const targetUrl = getUrlFromTab(newTab);
      if (typeof window !== "undefined" && window.location.pathname !== targetUrl) {
        window.history.pushState({}, "", targetUrl);
      }
    },
    [currentUser, getUrlFromTab, showToast]
  );

  const handleLoginSuccess = useCallback(
    (user, token) => {
      setCurrentUser(user);
      setAuthToken(token);
      if (user.role === "admin") {
        setActiveTab("Dashboard");
        if (typeof window !== "undefined") {
          window.history.pushState({}, "", "/Dashboard");
        }
      } else {
        setActiveTab("POS Terminal");
        if (typeof window !== "undefined") {
          window.history.pushState({}, "", "/POS");
        }
      }
      showToast(`Signed in successfully as ${user.name} (${user.role.toUpperCase()})`);
    },
    [showToast]
  );

  const handleLogout = useCallback(() => {
    authService.logout();
    setCurrentUser(null);
    setAuthToken(null);
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", "/login");
    }
    showToast("Logged out successfully");
  }, [showToast]);

  const currentOrderNumber = `#ORD-${orderSequence}`;

  // Unauthenticated Screen Guard: Show Login Screen (Forces /login URL)
  if (!currentUser || !authToken) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#121010] text-[#1c1613] dark:text-[#f5f2eb] flex flex-col antialiased transition-colors duration-200">
      {/* 1. Top Navigation / Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        kitchenOrdersCount={activeKitchenCount}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenTeamModal={() => setIsTeamModalOpen(true)}
      />

      {/* Main Terminal Area */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-6 py-5 flex flex-col">
        {/* 2. Summary Analytics Cards Row (Always Visible as Top Executive Snapshot) */}
        <AnalyticsCards
          totalOrders={totalOrdersCount}
          completedOrders={completedOrdersCount}
          dailyRevenue={dailyRevenue}
          activeKitchenOrders={activeKitchenCount}
        />

        {/* Tab Specific Views */}
        {activeTab === "Dashboard" && (
          <DashboardOverview orders={orders} menuItems={menuItems} />
        )}

        {activeTab === "POS Terminal" && (
          <div className="flex flex-col gap-6">
            {/* 3. Main Interactive POS Area (Two-Column Layout) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              
              {/* LEFT COLUMN: Menu Grid & Category Filter (~65% Width) */}
              <div className="lg:col-span-8 rounded-2xl bg-white dark:bg-[#171412] border border-[#e6ddd3] dark:border-[#2e2723] p-4 sm:p-5 shadow-sm dark:shadow-xl transition-colors duration-200">
                <MenuSection
                  categories={categories}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  menuItems={menuItems}
                  onAddToCart={handleAddToCart}
                  cartItems={cartItems}
                />
              </div>

              {/* RIGHT COLUMN: Live Order & Cart Drawer (~35% Width) */}
              <div className="lg:col-span-4 sticky top-20">
                <CartDrawer
                  orderNumber={currentOrderNumber}
                  orderType={orderType}
                  setOrderType={setOrderType}
                  cartItems={cartItems}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                  onClearCart={handleClearCart}
                  onPlaceOrder={handlePlaceOrder}
                  customerName={customerName}
                  setCustomerName={setCustomerName}
                  stockStatusMap={stockStatusMap}
                  onRemoveOutOfStock={handleRemoveOutOfStock}
                />
              </div>

            </div>

            {/* 4. Bottom / Quick Recent Orders Table */}
            <RecentOrdersTable
              orders={orders}
              onViewOrder={(order) => setSelectedOrderForModal(order)}
              onUpdateStatus={handleUpdateOrderStatus}
            />
          </div>
        )}

        {/* Kitchen Orders Tab */}
        {activeTab === "Kitchen Orders" && (
          <KitchenOrdersView
            orders={orders}
            onUpdateStatus={handleUpdateOrderStatus}
          />
        )}

        {/* Admin Menu Tab */}
        {activeTab === "Admin Menu" &&
          (currentUser?.role === "admin" ? (
            <AdminMenuView
              menuItems={menuItems}
              onToggleStock={handleToggleStock}
              onAddMenuItem={handleAddMenuItem}
              onEditMenuItem={handleEditMenuItem}
              onDeleteMenuItem={handleDeleteMenuItem}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-4">
              <div className="w-full max-w-md p-8 rounded-3xl bg-white dark:bg-[#171412] border border-[#e6ddd3] dark:border-[#2e2723] text-center shadow-2xl">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-4">
                  <Lock className="w-7 h-7 stroke-[2.2]" />
                </div>
                <h2 className="text-xl font-black text-[#1c1613] dark:text-[#f5f2eb]">
                  Admin Privileges Required
                </h2>
                <p className="text-xs text-[#736357] dark:text-[#9c8e84] mt-2 mb-6 leading-relaxed">
                  You are logged in as <strong>{currentUser?.name}</strong> with the <strong>Staff</strong> role. Menu editing, stock overrides, and dish additions are strictly restricted to Administrators.
                </p>
                <button
                  onClick={() => handleTabChange("POS Terminal")}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md shadow-orange-500/20 cursor-pointer transition-all"
                >
                  Return to POS Terminal
                </button>
              </div>
            </div>
          ))}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#e6ddd3] dark:border-[#231d19] bg-[#faf7f2] dark:bg-[#141110] py-3.5 px-6 text-xs text-[#736357] dark:text-[#9e8f82] transition-colors duration-200">
        <div className="max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-medium text-[#1c1613] dark:text-[#f5f2eb]">
              © {new Date().getFullYear()} Mealora. All rights reserved.
            </span>
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <span>Built by</span>
            <span className="text-[#a85122] dark:text-[#e87a38] font-semibold">Rohit</span>
          </div>
        </div>
      </footer>

      {/* Order Details Modal (View / Pay) */}
      {selectedOrderForModal && (
        <OrderModal
          order={selectedOrderForModal}
          onClose={() => setSelectedOrderForModal(null)}
          onUpdateStatus={handleUpdateOrderStatus}
          onUpdatePayment={handleUpdatePayment}
        />
      )}

      {/* Admin Team & Staff Management Modal */}
      {isTeamModalOpen && (
        <TeamManagementModal
          isOpen={isTeamModalOpen}
          onClose={() => setIsTeamModalOpen(false)}
          currentUser={currentUser}
          showToast={showToast}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-white dark:bg-[#1e1916] border border-amber-500/40 text-amber-800 dark:text-amber-300 shadow-2xl shadow-black/15 dark:shadow-black/80 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="text-xs font-semibold text-[#1c1613] dark:text-[#f5f2eb]">
            {toastMessage}
          </span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-[#736357] dark:text-[#9c8e84] hover:text-[#1c1613] dark:hover:text-[#f5f2eb] ml-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
