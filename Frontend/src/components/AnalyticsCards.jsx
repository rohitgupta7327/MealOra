import React from "react";
import {
  ShoppingBag,
  CheckCircle2,
  DollarSign,
  Flame,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";

function AnalyticsCards({
  totalOrders = 45,
  completedOrders = 120,
  dailyRevenue = 1485.5,
  activeKitchenOrders = 8,
}) {
  const cards = [
    {
      title: "Total Orders",
      value: totalOrders.toString(),
      trend: "+12.4% today",
      trendPositive: true,
      icon: ShoppingBag,
      accentColor: "from-amber-500/20 to-orange-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
      borderColor: "hover:border-amber-500/40",
      badgeText: "Shift Total",
    },
    {
      title: "Completed Orders",
      value: completedOrders.toString(),
      trend: "98.5% on-time",
      trendPositive: true,
      icon: CheckCircle2,
      accentColor: "from-emerald-500/20 to-teal-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      borderColor: "hover:border-emerald-500/40",
      badgeText: "Delivered",
    },
    {
      title: "Daily Sales Revenue",
      value: `$${dailyRevenue.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      trend: "+18.2% vs target",
      trendPositive: true,
      icon: DollarSign,
      accentColor: "from-amber-500/20 to-yellow-500/10",
      iconColor: "text-amber-700 dark:text-amber-300",
      borderColor: "hover:border-amber-400/40",
      badgeText: "Gross Revenue",
    },
    {
      title: "Active Kitchen Orders",
      value: `${activeKitchenOrders} Pending`,
      trend: "Avg ticket: 14m",
      trendPositive: false,
      icon: Flame,
      accentColor: "from-orange-500/20 to-red-500/10",
      iconColor: "text-orange-600 dark:text-orange-400",
      borderColor: "hover:border-orange-500/40",
      badgeText: "In Kitchen",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`group relative overflow-hidden rounded-2xl bg-white dark:bg-gradient-to-b dark:from-[#1c1815] dark:to-[#161311] border border-[#e6ddd3] dark:border-[#2e2723] p-4.5 transition-all duration-300 hover:-translate-y-0.5 shadow-sm shadow-[#e6ddd3]/40 dark:shadow-none hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/50 ${card.borderColor}`}
          >
            {/* Subtle glow accent in corner */}
            <div
              className={`absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br ${card.accentColor} blur-2xl opacity-60 pointer-events-none group-hover:scale-125 transition-transform duration-500`}
            />

            <div className="flex items-start justify-between relative z-10">
              <span className="text-xs font-semibold tracking-wide text-[#736357] dark:text-[#9c8e84] uppercase">
                {card.title}
              </span>
              <div
                className={`w-9 h-9 rounded-xl bg-[#f4efe8] dark:bg-[#231d19] border border-[#ded5ca] dark:border-[#332a24] flex items-center justify-center ${card.iconColor} group-hover:scale-110 transition-transform duration-200`}
              >
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>

            <div className="mt-2.5 relative z-10">
              <div className="font-mono text-2xl lg:text-3xl font-bold tracking-tight text-[#1c1613] dark:text-[#f5f2eb]">
                {card.value}
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-[#ede6dc] dark:border-[#2a231f]/70 flex items-center justify-between text-xs relative z-10">
              <span className="text-[#736357] dark:text-[#a89b91] flex items-center gap-1 font-medium">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                {card.trend}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f4efe8] dark:bg-[#26201b] text-amber-800 dark:text-amber-300/80 border border-[#ded5ca] dark:border-[#382f28]">
                {card.badgeText}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default React.memo(AnalyticsCards);
