import React from "react";
import {
  TrendingUp,
  CreditCard,
  Award,
  Clock,
  ArrowUpRight,
  PieChart,
  ShoppingBag,
  CheckCircle2,
} from "lucide-react";

export default function DashboardOverview({ orders = [], menuItems = [] }) {
  const topDishes = [
    { name: "Gourmet Cheeseburger", orders: 48, revenue: 600.0, category: "Burgers" },
    { name: "Wood-Fired Margherita", orders: 36, revenue: 522.0, category: "Mains" },
    { name: "Grilled Ribeye Steak", orders: 22, revenue: 572.0, category: "Mains" },
    { name: "Smoked Old Fashioned", orders: 30, revenue: 330.0, category: "Drinks" },
    { name: "Crispy Truffle Fries", orders: 42, revenue: 273.0, category: "Sides" },
  ];

  const channelStats = [
    { channel: "Dine-In Orders", percentage: "58%", orders: "70 orders", amount: "$861.50" },
    { channel: "Takeaway Orders", percentage: "42%", orders: "50 orders", amount: "$624.00" },
  ];

  const paymentBreakdown = [
    { method: "Credit Card / NFC", share: "64%", transactions: "77 orders" },
    { method: "Apple Pay / Wallet", share: "24%", transactions: "29 orders" },
    { method: "Cash Settled", share: "12%", transactions: "14 orders" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-white dark:bg-gradient-to-r dark:from-[#211a16] dark:via-[#1c1815] dark:to-[#171412] border border-[#e6ddd3] dark:border-[#2e2723] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm dark:shadow-none transition-colors duration-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30">
              Executive Shift Summary
            </span>
            <span className="text-xs text-[#736357] dark:text-[#9c8e84]">Peak Service Velocity</span>
          </div>
          <h2 className="text-xl font-extrabold text-[#1c1613] dark:text-[#f5f2eb] mt-1.5 font-brand">
            Evening Dining Performance
          </h2>
          <p className="text-xs text-[#736357] dark:text-[#9c8e84] mt-0.5">
            Average customer satisfaction score: 4.9/5 • Fast ticket turnaround: 12 min
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-[#f4efe8] dark:bg-[#141110] border border-[#ded5ca] dark:border-[#2e2723] text-right">
            <span className="block text-[10px] uppercase font-semibold text-[#8a7c72]">
              Average Ticket
            </span>
            <span className="font-mono text-base font-bold text-amber-700 dark:text-amber-400">
              $38.45
            </span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-[#f4efe8] dark:bg-[#141110] border border-[#ded5ca] dark:border-[#2e2723] text-right">
            <span className="block text-[10px] uppercase font-semibold text-[#8a7c72]">
              Fulfillment Rate
            </span>
            <span className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
              98.5% (On-Time)
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Dishes */}
        <div className="rounded-2xl bg-white dark:bg-[#181412] border border-[#e6ddd3] dark:border-[#2e2723] p-5 shadow-sm dark:shadow-lg">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#ede6dc] dark:border-[#2e2723]">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h3 className="font-bold text-sm text-[#1c1613] dark:text-[#f5f2eb]">
                Top Culinary Sellers (Today)
              </h3>
            </div>
            <span className="text-[11px] text-[#736357] dark:text-[#8a7c72]">Ranked by Volume</span>
          </div>

          <div className="mt-3 divide-y divide-[#ede6dc] dark:divide-[#241e1a]">
            {topDishes.map((dish, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#f4efe8] dark:bg-[#26201b] border border-[#ded5ca] dark:border-[#382f28] text-amber-700 dark:text-amber-400 font-mono font-bold flex items-center justify-center text-[10px]">
                    #{i + 1}
                  </span>
                  <div>
                    <span className="font-bold text-[#1c1613] dark:text-[#f5f2eb]">{dish.name}</span>
                    <span className="block text-[10px] text-[#8c786c] dark:text-[#7d6f65]">
                      {dish.category}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono font-bold text-[#1c1613] dark:text-[#f5f2eb]">
                    {dish.orders} orders
                  </span>
                  <span className="block font-mono text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
                    ${dish.revenue.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Channels & Payment Breakdown */}
        <div className="rounded-2xl bg-white dark:bg-[#181412] border border-[#e6ddd3] dark:border-[#2e2723] p-5 shadow-sm dark:shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 border-b border-[#ede6dc] dark:border-[#2e2723]">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h3 className="font-bold text-sm text-[#1c1613] dark:text-[#f5f2eb]">
                  Order Channels & Settlements
                </h3>
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Live POS Mix
              </span>
            </div>

            {/* Dine-In vs Takeaway Cards */}
            <div className="mt-3.5 grid grid-cols-2 gap-3">
              {channelStats.map((c, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-[#ded5ca] dark:border-[#2e2723] bg-[#faf7f2] dark:bg-[#1f1a17]"
                >
                  <div className="text-[11px] font-semibold text-[#736357] dark:text-[#8a7c72]">
                    {c.channel}
                  </div>
                  <div className="text-lg font-mono font-bold text-amber-700 dark:text-amber-400 mt-1">
                    {c.percentage}
                  </div>
                  <div className="text-[10px] text-[#8c786c] dark:text-[#7d6f65] font-mono mt-0.5">
                    {c.orders} • {c.amount}
                  </div>
                </div>
              ))}
            </div>

            {/* Payment methods list */}
            <div className="mt-4 pt-3.5 border-t border-[#ede6dc] dark:border-[#2a2420] space-y-2">
              <span className="text-[11px] uppercase font-bold text-[#8a7c72] tracking-wider block">
                Settlement Methods
              </span>
              {paymentBreakdown.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1"
                >
                  <span className="text-[#1c1613] dark:text-[#f5f2eb] font-medium flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    {p.method}
                  </span>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-[#736357] dark:text-[#8a7c72]">{p.transactions}</span>
                    <span className="font-bold text-amber-700 dark:text-amber-400">{p.share}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
