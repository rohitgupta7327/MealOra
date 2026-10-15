import React, { useState, useMemo } from "react";
import {
  Clock,
  CheckCircle2,
  Flame,
  Receipt,
} from "lucide-react";

const STATUS_OPTIONS = ["All", "Pending", "Preparing", "Ready", "Completed"];

function RecentOrdersTable({
  orders = [],
  onViewOrder,
}) {
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredOrders = useMemo(() => {
    if (statusFilter === "All") return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending
          </span>
        );
      case "Preparing":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500/15 text-orange-700 dark:text-orange-400 border border-orange-500/30">
            <Flame className="w-3 h-3 text-orange-600 dark:text-orange-400 animate-bounce" />
            Preparing
          </span>
        );
      case "Ready":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Ready
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#f4efe8] dark:bg-[#26201b] text-[#736357] dark:text-[#9c8e84] border border-[#ded5ca] dark:border-[#382f28]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8c786c] dark:bg-[#9c8e84]" />
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#f4efe8] dark:bg-[#221c18] text-[#736357] dark:text-[#9c8e84]">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-gradient-to-b dark:from-[#191513] dark:to-[#141110] border border-[#e6ddd3] dark:border-[#2e2723] p-5 shadow-md shadow-[#e6ddd3]/40 dark:shadow-xl transition-colors duration-200">
      {/* Table Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e6ddd3] dark:border-[#2e2723]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#f4efe8] dark:bg-[#251f1a] border border-[#ded5ca] dark:border-[#382f28] flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#1c1613] dark:text-[#f5f2eb]">
              Recent Live Orders
            </h3>
            <p className="text-xs text-[#736357] dark:text-[#9c8e84]">
              Real-time synchronization across POS and kitchen display
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {STATUS_OPTIONS.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? "bg-amber-500 text-black font-bold shadow-sm"
                  : "bg-[#f4efe8] dark:bg-[#1f1a17] text-[#736357] dark:text-[#9c8e84] hover:text-[#1c1613] dark:hover:text-[#f5f2eb] border border-[#ded5ca] dark:border-[#2e2723]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto mt-2">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#e6ddd3] dark:border-[#2e2723] text-[#736357] dark:text-[#8a7c72] uppercase font-bold tracking-wider text-[11px]">
              <th className="py-3 px-3">Order ID</th>
              <th className="py-3 px-3">Type & Customer</th>
              <th className="py-3 px-3">Items Summary</th>
              <th className="py-3 px-3">Total</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ede6dc] dark:divide-[#241e1a]">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-[#8c786c] dark:text-[#7d6f65]">
                  No orders found matching the filter "{statusFilter}".
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-[#faf7f2] dark:hover:bg-[#1f1a17]/60 transition-colors group"
                >
                  {/* Order ID */}
                  <td className="py-3.5 px-3 font-mono font-bold text-[#1c1613] dark:text-[#f5f2eb]">
                    <span
                      className="text-amber-700 dark:text-amber-400 group-hover:underline cursor-pointer"
                      onClick={() => onViewOrder(order)}
                    >
                      {order.id}
                    </span>
                    <span className="block text-[10px] text-[#8c786c] dark:text-[#7d6f65] font-sans font-normal mt-0.5">
                      {order.time || "Just now"}
                    </span>
                  </td>

                  {/* Type & Customer */}
                  <td className="py-3.5 px-3">
                    <div className="font-semibold text-[#1c1613] dark:text-[#f5f2eb]">
                      {order.customer || order.type}
                    </div>
                    <span className="inline-block text-[10px] text-[#736357] dark:text-[#9c8e84] bg-[#f4efe8] dark:bg-[#221c18] px-1.5 py-0.2 rounded mt-0.5 border border-[#ded5ca] dark:border-[#332a24]">
                      {order.type}
                    </span>
                  </td>

                  {/* Items Count & Summary */}
                  <td className="py-3.5 px-3 max-w-[240px]">
                    <span className="font-semibold text-[#1c1613] dark:text-[#f5f2eb]">
                      {order.itemsCount} {order.itemsCount === 1 ? "item" : "items"}
                    </span>
                    <p className="text-[11px] text-[#736357] dark:text-[#8a7c72] truncate mt-0.5">
                      {order.itemsSummary ||
                        order.items?.map((i) => `${i.quantity}x ${i.name}`).join(", ") ||
                        "Standard Selection"}
                    </p>
                  </td>

                  {/* Total Amount & Recorded Payment Method */}
                  <td className="py-3.5 px-3">
                    <span className="font-mono text-sm font-bold text-amber-700 dark:text-amber-400">
                      ₹{order.total.toFixed(2)}
                    </span>
                    <span className="block text-[10px] text-[#736357] dark:text-[#9c8e84] font-medium mt-0.5">
                      {order.paymentMethod || "Cash"}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-3">
                    {getStatusBadge(order.status)}
                  </td>

                  {/* Action Button: View / Pay */}
                  <td className="py-3.5 px-3 text-right">
                    <button
                      onClick={() => onViewOrder(order)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#f4efe8] dark:bg-[#26201b] hover:bg-gradient-to-r hover:from-[#ea580c] hover:to-[#f59e0b] text-[#1c1613] dark:text-[#f5f2eb] hover:text-white border border-[#ded5ca] dark:border-[#382f28] hover:border-transparent transition-all duration-150 cursor-pointer shadow-sm group-hover:border-amber-500/40"
                    >
                      <Receipt className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 group-hover:text-white" />
                      <span>View / Pay</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default React.memo(RecentOrdersTable);
