import React, { useState } from "react";
import {
  X,
  Receipt,
  Printer,
  Banknote,
  QrCode,
  CreditCard,
} from "lucide-react";

export default function OrderModal({ order, onClose, onUpdateStatus, onUpdatePayment }) {
  const [isEditingPayment, setIsEditingPayment] = useState(false);

  if (!order) return null;

  const nextStatusMap = {
    Pending: "Preparing",
    Preparing: "Ready",
    Ready: "Completed",
    Completed: null,
  };

  const nextStatus = nextStatusMap[order.status];
  const currentPaymentMethod = order.paymentMethod || "Cash";
  const isPaid = order.paymentStatus === "Paid" || order.paymentMethod !== "Pending At POS";

  const handleSelectPaymentMethod = (method) => {
    if (onUpdatePayment) {
      onUpdatePayment(order.id, method, "Paid");
    }
    setIsEditingPayment(false);
  };

  const getPaymentIcon = (method) => {
    if (method === "Cash") return <Banknote className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
    if (method === "UPI") return <QrCode className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
    return <CreditCard className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-[#181412] border border-[#e6ddd3] dark:border-[#382f28] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#e6ddd3] dark:border-[#2e2723] bg-[#faf7f2] dark:bg-[#1d1815]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-base font-bold text-[#1c1613] dark:text-[#f5f2eb]">
                  {order.id}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#f4efe8] dark:bg-[#26201b] border border-[#ded5ca] dark:border-[#382f28] text-amber-700 dark:text-amber-400">
                  {order.type}
                </span>
              </div>
              <p className="text-xs text-[#736357] dark:text-[#9c8e84]">
                {order.customer} • {order.time || "Recently placed"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#736357] dark:text-[#9c8e84] hover:text-[#1c1613] dark:hover:text-[#f5f2eb] hover:bg-[#f0eae1] dark:hover:bg-[#251f1a] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Receipt */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Status Tracker */}
          <div className="p-3 rounded-xl bg-[#faf7f2] dark:bg-[#13100f] border border-[#ded5ca] dark:border-[#26201b] flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#736357] dark:text-[#8a7c72]">Current Status:</span>
              <span className="font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                {order.status}
              </span>
            </div>

            {nextStatus && (
              <button
                onClick={() => onUpdateStatus(order.id, nextStatus)}
                className="px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-[#ea580c] to-[#f59e0b] text-white hover:brightness-110 transition-all cursor-pointer shadow-sm"
              >
                Advance to {nextStatus} &rarr;
              </button>
            )}
          </div>

          {/* Items breakdown */}
          <div>
            <h4 className="text-xs font-bold text-[#736357] dark:text-[#8a7c72] uppercase tracking-wider mb-2">
              Order Breakdown
            </h4>
            <div className="rounded-xl border border-[#ded5ca] dark:border-[#2a2420] bg-white dark:bg-[#151210] divide-y divide-[#ede6dc] dark:divide-[#221c18] overflow-hidden">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded bg-[#f4efe8] dark:bg-[#26201b] font-mono text-amber-700 dark:text-amber-400 font-bold flex items-center justify-center text-[11px]">
                        {item.quantity}x
                      </span>
                      <div>
                        <span className="font-semibold text-[#1c1613] dark:text-[#f5f2eb]">
                          {item.name}
                        </span>
                        <span className="block text-[10px] text-[#8c786c] dark:text-[#7d6f65] font-mono">
                          ${item.price.toFixed(2)} each
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-[#1c1613] dark:text-[#f5f2eb]">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-3 text-xs text-[#736357] dark:text-[#9c8e84]">
                  {order.itemsSummary || "Dishes prepared as per chef order ticket"}
                </div>
              )}
            </div>
          </div>

          {/* Payment & Financial summary */}
          <div className="p-3.5 rounded-xl bg-[#faf7f2] dark:bg-[#13100f] border border-[#ded5ca] dark:border-[#2a2420] space-y-2 text-xs">
            <div className="flex items-center justify-between text-[#736357] dark:text-[#8a7c72]">
              <span>Payment Method</span>
              <div className="flex items-center gap-2">
                <span className="text-[#1c1613] dark:text-[#f5f2eb] font-semibold flex items-center gap-1">
                  {getPaymentIcon(currentPaymentMethod)}
                  {currentPaymentMethod}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  isPaid
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                }`}>
                  {isPaid ? "Paid / Settled" : "Pending Payment"}
                </span>
                <button
                  onClick={() => setIsEditingPayment(!isEditingPayment)}
                  className="text-amber-700 dark:text-amber-400 underline font-semibold text-[11px] cursor-pointer"
                >
                  {isEditingPayment ? "Cancel" : "Change"}
                </button>
              </div>
            </div>

            {/* Quick Payment Method Selector inside Modal */}
            {isEditingPayment && (
              <div className="pt-2 border-t border-[#ede6dc] dark:border-[#26201b] space-y-1.5 animate-in fade-in duration-150">
                <span className="text-[10px] uppercase font-bold text-[#8a7c72]">
                  Select New Payment Settlement Method:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {["Cash", "UPI", "Credit Card"].map((m) => (
                    <button
                      key={m}
                      onClick={() => handleSelectPaymentMethod(m)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                        currentPaymentMethod === m
                          ? "bg-amber-500 text-black shadow-sm"
                          : "bg-white dark:bg-[#201a16] text-[#1c1613] dark:text-[#f5f2eb] border border-[#ded5ca] dark:border-[#382f28]"
                      }`}
                    >
                      {getPaymentIcon(m)}
                      <span>{m}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between text-[#736357] dark:text-[#8a7c72] pt-1">
              <span>Total Price</span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-base">
                ${order.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#e6ddd3] dark:border-[#2e2723] bg-[#faf7f2] dark:bg-[#1d1815] flex items-center justify-between gap-3">
          <button
            onClick={() => {
              window.print();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#736357] dark:text-[#a89b91] hover:text-[#1c1613] dark:hover:text-[#f5f2eb] bg-white dark:bg-[#221c18] border border-[#ded5ca] dark:border-[#332a24] hover:border-amber-500/40 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Thermal Slip</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
