import React, { useState, useEffect } from "react";
import {
  X,
  Users,
  UserPlus,
  Shield,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Mail,
  Lock,
  User as UserIcon,
  ChefHat,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import authService from "../services/authService";

export default function TeamManagementModal({ isOpen, onClose, currentUser, showToast }) {
  const [activeTab, setActiveTab] = useState("add"); // 'add' | 'list'
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // New Member Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("staff");
  const [showPassword, setShowPassword] = useState(false);

  // Load team members
  const fetchMembers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await authService.getMembers();
      setMembers(data);
    } catch (err) {
      setError(err.message || "Failed to load team members.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen]);

  // Handle Add Member Submit
  const handleAddMember = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      await authService.addMember({ name, email, password, role });
      setSuccessMsg(`Member '${name}' created successfully as ${role.toUpperCase()} in MongoDB!`);
      if (showToast) {
        showToast(`Team member ${name} created successfully.`);
      }
      // Reset form
      setName("");
      setEmail("");
      setPassword("");
      setRole("staff");
      // Refresh directory list
      fetchMembers();
    } catch (err) {
      setError(err.message || "Failed to add member.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Delete Member
  const handleDeleteMember = async (id, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from the system?`)) {
      return;
    }

    try {
      await authService.deleteMember(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      if (showToast) showToast(`${memberName} was removed.`);
    } catch (err) {
      alert(err.message || "Could not delete member.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-[#171412] border border-[#e6ddd3] dark:border-[#2e2723] shadow-2xl shadow-black/40 overflow-hidden flex flex-col max-h-[90vh]">

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#e6ddd3] dark:border-[#26201c] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Users className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-[#1c1613] dark:text-[#f5f2eb]">
                  Team & Staff Management
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  Admin Only
                </span>
              </div>
              <p className="text-xs text-[#736357] dark:text-[#9c8e84]">
                Create new staff credentials or manage existing members in MongoDB
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#736357] dark:text-[#9c8e84] hover:text-[#1c1613] dark:hover:text-[#f5f2eb] hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-4 flex gap-2 border-b border-[#e6ddd3] dark:border-[#26201c]">
          <button
            type="button"
            onClick={() => {
              setActiveTab("add");
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${activeTab === "add"
              ? "border-amber-500 text-amber-600 dark:text-amber-400"
              : "border-transparent text-[#736357] dark:text-[#9c8e84] hover:text-[#1c1613] dark:hover:text-[#f5f2eb]"
              }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Member</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("list");
              setError(null);
              setSuccessMsg(null);
              fetchMembers();
            }}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${activeTab === "list"
              ? "border-amber-500 text-amber-600 dark:text-amber-400"
              : "border-transparent text-[#736357] dark:text-[#9c8e84] hover:text-[#1c1613] dark:hover:text-[#f5f2eb]"
              }`}
          >
            <Users className="w-4 h-4" />
            <span>Team Directory ({members.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: ADD NEW MEMBER */}
          {activeTab === "add" && (
            <form onSubmit={handleAddMember} className="space-y-4 max-w-lg mx-auto">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-[#4a3f35] dark:text-[#c5b8ad] mb-1.5">
                  Member Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#8c786c] dark:text-[#9c8e84] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#faf7f2] dark:bg-[#1f1a17] border border-[#ded5ca] dark:border-[#2e2723] text-sm text-[#1c1613] dark:text-[#f5f2eb] placeholder-[#9c8e84] focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-[#4a3f35] dark:text-[#c5b8ad] mb-1.5">
                  Email Address (Login Username)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8c786c] dark:text-[#9c8e84] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@mealora.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#faf7f2] dark:bg-[#1f1a17] border border-[#ded5ca] dark:border-[#2e2723] text-sm text-[#1c1613] dark:text-[#f5f2eb] placeholder-[#9c8e84] focus:outline-none focus:border-amber-500 font-mono text-xs transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#4a3f35] dark:text-[#c5b8ad]">
                    Temporary Password
                  </label>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                    <Shield className="w-3 h-3" /> bcrypt Hashed in MongoDB
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
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#faf7f2] dark:bg-[#1f1a17] border border-[#ded5ca] dark:border-[#2e2723] text-sm text-[#1c1613] dark:text-[#f5f2eb] placeholder-[#9c8e84] focus:outline-none focus:border-amber-500 font-mono transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8c786c] hover:text-[#1c1613] dark:hover:text-[#f5f2eb] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-bold text-[#4a3f35] dark:text-[#c5b8ad] mb-1.5">
                  Assign Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("staff")}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${role === "staff"
                      ? "bg-blue-500/15 border-blue-500 text-blue-700 dark:text-blue-300 shadow-sm"
                      : "bg-[#faf7f2] dark:bg-[#1f1a17] border-[#ded5ca] dark:border-[#2e2723] text-[#736357] dark:text-[#9c8e84]"
                      }`}
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Staff (POS & Kitchen)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${role === "admin"
                      ? "bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300 shadow-sm"
                      : "bg-[#faf7f2] dark:bg-[#1f1a17] border-[#ded5ca] dark:border-[#2e2723] text-[#736357] dark:text-[#9c8e84]"
                      }`}
                  >
                    <ChefHat className="w-4 h-4" />
                    <span>Admin (Full Access)</span>
                  </button>
                </div>
              </div>

              {/* Error / Success Alerts */}
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md shadow-orange-500/25 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <span>Saving to MongoDB...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 stroke-[2.5]" />
                    <span>Create Member & Save in MongoDB</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: MEMBERS DIRECTORY */}
          {activeTab === "list" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs font-bold text-[#736357] dark:text-[#9c8e84]">
                  Registered System Accounts
                </span>
                <button
                  type="button"
                  onClick={fetchMembers}
                  disabled={isLoading}
                  className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {isLoading && members.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#736357] dark:text-[#9c8e84]">
                  Loading registered members...
                </div>
              ) : members.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#736357] dark:text-[#9c8e84]">
                  No members found.
                </div>
              ) : (
                <div className="divide-y divide-[#e6ddd3] dark:divide-[#26201c] border border-[#e6ddd3] dark:border-[#26201c] rounded-2xl overflow-hidden bg-[#faf7f2]/50 dark:bg-[#1a1613]/50">
                  {members.map((member) => {
                    const isSelf = currentUser?.id === member.id;
                    const isPrimaryOwner = member.email === "admin@mealora.com";

                    return (
                      <div
                        key={member.id}
                        className="p-3.5 flex items-center justify-between gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold ${member.role === "admin"
                              ? "bg-gradient-to-tr from-amber-500 to-orange-500 text-black shadow-sm"
                              : "bg-gradient-to-tr from-blue-500 to-indigo-500 text-white shadow-sm"
                              }`}
                          >
                            {member.avatar || member.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#1c1613] dark:text-[#f5f2eb]">
                                {member.name}
                              </span>
                              {isSelf && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-400">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-[#736357] dark:text-[#9c8e84]">
                              {member.email}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2.5 py-0.8 rounded-lg text-[10px] font-extrabold border ${member.role === "admin"
                              ? "bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-300"
                              : "bg-blue-500/15 border-blue-500/30 text-blue-700 dark:text-blue-300"
                              }`}
                          >
                            {member.role === "admin" ? "Admin" : "Staff"}
                          </span>

                          {!isPrimaryOwner && !isSelf && (
                            <button
                              type="button"
                              onClick={() => handleDeleteMember(member.id, member.name)}
                              className="p-1.5 rounded-lg text-[#8c786c] hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                              title="Delete Member"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 bg-[#faf7f2] dark:bg-[#141110] border-t border-[#e6ddd3] dark:border-[#26201c] flex items-center justify-between text-[11px] text-[#736357] dark:text-[#9c8e84]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>All members can sign in with their email and password</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl border border-[#ded5ca] dark:border-[#2e2723] hover:bg-black/5 dark:hover:bg-white/5 font-semibold text-xs cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
