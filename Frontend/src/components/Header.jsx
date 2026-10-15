import React, { useState, useEffect } from "react";
import {
  UtensilsCrossed,
  Clock,
  LogOut,
  LayoutDashboard,
  Store,
  ChefHat,
  MenuSquare,
  Sun,
  Moon,
  Lock,
  Users,
} from "lucide-react";

/**
 * Isolated LiveClock Component
 * Isolates the 1000ms timer state to its own micro-subtree.
 */
function LiveClock() {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#f0eae1] dark:bg-[#1a1613] border border-[#e2d8cc] dark:border-[#2e2723] text-xs font-mono text-[#5c4e43] dark:text-[#c5b8ad]">
      <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
      <span className="font-semibold tracking-wider">{currentTime || "--:--:--"}</span>
    </div>
  );
}

const NAV_ITEMS = [
  { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "POS Terminal", label: "POS Terminal", icon: Store },
  {
    id: "Kitchen Orders",
    label: "Kitchen Orders",
    icon: ChefHat,
    hasBadge: true,
  },
  { id: "Admin Menu", label: "Admin Menu", icon: MenuSquare, adminOnly: true },
];

function Header({
  activeTab,
  setActiveTab,
  kitchenOrdersCount = 0,
  theme = "dark",
  onToggleTheme,
  currentUser,
  onLogout,
  onOpenTeamModal,
}) {
  const isDark = theme === "dark";
  const isAdmin = currentUser?.role === "admin";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#e6ddd3] dark:border-[#2e2723] bg-[#faf7f2]/95 dark:bg-[#141110]/95 backdrop-blur-md px-4 sm:px-6 py-2.5 transition-colors duration-200">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
        
        {/* Left: Brand & Tagline + Mobile/Tablet Quick Theme Switcher */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab("Dashboard")}
            title="Mealora Restaurant Management Terminal"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#ea580c] flex items-center justify-center shadow-lg shadow-[#ea580c]/25 group-hover:scale-105 transition-transform duration-150 shrink-0">
              <UtensilsCrossed className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-brand text-2xl font-extrabold tracking-tight text-[#1c1613] dark:text-[#f5f2eb]">
                  Mealora
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30 uppercase">
                  POS PRO
                </span>
              </div>
              <p className="text-xs text-[#736357] dark:text-[#9c8e84] font-medium tracking-wide">
                Better Meals. Better Moments.
              </p>
            </div>
          </div>

          {/* Mobile/Tablet Theme Button & Staff Badge */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onToggleTheme}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#f0eae1] dark:bg-[#221c18] border border-[#e2d8cc] dark:border-[#2e2723] text-amber-700 dark:text-amber-400 font-bold text-xs shadow-sm cursor-pointer"
              title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-amber-700" />}
              <span>{isDark ? "Light" : "Dark"}</span>
            </button>
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${
                isAdmin
                  ? "bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400"
                  : "bg-blue-500/15 border-blue-500/30 text-blue-700 dark:text-blue-400"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isAdmin ? "bg-amber-500" : "bg-blue-500"} animate-pulse`}></span>
              {isAdmin ? "Admin" : "Staff"}
            </span>
            {isAdmin && (
              <button
                onClick={onOpenTeamModal}
                className="p-1.5 rounded-lg text-amber-700 dark:text-amber-400 bg-amber-500/15 border border-amber-500/30 cursor-pointer"
                title="Manage Team Members (Admin Only)"
              >
                <Users className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-[#736357] dark:text-[#a89b91] hover:text-red-500 bg-[#f0eae1] dark:bg-[#221c18] border border-[#e2d8cc] dark:border-[#2e2723] cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Middle: Navigation Links / Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto max-w-full p-1 bg-[#f0eae1] dark:bg-[#1a1613] rounded-xl border border-[#e2d8cc] dark:border-[#2e2723]/80">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isItemLocked = item.adminOnly && !isAdmin;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isItemLocked) {
                    alert("🔒 Access Restricted: The Admin Menu is only accessible to users with the 'Admin' role.");
                    return;
                  }
                  setActiveTab(item.id);
                }}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-[#ea580c] to-[#f59e0b] text-white shadow-md shadow-[#ea580c]/25 font-bold"
                    : isItemLocked
                    ? "text-[#a89b91]/50 dark:text-[#7d6f65]/60 hover:bg-black/5 dark:hover:bg-white/5 opacity-70"
                    : "text-[#736357] dark:text-[#a89b91] hover:text-[#1c1613] dark:hover:text-[#f5f2eb] hover:bg-white/70 dark:hover:bg-[#251f1a]"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : isItemLocked ? "text-amber-500/60" : "text-[#8c786c] dark:text-[#9c8e84]"}`} />
                <span>{item.label}</span>
                {item.hasBadge && kitchenOrdersCount > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-black/30 text-white"
                        : "bg-amber-500/20 text-amber-800 dark:text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {kitchenOrdersCount}
                  </span>
                )}
                {isItemLocked && (
                  <span className="ml-1 px-1 py-0.2 rounded text-[9px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                    <Lock className="w-2.5 h-2.5" /> Admin
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right: Theme Toggle, Isolated Live Clock, Staff Profile Chip, Logout */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Prominent Theme Toggle Button */}
          <button
            onClick={onToggleTheme}
            id="theme-toggle-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1e1916] border border-[#ded5ca] dark:border-[#2e2723] hover:border-amber-500 text-[#1c1613] dark:text-[#f5f2eb] shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer"
            title={isDark ? "Switch to Warm Light Dining Theme" : "Switch to Warm Dark Dining Theme"}
            aria-label="Toggle theme mode"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                <span className="text-xs font-bold text-amber-400">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-amber-700" />
                <span className="text-xs font-bold text-amber-800">Dark Mode</span>
              </>
            )}
          </button>

          {/* Live Clock */}
          <LiveClock />

          {/* Admin-only Team Management Button */}
          {isAdmin && (
            <button
              onClick={onOpenTeamModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 hover:border-amber-500 text-amber-800 dark:text-amber-400 font-bold text-xs shadow-sm hover:scale-[1.02] transition-all cursor-pointer"
              title="Add New Member & Manage Staff (Admin Only)"
            >
              <Users className="w-3.5 h-3.5 text-amber-500" />
              <span>Team & Members</span>
            </button>
          )}

          {/* Staff Profile Chip */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#1e1916] border border-[#e2d8cc] dark:border-[#2e2723] hover:border-amber-500/40 transition-colors shadow-sm">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-black ${
              isAdmin
                ? "bg-gradient-to-tr from-amber-500 to-orange-500"
                : "bg-gradient-to-tr from-blue-400 to-indigo-500 text-white"
            }`}>
              {currentUser?.avatar || (currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : "JD")}
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-[#1c1613] dark:text-[#f5f2eb] leading-tight">
                {currentUser?.name || "Chef Julian"}
              </div>
              <div className={`text-[10px] font-semibold flex items-center gap-1 ${
                isAdmin
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-blue-600 dark:text-blue-400"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isAdmin ? "bg-emerald-500" : "bg-blue-500"} animate-pulse`}></span>
                {isAdmin ? "Admin (Full Access)" : "Staff (POS Terminal)"}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#736357] dark:text-[#a89b91] hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 border border-[#e2d8cc] dark:border-[#2e2723] hover:border-red-500/30 transition-all duration-150 cursor-pointer"
            title="End Shift & Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Logout</span>
          </button>
        </div>

      </div>
    </header>
  );
}

export default React.memo(Header);
