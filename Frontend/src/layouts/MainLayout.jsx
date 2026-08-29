import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";

export default function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-canvas">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-surface border-b border-border sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2.5">
          <img src="/favicon.svg" alt="LeadTrack Logo" className="w-7 h-7 rounded-lg" />
          <span className="font-bold text-ink text-base tracking-tight">LeadTrack</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-lg text-ink-muted hover:text-ink hover:bg-canvas transition cursor-pointer"
          aria-label="Open Mobile Menu"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Responsive Sidebar (Desktop Sticky + Mobile Overlay Drawer) */}
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 md:px-10 py-6 sm:py-8 w-full max-w-full overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}