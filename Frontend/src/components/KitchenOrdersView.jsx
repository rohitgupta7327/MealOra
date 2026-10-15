import React from "react";
import {
  ChefHat,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  Utensils,
  AlertTriangle,
} from "lucide-react";

export default function KitchenOrdersView({ orders = [], onUpdateStatus }) {
  const activeOrders = orders.filter((o) => o.status !== "Completed");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-white dark:bg-[#191513] border border-[#e6ddd3] dark:border-[#2e2723] shadow-sm dark:shadow-none transition-colors duration-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#1c1613] dark:text-[#f5f2eb]">
              Kitchen Display System (KDS)
            </h2>
            <p className="text-xs text-[#736357] dark:text-[#9c8e84]">
              Real-time cook station tickets • Priority queue for chefs & runners
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#f4efe8] dark:bg-[#26201b] text-orange-700 dark:text-orange-400 border border-orange-500/30">
            {activeOrders.length} Tickets in Progress
          </span>
        </div>
      </div>

      {/* Tickets Grid */}
      {activeOrders.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#161311] border border-[#e6ddd3] dark:border-[#2e2723] shadow-sm dark:shadow-none">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#1c1613] dark:text-[#f5f2eb]">All Orders Cleared!</h3>
          <p className="text-xs text-[#736357] dark:text-[#9c8e84] mt-1">
            Kitchen queue is currently empty. New POS tickets will appear here instantly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeOrders.map((order) => {
            const isPending = order.status === "Pending";
            const isPreparing = order.status === "Preparing";
            const isReady = order.status === "Ready";

            return (
              <div
                key={order.id}
                className="rounded-2xl bg-white dark:bg-[#1a1613] border border-[#e6ddd3] dark:border-[#2e2723] p-4 flex flex-col justify-between hover:border-amber-500/40 transition-all shadow-md shadow-[#e6ddd3]/40 dark:shadow-lg"
              >
                {/* Ticket Top */}
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#ede6dc] dark:border-[#29221e]">
                    <div>
                      <span className="font-mono text-base font-bold text-amber-700 dark:text-amber-400">
                        {order.id}
                      </span>
                      <div className="text-xs font-semibold text-[#1c1613] dark:text-[#f5f2eb]">
                        {order.customer}
                      </div>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        isPending
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
                          : isPreparing
                          ? "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30"
                          : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  {/* Items Ticket */}
                  <div className="py-3 space-y-2">
                    {order.items && order.items.length > 0 ? (
                      order.items.map((it, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-[#f4efe8] dark:bg-[#28211b] font-mono text-amber-700 dark:text-amber-400 font-bold flex items-center justify-center text-[11px]">
                              {it.quantity}x
                            </span>
                            <span className="font-bold text-[#1c1613] dark:text-[#f5f2eb]">
                              {it.name}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#736357] dark:text-[#c5b8ad]">
                        {order.itemsSummary}
                      </p>
                    )}
                  </div>
                </div>

                {/* Ticket Actions */}
                <div className="pt-3 border-t border-[#ede6dc] dark:border-[#29221e] flex items-center justify-between gap-2">
                  <span className="text-[11px] text-[#736357] dark:text-[#8a7c72] flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                    {order.time || "Just now"}
                  </span>

                  {isPending && (
                    <button
                      onClick={() => onUpdateStatus(order.id, "Preparing")}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>Start Cook</span>
                    </button>
                  )}

                  {isPreparing && (
                    <button
                      onClick={() => onUpdateStatus(order.id, "Ready")}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Ready</span>
                    </button>
                  )}

                  {isReady && (
                    <button
                      onClick={() => onUpdateStatus(order.id, "Completed")}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#ede6dc] dark:bg-[#2e2621] hover:bg-emerald-700 text-emerald-800 dark:text-emerald-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Complete & Serve</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
