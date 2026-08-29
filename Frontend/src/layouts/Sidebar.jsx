import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Users, LayoutDashboard, LogOut, LogOut as LogOutIcon, User, Mail, ShieldCheck, X, Loader2 } from "lucide-react";
import Constant from "../lib/Constant";
import { getUserDetails } from "../services/api.services";
import { toast } from "sonner";

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // User details modal state
  const [showUserModal, setShowUserModal] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);

  // Get logged in user info from localStorage
  const authData = JSON.parse(localStorage.getItem(Constant.AUTH_KEY) || "{}");
  const userId = authData.id || 1;
  const userEmail = authData.email || "admin@leadtrack.io";
  const userName = authData.name || userEmail.split("@")[0];

  function handleLogout() {
    localStorage.removeItem(Constant.LOGIN_KEY);
    localStorage.removeItem(Constant.AUTH_KEY);
    navigate("/login", { replace: true });
  }

  // Click on Profile Card -> Fetch API & Open Modal
  const handleProfileClick = async () => {
    setShowUserModal(true);
    setLoadingUser(true);
    try {
      const response = await getUserDetails(userId);
      if (response?.code === Constant.OK && response?.data) {
        setUserDetails(response.data);
      } else {
        setUserDetails({
          id: userId,
          name: userName,
          email: userEmail,
          is_active: 1,
        });
      }
    } catch (err) {
      toast.error("Failed to load user details");
      setUserDetails({
        id: userId,
        name: userName,
        email: userEmail,
        is_active: 1,
      });
    } finally {
      setLoadingUser(false);
    }
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
      isActive
        ? "bg-primary text-white font-semibold"
        : "text-ink-muted hover:text-ink hover:bg-canvas"
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Brand Logo Header */}
      <div className="flex items-center justify-between px-2 mb-8">
        <div className="flex items-center gap-3">
          <img src="/favicon.svg" alt="LeadTrack Logo" className="w-8 h-8 rounded-lg" />
          <span className="font-bold text-ink text-lg tracking-tight block leading-none">LeadTrack</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-1 text-ink-muted hover:text-ink cursor-pointer">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-ink-muted/80">
        Main Menu
      </div>
      <nav className="flex-1 space-y-1">
        <NavLink to="/" end onClick={onClose} className={navItemClass}>
          <LayoutDashboard size={17} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/leads" onClick={onClose} className={navItemClass}>
          <Users size={17} />
          <span>Leads</span>
        </NavLink>
      </nav>

      {/* Footer Clickable User Profile Card */}
      <div className="pt-4 border-t border-border mt-auto">
        <div
          onClick={handleProfileClick}
          className="flex items-center gap-2.5 px-2.5 py-2 mb-2 rounded-lg bg-canvas hover:bg-primary-soft/50 border border-border/60 transition cursor-pointer group"
          title="Click to view profile details"
        >
          <div className="w-8 h-8 rounded-lg bg-primary-soft text-primary font-bold text-xs flex items-center justify-center shrink-0 uppercase group-hover:bg-primary group-hover:text-white transition-colors">
            {userName.slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-ink truncate capitalize group-hover:text-primary transition-colors">{userName}</p>
            <p className="text-[10px] text-ink-muted truncate">{userEmail}</p>
          </div>
        </div>

        <button
          onClick={() => setShowConfirmModal(true)}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 h-screen sticky top-0 px-4 py-6 bg-surface border-r border-border">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity" onClick={onClose} />
          <aside className="relative flex flex-col w-72 h-full bg-surface p-6 shadow-2xl z-10 animate-slideRight">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* User Details Profile Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setShowUserModal(false)}
              className="absolute right-4 top-4 text-ink-muted hover:text-ink cursor-pointer p-1"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary-soft text-primary font-bold text-xl flex items-center justify-center shrink-0 uppercase border border-primary/20">
                {userName.slice(0, 2)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-ink capitalize">{userDetails?.name || userName}</h3>
              </div>
            </div>

            {loadingUser ? (
              <div className="py-10 text-center">
                <Loader2 size={24} className="animate-spin inline text-primary" />
                <p className="text-xs text-ink-muted mt-2">Loading user details…</p>
              </div>
            ) : (
              <div className="space-y-3 bg-canvas/60 p-4 rounded-xl border border-border/80 text-sm">
                <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                  <span className="text-ink-muted text-xs flex items-center gap-1.5 font-medium">
                    <User size={14} className="text-primary" /> Full Name
                  </span>
                  <span className="font-semibold text-ink capitalize">{userDetails?.name || userName}</span>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-border/60">
                  <span className="text-ink-muted text-xs flex items-center gap-1.5 font-medium">
                    <Mail size={14} className="text-primary" /> Email Address
                  </span>
                  <span className="font-medium text-ink">{userDetails?.email || userEmail}</span>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <span className="text-ink-muted text-xs flex items-center gap-1.5 font-medium">
                    <ShieldCheck size={14} className="text-primary" /> Account Status
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    Active
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
                className="px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Sign Out Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-sm shadow-xl">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <LogOutIcon size={20} />
            </div>
            <h3 className="text-lg font-semibold text-ink mb-1">Confirm Sign Out</h3>
            <p className="text-sm text-ink-muted mb-6">
              Are you sure you want to sign out of your account?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-sm font-medium text-ink bg-transparent hover:bg-canvas rounded-lg transition-colors cursor-pointer border border-border"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}