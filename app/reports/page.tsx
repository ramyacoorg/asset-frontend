"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRole, logout } from "@/lib/auth";
import { Monitor, LogOut, LayoutDashboard, Package, Users, GitBranch, FileText, Menu, X, TrendingUp, Download } from "lucide-react";

export default function ReportsPage() {
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

  const adminLinks = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Package, label: "Inventory", href: "/inventory" },
    { icon: Users, label: "All Users", href: "/users" },
    { icon: GitBranch, label: "Assignments", href: "/assignments" },
    { icon: FileText, label: "Reports", href: "/reports", active: true },
  ];

  const stats = [
    { label: "Total Assets", value: 124, color: "from-blue-400 to-blue-600", percent: 100 },
    { label: "Assigned", value: 98, color: "from-green-400 to-emerald-500", percent: 79 },
    { label: "Available", value: 20, color: "from-purple-400 to-purple-600", percent: 16 },
    { label: "Under Repair", value: 6, color: "from-orange-400 to-red-400", percent: 5 },
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
              <span className="text-xs font-semibold text-blue-300"> Administrator</span>
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
            <h1 className="text-3xl font-bold text-white">Reports 📊</h1>
            <p className="text-gray-400 text-sm mt-1">Asset analytics and summaries</p>
          </div>
          <button className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {/* Asset Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl p-6"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-gray-300 text-sm font-medium">{stat.label}</p>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-blue-400" />
                  <span className="text-blue-400 text-xs">{stat.percent}%</span>
                </div>
              </div>
              <p className="text-4xl font-bold text-white mb-4">{stat.value}</p>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className={`bg-gradient-to-r ${stat.color} h-2 rounded-full transition-all duration-1000`}
                  style={{ width: `${stat.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Department Breakdown */}
        <div className="rounded-2xl p-6"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
          <h2 className="text-white font-semibold mb-5">Assets by Department</h2>
          <div className="space-y-4">
            {[
              { dept: "Engineering", count: 45, color: "from-blue-400 to-blue-600", percent: 36 },
              { dept: "IT", count: 32, color: "from-purple-400 to-purple-600", percent: 26 },
              { dept: "HR", count: 28, color: "from-green-400 to-emerald-500", percent: 23 },
              { dept: "Finance", count: 19, color: "from-orange-400 to-red-400", percent: 15 },
            ].map((d) => (
              <div key={d.dept}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-300">{d.dept}</span>
                  <span className="text-gray-400">{d.count} assets</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className={`bg-gradient-to-r ${d.color} h-2 rounded-full`} style={{ width: `${d.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}