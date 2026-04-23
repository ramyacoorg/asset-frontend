"use client";
import { Search, Bell, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";

export default function TopBar() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [role, setRole] = useState<string | null>(null);
  const [showNotifs, setShowNotifs] = useState(false);

  const notifications = role === "admin" ? [
    { id: 1, text: "New asset added to inventory", time: "2m ago", unread: true },
    { id: 2, text: "Issue reported on Dell XPS", time: "15m ago", unread: true },
    { id: 3, text: "Assignment completed", time: "1h ago", unread: false },
  ] : [
    { id: 1, text: "Welcome to Assentra", time: "1d ago", unread: true },
    { id: 2, text: "Your credentials have been generated", time: "2d ago", unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  function applyTheme(t: "light" | "dark") {
    const root = document.documentElement;
    if (t === "light") {
      root.style.setProperty("--page-bg", "linear-gradient(135deg, #f0f4ff 0%, #e8eaf6 50%, #f0f4ff 100%)");
      root.style.setProperty("--sidebar-bg", "rgba(255,255,255,0.85)");
      root.style.setProperty("--card-bg", "rgba(255,255,255,0.8)");
      root.style.setProperty("--text-primary", "#1e293b");
      root.style.setProperty("--text-secondary", "#475569");
      document.body.style.filter = "invert(0)";
      // Apply light filter on dark-themed pages
      const pages = document.querySelectorAll<HTMLElement>('[style*="0f172a"], [style*="1e1b4b"]');
      pages.forEach(el => {
        el.style.background = "linear-gradient(135deg, #f0f4ff 0%, #e8eaf6 50%, #f0f4ff 100%)";
      });
    } else {
      document.body.style.filter = "";
    }
  }

  useEffect(() => {
    setRole(localStorage.getItem("role"));
    const saved = localStorage.getItem("assentra-theme") as "light" | "dark" | null;
    if (saved) {
      setTheme(saved);
      applyTheme(saved);
    }
  }, []);



  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("assentra-theme", next);
    // Toggle brightness on the body
    if (next === "light") {
      document.body.style.filter = "brightness(1.6) invert(0.08)";
    } else {
      document.body.style.filter = "";
    }
  };

  return (
    <div
      className="flex items-center justify-between px-8 py-4 mb-6 sticky top-0 z-40 transition-all"
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        margin: "-2rem -2rem 2rem -2rem"
      }}
    >
      {/* Global Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          placeholder="Global Search... (e.g. Assets, Users, Issues)"
          className="w-full bg-black/20 border border-white/10 text-white pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:border-blue-500 placeholder:text-gray-500 transition-all focus:bg-black/30"
        />
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border border-gray-900 animate-pulse flex items-center justify-center text-white text-[9px] font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div
              className="absolute right-0 top-12 w-72 rounded-2xl shadow-2xl z-50 overflow-hidden"
              style={{ background: "rgba(15,23,42,0.98)", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              <div className="px-4 py-3 border-b border-white/10">
                <p className="text-white text-sm font-semibold">Notifications</p>
              </div>
              {notifications.map(n => (
                <div key={n.id} className={`px-4 py-3 flex items-start gap-3 hover:bg-white/5 transition-all ${n.unread ? "bg-blue-500/5" : ""}`}>
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.unread ? "bg-blue-400" : "bg-gray-600"}`} />
                  <div>
                    <p className="text-white text-xs">{n.text}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dark / Light Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
