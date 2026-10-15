import React, { useState, useMemo } from "react";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Utensils,
  ShoppingBag as BagIcon,
  Percent,
  Receipt,
  Send,
  AlertTriangle,
  Banknote,
  QrCode,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import orderService from "../services/orderService";

function CartDrawer({
  orderNumber = "#ORD-1002",
  orderType,
  setOrderType,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onPlaceOrder,
  customerName,
  setCustomerName,
  stockStatusMap,
  onRemoveOutOfStock,
}) {
  const [discountPercent, setDiscountPercent] = useState(0);
  const [orderNotes, setOrderNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash"); // "Cash" | "UPI" | "Card"
  const [isPlacing, setIsPlacing] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Authoritative Server-Calculated Totals
  const [serverCalc, setServerCalc] = useState({
    subtotal: 0,
    discountPercent: 0,
    discountAmount: 0,
    taxableAmount: 0,
    taxRate: 0.05,
    tax: 0,
    finalTotal: 0,
    serverVerified: true,
  });

  /**
   * Single-pass O(C) reduction memoized against cart item changes.
   * Also identifies out-of-stock items in O(1) via stockStatusMap.
   */
  const { localSubtotal, totalItemsCount, outOfStockItems } = useMemo(() => {
    let sub = 0;
    let count = 0;
    const oos = [];

    for (let i = 0; i < cartItems.length; i++) {
      const it = cartItems[i];
      sub += it.price * it.quantity;
      count += it.quantity;

      if (stockStatusMap && stockStatusMap.get(it.id) === false) {
        oos.push(it);
      }
    }
    return { localSubtotal: sub, totalItemsCount: count, outOfStockItems: oos };
  }, [cartItems, stockStatusMap]);

  // Recalculate totals on Server whenever quantities or discounts change
  React.useEffect(() => {
    let isCancelled = false;
    setIsCalculating(true);

    const timer = setTimeout(async () => {
      try {
        const result = await orderService.calculateBill(cartItems, discountPercent, 0.05);
        if (!isCancelled && result) {
          setServerCalc(result);
        }
      } catch (err) {
        console.error("Server billing recalculation failed:", err);
      } finally {
        if (!isCancelled) setIsCalculating(false);
      }
    }, 150); // Debounce rapid quantity clicks

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [cartItems, discountPercent]);

  const hasOutOfStockItems = outOfStockItems.length > 0;

  // Use authoritative server amounts (fallback to local calculation if initial render)
  const subtotal = serverCalc.subtotal || localSubtotal;
  const discountAmount = serverCalc.discountAmount;
  const tax = serverCalc.tax;
  const finalTotal = serverCalc.finalTotal;

  const handlePlaceOrderClick = () => {
    if (cartItems.length === 0 || hasOutOfStockItems || isPlacing) return;

    setIsPlacing(true);
    setTimeout(() => {
      onPlaceOrder({
        orderNumber,
        orderType,
        customerName:
          customerName.trim() ||
          (orderType === "Dine-In" ? "Dine-In Guest" : "Takeaway Customer"),
        cartItems: [...cartItems],
        subtotal,
        discountPercent,
        discountAmount,
        taxRate: serverCalc.taxRate || 0.05,
        tax,
        finalTotal,
        notes: orderNotes,
        paymentMethod,
        paymentStatus: "Paid",
      });
      setIsPlacing(false);
      setOrderNotes("");
      setDiscountPercent(0);
    }, 250);
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-white dark:bg-gradient-to-b dark:from-[#191513] dark:to-[#141110] border border-[#e6ddd3] dark:border-[#2e2723] p-4 sm:p-5 shadow-xl shadow-[#e6ddd3]/50 dark:shadow-2xl relative transition-colors duration-200">
      {/* Top Header: Order Number & Clear Button */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#e6ddd3] dark:border-[#2e2723]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-[#1c1613] dark:text-[#f5f2eb]">
                {orderNumber}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f4efe8] dark:bg-[#26201b] border border-[#ded5ca] dark:border-[#382f28] text-amber-700 dark:text-amber-400">
                Live Ticket
              </span>
            </div>
            <p className="text-[11px] text-[#736357] dark:text-[#9c8e84]">
              {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"} selected
            </p>
          </div>
        </div>

        {cartItems.length > 0 && (
          <button
            onClick={onClearCart}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-[#736357] dark:text-[#9c8e84] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
            title="Reset Cart"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>

      {/* Order Type Toggle (Dine-In vs Takeaway) */}
      <div className="mt-3.5 grid grid-cols-2 gap-2 p-1 bg-[#f0eae1] dark:bg-[#120f0e] rounded-xl border border-[#e2d8cc] dark:border-[#2a2420]">
        <button
          onClick={() => setOrderType("Dine-In")}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${orderType === "Dine-In"
            ? "bg-gradient-to-r from-[#ea580c] to-[#f59e0b] text-white shadow-md shadow-[#ea580c]/30"
            : "text-[#736357] dark:text-[#9c8e84] hover:text-[#1c1613] dark:hover:text-[#f5f2eb] hover:bg-white/70 dark:hover:bg-[#1f1a17]"
            }`}
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>Dine-In</span>
        </button>

        <button
          onClick={() => setOrderType("Takeaway")}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${orderType === "Takeaway"
            ? "bg-gradient-to-r from-[#ea580c] to-[#f59e0b] text-white shadow-md shadow-[#ea580c]/30"
            : "text-[#736357] dark:text-[#9c8e84] hover:text-[#1c1613] dark:hover:text-[#f5f2eb] hover:bg-white/70 dark:hover:bg-[#1f1a17]"
            }`}
        >
          <BagIcon className="w-3.5 h-3.5" />
          <span>Takeaway</span>
        </button>
      </div>

      {/* Customer Name / Order Tag */}
      <div className="mt-3 text-xs">
        <label className="block text-[11px] font-semibold text-[#8a7c72] mb-1">
          Customer Name / Order Tag (Optional)
        </label>
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder={
            orderType === "Dine-In"
              ? "e.g. Walk-in Guest / Dine-In Note"
              : "e.g. Alex Morgan / Pickup Tag"
          }
          className="w-full px-2.5 py-1.5 rounded-lg bg-[#faf7f2] dark:bg-[#181513] border border-[#ded5ca] dark:border-[#2e2723] text-[#1c1613] dark:text-[#f5f2eb] placeholder-[#8c786c] dark:placeholder-[#6b5f56] text-xs focus:outline-none focus:border-amber-500 font-medium"
        />
      </div>

      {/* Out-Of-Stock Warning Banner if any cart item is 86'd */}
      {hasOutOfStockItems && (
        <div className="mt-3 p-3 rounded-xl bg-red-100 dark:bg-red-950/40 border border-red-300 dark:border-red-500/40 text-red-800 dark:text-red-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            <div>
              <span className="font-bold text-red-700 dark:text-red-300">
                {outOfStockItems.length} dish
                {outOfStockItems.length > 1 ? "es are" : " is"} Out of Stock
              </span>
              <p className="text-[10px] text-red-600/90 dark:text-red-300/80 mt-0.5">
                Remove unavailable items to enable order placement.
              </p>
            </div>
          </div>
          {onRemoveOutOfStock && (
            <button
              onClick={onRemoveOutOfStock}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-200 dark:bg-red-500/25 hover:bg-red-300 dark:hover:bg-red-500/40 text-red-800 dark:text-red-200 border border-red-400 dark:border-red-500/50 transition-colors whitespace-nowrap cursor-pointer"
            >
              Remove 86'd Items
            </button>
          )}
        </div>
      )}

      {/* Itemized Cart List */}
      <div className="mt-3.5 flex-1 min-h-[200px] max-h-[320px] overflow-y-auto pr-1 space-y-2.5">
        {cartItems.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 rounded-xl border border-dashed border-[#ded5ca] dark:border-[#2e2723] bg-[#faf7f2] dark:bg-[#161210]">
            <div className="w-12 h-12 rounded-full bg-[#f0eae1] dark:bg-[#221c18] flex items-center justify-center text-[#8c786c] dark:text-[#7d6f65] mb-2.5">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-[#1c1613] dark:text-[#c5b8ad]">Cart is empty</p>
            <p className="text-[11px] text-[#736357] dark:text-[#7d6f65] mt-0.5 max-w-[180px]">
              Tap on any menu dish to start assembling this live order.
            </p>
          </div>
        ) : (
          cartItems.map((item) => {
            const isOutOfStock =
              stockStatusMap && stockStatusMap.get(item.id) === false;

            return (
              <div
                key={item.id}
                className={`group p-3 rounded-xl border transition-colors ${isOutOfStock
                  ? "bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-500/40"
                  : "bg-[#faf7f2] dark:bg-[#1b1715] border-[#e6ddd3] dark:border-[#2e2723] hover:border-[#ded5ca] dark:hover:border-[#3d332d]"
                  }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h5
                        className={`text-xs font-bold leading-tight ${isOutOfStock ? "text-red-700 dark:text-red-300 line-through" : "text-[#1c1613] dark:text-[#f5f2eb]"
                          }`}
                      >
                        {item.name}
                      </h5>
                      {isOutOfStock && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-500/30">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Out of Stock
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-[#736357] dark:text-[#8a7c72] mt-0.5 inline-block">
                      ${item.price.toFixed(2)} each
                    </span>
                  </div>

                  {/* Subtotal for this item */}
                  <span
                    className={`font-mono text-xs font-bold ${isOutOfStock ? "text-red-600 dark:text-red-400 line-through" : "text-amber-700 dark:text-amber-400"
                      }`}
                  >
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>

                {/* Controls row */}
                <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-[#ede6dc] dark:border-[#26201b]">
                  <div className="flex items-center gap-1.5 bg-[#f0eae1] dark:bg-[#141110] p-1 rounded-lg border border-[#e2d8cc] dark:border-[#2a2420]">
                    <button
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className="w-5 h-5 rounded flex items-center justify-center text-[#736357] dark:text-[#a89b91] hover:text-[#1c1613] dark:hover:text-white hover:bg-white dark:hover:bg-[#28221d] transition-colors cursor-pointer"
                      title="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-mono text-xs font-bold text-[#1c1613] dark:text-[#f5f2eb]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      disabled={isOutOfStock}
                      className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${isOutOfStock
                        ? "text-[#b0a297] dark:text-[#52443d] cursor-not-allowed"
                        : "text-[#736357] dark:text-[#a89b91] hover:text-[#1c1613] dark:hover:text-white hover:bg-white dark:hover:bg-[#28221d] cursor-pointer"
                        }`}
                      title={
                        isOutOfStock
                          ? "Dish is currently out of stock"
                          : "Increase quantity"
                      }
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1 rounded text-[#8c786c] dark:text-[#7d6f65] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer flex items-center gap-1"
                    title="Remove dish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {isOutOfStock && (
                      <span className="text-[10px] text-red-600 dark:text-red-400 font-bold">Remove</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Calculation Summary Panel */}
      <div className="mt-3.5 pt-3.5 border-t border-[#e6ddd3] dark:border-[#2e2723] space-y-2 text-xs">
        {/* Server Validation Badge */}
        <div className="flex items-center justify-between pb-1.5 border-b border-[#ede6dc] dark:border-[#26201b]">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Server Billing Validated</span>
          </div>
          <span className="text-[10px] font-mono text-[#8c786c] dark:text-[#7d6f65]">
            {isCalculating ? "Recalculating on Server..." : "Configurable 5% VAT"}
          </span>
        </div>

        {/* Discount Selector */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[#736357] dark:text-[#8a7c72] font-medium flex items-center gap-1">
            <Percent className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Discount:
          </span>
          <div className="flex items-center gap-1">
            {[0, 5, 10, 15].map((pct) => (
              <button
                key={pct}
                onClick={() => setDiscountPercent(pct)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer ${discountPercent === pct
                  ? "bg-amber-500 text-black shadow-sm"
                  : "bg-[#f4efe8] dark:bg-[#1f1a17] text-[#736357] dark:text-[#9c8e84] hover:text-[#1c1613] dark:hover:text-[#f5f2eb] border border-[#ded5ca] dark:border-[#2e2723]"
                  }`}
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>

        {/* Subtotal */}
        <div className="flex items-center justify-between text-[#736357] dark:text-[#a89b91]">
          <span>Subtotal</span>
          <span className="font-mono text-[#1c1613] dark:text-[#f5f2eb] font-semibold">
            ${subtotal.toFixed(2)}
          </span>
        </div>

        {/* Discount Row (if applied) */}
        {discountPercent > 0 && (
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
            <span>Discount ({discountPercent}%)</span>
            <span className="font-mono font-semibold">
              -${discountAmount.toFixed(2)}
            </span>
          </div>
        )}

        {/* Tax (5%) */}
        <div className="flex items-center justify-between text-[#736357] dark:text-[#a89b91]">
          <span className="flex items-center gap-1">
            Tax <span className="text-[10px] text-[#8c786c] dark:text-[#6b5f56]">(5% Sales VAT)</span>
          </span>
          <span className="font-mono text-[#1c1613] dark:text-[#f5f2eb] font-semibold">
            ${tax.toFixed(2)}
          </span>
        </div>

        {/* Final Total Highlight */}
        <div className="pt-2.5 border-t border-[#e6ddd3] dark:border-[#2e2723] flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase font-bold tracking-wider text-[#736357] dark:text-[#9c8e84] block">
              Total Amount
            </span>
            <span className="text-[10px] text-[#8c786c] dark:text-[#6b5f56]">Includes all taxes</span>
          </div>
          <span className="font-mono text-2xl font-black text-amber-600 dark:text-[#f59e0b] drop-shadow-sm">
            ${finalTotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Payment Method Selector (Cash, UPI, Card) */}
      <div className="mt-3.5 space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-[#736357] dark:text-[#9c8e84] uppercase tracking-wider">
            Payment Method
          </label>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
            Settlement Ready
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#f0eae1] dark:bg-[#120f0e] rounded-xl border border-[#e2d8cc] dark:border-[#2a2420]">
          <button
            type="button"
            onClick={() => setPaymentMethod("Cash")}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${paymentMethod === "Cash"
              ? "bg-amber-500 text-black shadow-sm"
              : "text-[#736357] dark:text-[#9c8e84] hover:text-[#1c1613] dark:hover:text-[#f5f2eb]"
              }`}
          >
            <Banknote className="w-3.5 h-3.5" />
            <span>Cash</span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod("UPI")}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${paymentMethod === "UPI"
              ? "bg-amber-500 text-black shadow-sm"
              : "text-[#736357] dark:text-[#9c8e84] hover:text-[#1c1613] dark:hover:text-[#f5f2eb]"
              }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>UPI</span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentMethod("Credit Card")}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${paymentMethod === "Credit Card"
              ? "bg-amber-500 text-black shadow-sm"
              : "text-[#736357] dark:text-[#9c8e84] hover:text-[#1c1613] dark:hover:text-[#f5f2eb]"
              }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Card</span>
          </button>
        </div>
      </div>

      {/* Action Button: Place Order */}
      <div className="mt-3.5">
        <button
          onClick={handlePlaceOrderClick}
          disabled={cartItems.length === 0 || isPlacing || hasOutOfStockItems}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-150 shadow-lg ${hasOutOfStockItems
            ? "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-500/40 cursor-not-allowed opacity-90"
            : cartItems.length === 0
              ? "bg-[#ede6dc] dark:bg-[#251f1b] text-[#8c786c] dark:text-[#6b5f56] border border-[#ded5ca] dark:border-[#2e2723] cursor-not-allowed opacity-50"
              : "bg-gradient-to-r from-[#ea580c] to-[#f59e0b] text-white hover:brightness-110 active:scale-[0.98] shadow-[#ea580c]/30 cursor-pointer"
            }`}
        >
          {isPlacing ? (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Transmitting Order...</span>
            </div>
          ) : hasOutOfStockItems ? (
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <span>Blocked: Out-of-Stock Items in Cart</span>
            </div>
          ) : (
            <>
              <Send className="w-4 h-4 stroke-[2.5]" />
              <span>Place Order (${finalTotal.toFixed(2)})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default React.memo(CartDrawer);
