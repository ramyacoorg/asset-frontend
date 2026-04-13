"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRole, logout, getToken } from "@/lib/auth";
import { Monitor, LogOut, LayoutDashboard, Package, Users, GitBranch, FileText, Menu, X, TrendingUp, Download, AlertTriangle } from "lucide-react";

const API = "https://assettracker-production-e745.up.railway.app";

interface Stats {
  total_assets: number;
  available: number;
  assigned: number;
  under_repair: number;
  retired: number;
  total_users: number;
  open_issues: number;
  resolved_issues: number;
}

export default function ReportsPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const r = getRole();
    if (!r) router.push("/login");
    else if (r !== "admin") router.push("/dashboard");
    else { setRole(r); fetchStats(); }
  }, [router]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API}/api/dashboard/admin`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) setStats(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const adminLinks = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Package, label: "Inventory", href: "/inventory" },
    { icon: Users, label: "All Users", href: "/users" },
    { icon: GitBranch, label: "Assignments", href: "/assignments" },
    { icon: AlertTriangle, label: "Issues", href: "/issues" },
    { icon: FileText, label: "Reports", href: "/reports", active: true },
  ];

  if (!role) return null;

  // Donut Chart SVG
  const DonutChart = () => {
    if (!stats) return null;
    const total = stats.total_assets || 1;
    const c = 2 * Math.PI * 45;
    const availDash = (stats.available / total) * c;
    const assignDash = (stats.assigned / total) * c;
    const repairDash = (stats.under_repair / total) * c;
    const retiredDash = (stats.retired / total) * c;
    let offset = c * 0.25;
    return (
      <svg width="160" height="160" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="18" />
        <circle cx="55" cy="55" r="45" fill="none" stroke="#3b82f6" strokeWidth="18"
          strokeDasharray={`${availDash} ${c - availDash}`} strokeDashoffset={offset} />
        <circle cx="55" cy="55" r="45" fill="none" stroke="#10b981" strokeWidth="18"
          strokeDasharray={`${assignDash} ${c - assignDash}`} strokeDashoffset={offset - availDash} />
        <circle cx="55" cy="55" r="45" fill="none" stroke="#f59e0b" strokeWidth="18"
          strokeDasharray={`${repairDash} ${c - repairDash}`} strokeDashoffset={offset - availDash - assignDash} />
        <circle cx="55" cy="55" r="45" fill="none" stroke="#ef4444" strokeWidth="18"
          strokeDasharray={`${retiredDash} ${c - retiredDash}`} strokeDashoffset={offset - availDash - assignDash - repairDash} />
        <text x="55" y="50" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">{total}</text>
        <text x="55" y="65" textAnchor="middle" fill="#94a3b8" fontSize="8">Total</text>
      </svg>
    );
  };

  // Bar Chart SVG
  const BarChart = () => {
    if (!stats) return null;
    const bars = [
      { label: "Available", value: stats.available, color: "#3b82f6" },
      { label: "Assigned", value: stats.assigned, color: "#10b981" },
      { label: "Repair", value: stats.under_repair, color: "#f59e0b" },
      { label: "Retired", value: stats.retired, color: "#ef4444" },
      { label: "Open Issues", value: stats.open_issues, color: "#8b5cf6" },
      { label: "Resolved", value: stats.resolved_issues, color: "#06b6d4" },
    ];
    const maxVal = Math.max(...bars.map(b => b.value), 1);
    const chartH = 120;
    const barW = 35;
    const gap = 10;
    const totalW = bars.length * (barW + gap);
    return (
      <svg width="100%" height="180" viewBox={`0 0 ${totalW + 20} 180`}>
        {bars.map((bar, i) => {
          const barH = Math.max((bar.value / maxVal) * chartH, 4);
          const x = 10 + i * (barW + gap);
          const y = 10 + chartH - barH;
          return (
            <g key={bar.label}>
              <rect x={x} y={y} width={barW} height={barH} fill={bar.color} rx="4" />
              <text x={x + barW / 2} y={y - 4} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">{bar.value}</text>
              <text x={x + barW / 2} y={145} textAnchor="middle" fill="#94a3b8" fontSize="7">{bar.label}</text>
            </g>
          );
        })}
        <line x1="10" y1="130" x2={totalW + 10} y2="130" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      </svg>
    );
  };

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" }}>

      {/* SIDEBAR */}
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
                link.active ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/20"
                : "text-gray-400 hover:text-white hover:bg-white/10"}`}>
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

      {/* MAIN */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Reports </h1>
            <p className="text-gray-400 text-sm mt-1">Asset analytics and summaries</p>
          </div>
          <button className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Loading reports...</p>
          </div>
        ) : stats ? (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Assets", value: stats.total_assets, color: "from-blue-400 to-blue-600" },
                { label: "Assigned", value: stats.assigned, color: "from-green-400 to-emerald-500" },
                { label: "Available", value: stats.available, color: "from-purple-400 to-purple-600" },
                { label: "Under Repair", value: stats.under_repair, color: "from-orange-400 to-red-400" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl p-5"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <p className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>{stat.value}</p>
                  <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
                  <div className="mt-2 w-full bg-white/10 rounded-full h-1.5">
                    <div className={`bg-gradient-to-r ${stat.color} h-1.5 rounded-full`}
                      style={{ width: `${stats.total_assets ? (stat.value / stats.total_assets) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Donut Chart */}
              <div className="rounded-2xl p-6"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" /> Asset Distribution
                </h3>
                <div className="flex items-center gap-8">
                  <DonutChart />
                  <div className="space-y-3">
                    {[
                      { label: "Available", value: stats.available, color: "bg-blue-500" },
                      { label: "Assigned", value: stats.assigned, color: "bg-emerald-500" },
                      { label: "Under Repair", value: stats.under_repair, color: "bg-amber-500" },
                      { label: "Retired", value: stats.retired, color: "bg-red-500" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-gray-300 text-xs">{item.label}: <span className="text-white font-semibold">{item.value}</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="rounded-2xl p-6"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" /> Assets & Issues Overview
                </h3>
                <BarChart />
              </div>
            </div>

            {/* Progress Bars */}
            <div className="rounded-2xl p-6"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <h3 className="text-white font-semibold mb-5">Detailed Breakdown</h3>
              <div className="space-y-4">
                {[
                  { label: "Available Assets", value: stats.available, total: stats.total_assets, color: "from-blue-400 to-blue-600" },
                  { label: "Assigned Assets", value: stats.assigned, total: stats.total_assets, color: "from-green-400 to-emerald-500" },
                  { label: "Under Repair", value: stats.under_repair, total: stats.total_assets, color: "from-amber-400 to-orange-500" },
                  { label: "Retired Assets", value: stats.retired, total: stats.total_assets, color: "from-red-400 to-red-600" },
                  { label: "Open Issues", value: stats.open_issues, total: stats.open_issues + stats.resolved_issues || 1, color: "from-purple-400 to-purple-600" },
                  { label: "Resolved Issues", value: stats.resolved_issues, total: stats.open_issues + stats.resolved_issues || 1, color: "from-cyan-400 to-cyan-600" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-300">{item.label}</span>
                      <span className="text-white font-semibold">{item.value} <span className="text-gray-500">/ {item.total}</span></span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2.5">
                      <div className={`bg-gradient-to-r ${item.color} h-2.5 rounded-full transition-all duration-1000`}
                        style={{ width: `${item.total ? (item.value / item.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-400 text-center py-20">No data available</p>
        )}
      </div>
    </div>
  );
}
