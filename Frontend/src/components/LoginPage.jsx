import React, { useState, useEffect } from "react";
import {
  UtensilsCrossed,
  Lock,
  Mail,
  Shield,
  Eye,
  EyeOff,
  LogIn,
  CheckCircle2,
  AlertCircle,
  Database,
  KeyRound,
  Sun,
  Moon,
} from "lucide-react";
import authService from "../services/authService";

const CURRENT_YEAR = new Date().getFullYear();

export default function LoginPage({ onLoginSuccess, theme = "dark", onToggleTheme }) {
  const isDark = theme === "dark";

  // Form State - Empty initial values for fresh user input
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);

  // Ensure address bar shows /login when viewing login page
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.history.replaceState({}, "", "/login");
    }
  }, []);

  // Check backend & MongoDB status on mount
  useEffect(() => {
    let mounted = true;
    authService.getSystemStatus().then((status) => {
      if (mounted && status) {
        setSystemStatus(status);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const response = await authService.login(email, password);
      setSuccessMsg("Welcome back, " + response.user.name + " (" + response.user.role.toUpperCase() + ")!");
      setTimeout(() => {
        onLoginSuccess(response.user, response.token);
      }, 500);
    } catch (err) {
      setError(err.message || "Authentication failed. Please verify your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-[#f8f5ee] dark:bg-[#0e0c0b] text-[#1c1613] dark:text-[#f5f2eb] transition-colors duration-200 relative overflow-hidden font-sans">
      
      {/* Ambient Luxury Lighting Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 dark:bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-orange-500/10 dark:bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Top Bar with Brand & Theme Toggle */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#ea580c] flex items-center justify-center shadow-lg shadow-[#ea580c]/25">
            <UtensilsCrossed className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-brand text-2xl font-extrabold tracking-tight text-[#1c1613] dark:text-[#f5f2eb]">
                Mealora
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30 uppercase">
                POS
              </span>
            </div>
            <p className="text-[11px] text-[#736357] dark:text-[#9c8e84] font-medium">
              Better Meals. Better Moments.
            </p>
          </div>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleTheme}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#1a1613] border border-[#e2d8cc] dark:border-[#2e2723] text-xs font-semibold hover:border-amber-500 transition-all shadow-sm cursor-pointer"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 font-bold">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-amber-700" />
              <span className="text-amber-800 font-bold">Dark</span>
            </>
          )}
        </button>
      </header>

      {/* Center Auth Card */}
      <main className="w-full max-w-md mx-auto px-4 py-4 relative z-10 flex-1 flex flex-col justify-center">
        
        {/* Main Card */}
        <div className="rounded-3xl bg-white dark:bg-[#171412] border border-[#e6ddd3] dark:border-[#2e2723] p-6 sm:p-8 shadow-2xl shadow-black/10 dark:shadow-black/70 backdrop-blur-xl">
          
          {/* Header Inside Card */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 mb-3 shadow-inner">
              <KeyRound className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[#1c1613] dark:text-[#f5f2eb]">
              Restaurant Terminal Sign In
            </h1>
            <p className="text-xs text-[#736357] dark:text-[#9c8e84] mt-1.5">
              Enter your registered credentials to start your shift
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Input */}
            <div>
              <label className="block text-xs font-bold text-[#4a3f35] dark:text-[#c5b8ad] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8c786c] dark:text-[#9c8e84] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@mealora.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#faf7f2] dark:bg-[#1f1a17] border border-[#ded5ca] dark:border-[#2e2723] text-sm text-[#1c1613] dark:text-[#f5f2eb] placeholder-[#9c8e84] focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-mono text-xs"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#4a3f35] dark:text-[#c5b8ad]">
                  Password
                </label>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                  <Shield className="w-3 h-3" /> bcrypt Hashed
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8c786c] dark:text-[#9c8e84] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#faf7f2] dark:bg-[#1f1a17] border border-[#ded5ca] dark:border-[#2e2723] text-sm text-[#1c1613] dark:text-[#f5f2eb] placeholder-[#9c8e84] focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8c786c] hover:text-[#1c1613] dark:hover:text-[#f5f2eb] cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-2 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message Alert */}
            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-extrabold text-sm text-black bg-gradient-to-r from-[#f59e0b] to-[#ea580c] hover:from-[#fbbf24] hover:to-[#f97316] shadow-lg shadow-[#ea580c]/30 hover:shadow-xl hover:shadow-[#ea580c]/40 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 stroke-[2.5]" />
                  <span>Sign In to Terminal</span>
                </>
              )}
            </button>

            {/* Admin-controlled notice */}
            <div className="pt-2 text-center">
              <p className="text-[11px] text-[#736357] dark:text-[#9c8e84]">
                Staff and Admin accounts are managed by the Restaurant Owner.
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-800 dark:text-amber-300">
                <span>Predefined Owner:</span>
                <span className="font-mono font-bold">admin@mealora.com</span>
                <span>•</span>
                <span className="font-mono font-bold">admin123</span>
              </div>
            </div>
          </form>

          {/* Security Features Breakdown */}
          <div className="mt-6 pt-5 border-t border-[#e6ddd3] dark:border-[#27211d] grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-[#faf7f2] dark:bg-[#1a1613] border border-[#e8dfd4] dark:border-[#27211d]">
              <KeyRound className="w-3.5 h-3.5 text-amber-500 mx-auto mb-1" />
              <div className="text-[10px] font-bold text-[#1c1613] dark:text-[#f5f2eb]">JWT Token</div>
              <div className="text-[9px] text-[#736357] dark:text-[#9c8e84]">HMAC-SHA256</div>
            </div>

            <div className="p-2 rounded-xl bg-[#faf7f2] dark:bg-[#1a1613] border border-[#e8dfd4] dark:border-[#27211d]">
              <Shield className="w-3.5 h-3.5 text-emerald-500 mx-auto mb-1" />
              <div className="text-[10px] font-bold text-[#1c1613] dark:text-[#f5f2eb]">bcrypt Hashed</div>
              <div className="text-[9px] text-[#736357] dark:text-[#9c8e84]">10 Salt Rounds</div>
            </div>

            <div className="p-2 rounded-xl bg-[#faf7f2] dark:bg-[#1a1613] border border-[#e8dfd4] dark:border-[#27211d]">
              <Database className="w-3.5 h-3.5 text-amber-500 mx-auto mb-1" />
              <div className="text-[10px] font-bold text-[#1c1613] dark:text-[#f5f2eb]">MongoDB</div>
              <div className="text-[9px] text-[#736357] dark:text-[#9c8e84]">
                {systemStatus?.mongodb?.connected ? "Connected" : "Ready / Standby"}
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#736357] dark:text-[#9e8f82] relative z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>© {CURRENT_YEAR} Mealora. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span>Built by</span>
          <span className="text-[#a85122] dark:text-[#e87a38] font-semibold">Rohit</span>
        </div>
      </footer>

    </div>
  );
}
