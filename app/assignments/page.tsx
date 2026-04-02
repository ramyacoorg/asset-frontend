"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRole, logout } from "@/lib/auth";
import { Monitor, LogOut, LayoutDashboard, Package, Users, GitBranch, FileText, Menu, X, Plus } from "lucide-react";

export default function AssignmentsPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const r = getRole();
    if (!r) router.push("/login");
    else if (r !== "admin") router.push("/my-gear");
    else setRole(r);
  }, [router]);

  if (!role) return null;

  const assignments = [
    { employee: "Ramya", asset: "Dell XPS 15", code: "DL-001", date: "Jan 15, 2026", status: "Active" },
    { employee: "Ben", asset: "MacBook Pro", code: "MB-002", date: "Feb 1, 2026", status: "Active" },
    { employee: "Ben", asset: "iPhone 14 Pro", code: "IP-014", date: "Feb 1, 2026", status: "Active" },
    { employee: "Priya", asset: "HP EliteBook", code: "HP-003", date: "Feb 25, 2026", status: "Returned" },
  ];

  const adminLinks = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Package, label: "Inventory", href: "/inventory" },
    { icon: Users, label: "All Users", href: "/users" },
    { icon: GitBranch, label: "Assignments", href: "/assignments", active: true },
    { icon: FileText, label: "Reports", href: "/reports" },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" }}>
      <div className={`${sidebarOpen ? "w-64" : "w-16"} flex flex-col transition-all duration-500`}
        style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(24px)", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
                <Monitor className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-sm">OptiAsset</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white">
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
        {sidebarOpen && (
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-2 rounded-xl border border-blue-500/20">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-blue-300">👑 Administrator</span>
            </div>
          </div>
        )}
        <nav className="flex-1 p-3 space-y-1">
          {adminLinks.map((link) => (
            <button key={link.label} onClick={() => router.push(link.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                link.active
                  ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/20"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}>
              <link.icon className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span>{link.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-sm">
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Assignments 🔗</h1>
            <p className="text-gray-400 text-sm mt-1">Track asset assignments</p>
          </div>
          <button className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg">
            <Plus className="w-4 h-4" /> Assign Asset
          </button>
        </div>
        <div className="space-y-3">
          {assignments.map((a, i) => (
            <div key={i} className="rounded-2xl p-5 flex items-center justify-between transition-all hover:scale-[1.01]"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                  {a.employee[0]}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{a.employee}</p>
                  <p className="text-gray-400 text-xs">{a.asset} • <span className="font-mono text-blue-400">{a.code}</span></p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs">{a.date}</p>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full mt-1 inline-block ${
                  a.status === "Active" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                }`}>{a.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}