"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { getRole, logout } from "@/lib/auth";
import {
  Monitor, LogOut, LayoutDashboard, Package, Users, GitBranch,
  FileText, Menu, X, AlertTriangle, Download, Package2, TrendingUp
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from "recharts";

const COLORS = ["#6366f1", "#22d3ee", "#10b981", "#f59e0b", "#f43f5e", "#a78bfa"];

const adminLinks = [
  { icon: LayoutDashboard, label: "Dashboard",   href: "/dashboard" },
  { icon: Package,         label: "Inventory",   href: "/inventory" },
  { icon: Users,           label: "All Users",   href: "/users" },
  { icon: GitBranch,       label: "Assignments", href: "/assignments" },
  { icon: AlertTriangle,   label: "Issues",      href: "/issues" },
  { icon: FileText,        label: "Reports",     href: "/reports", active: true },
];

export default function ReportsPage() {
  const router = useRouter();
  const [role, setRole]               = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData]               = useState<any>(null);
  const [loading, setLoading]         = useState(true);
  const [exporting, setExporting]     = useState(false);

  useEffect(() => {
    const r = getRole();
    if (!r) { router.push("/login"); return; }
    if (r !== "admin") { router.push("/dashboard"); return; }
    setRole(r);
    api.get("/api/reports/summary")
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const res = await api.get("/api/reports/export-csv", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url; a.download = "optiasset_report.csv"; a.click();
      window.URL.revokeObjectURL(url);
    } catch { alert("Export failed"); }
    finally { setExporting(false); }
  };

  if (!role) return null;

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" }}
    >
      {/* SIDEBAR */}
      <div
        className={`${sidebarOpen ? "w-64" : "w-16"} flex flex-col transition-all duration-500`}
        style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(24px)", borderRight: "1px solid rgba(255,255,255,0.1)" }}
      >
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

      {/* MAIN */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Reports 📈</h1>
            <p className="text-gray-400 text-sm mt-1">Asset analytics and summaries</p>
          </div>
          <button onClick={handleExportCSV} disabled={exporting}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-60">
            <Download className="w-4 h-4" />
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Loading reports...</p>
          </div>
        ) : data && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Assets",  value: data.total_assets, icon: Package2,    color: "from-indigo-400 to-purple-500" },
                { label: "Total Issues",  value: data.total_issues,  icon: AlertTriangle, color: "from-rose-400 to-red-500" },
                { label: "Categories",   value: data.category_counts?.length || 0, icon: FileText, color: "from-cyan-400 to-blue-500" },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                { label: "Assignments",  value: data.monthly_assignments?.reduce((s: number, m: any) => s + m.count, 0) || 0, icon: TrendingUp, color: "from-emerald-400 to-green-500" },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-5 flex items-center gap-4 transition-all hover:scale-[1.02]"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
                  <div className={`bg-gradient-to-br ${s.color} p-3 rounded-xl shadow-lg`}>
                    <s.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{s.value}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
              {/* Status Pie */}
              <div className="rounded-2xl p-6"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
                <p className="text-gray-400 text-xs font-semibold uppercase mb-4 tracking-wider">Asset Status</p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <Pie data={data.status_counts} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {data.status_counts.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1e293b", border: "none", color: "#e2e8f0", borderRadius: "0.5rem", fontSize: "0.8rem" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Category Bar */}
              <div className="rounded-2xl p-6"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
                <p className="text-gray-400 text-xs font-semibold uppercase mb-4 tracking-wider">By Category</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.category_counts} layout="vertical" margin={{ left: 10 }}>
                    <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis type="category" dataKey="category" tick={{ fill: "#94a3b8", fontSize: 11 }} width={80} />
                    <Tooltip contentStyle={{ background: "#1e293b", border: "none", color: "#e2e8f0", borderRadius: "0.5rem", fontSize: "0.8rem" }} />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {data.category_counts.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
              {/* Monthly Assignments */}
              <div className="rounded-2xl p-6"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
                <p className="text-gray-400 text-xs font-semibold uppercase mb-4 tracking-wider">Monthly Assignments</p>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={data.monthly_assignments}>
                    <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "#1e293b", border: "none", color: "#e2e8f0", borderRadius: "0.5rem", fontSize: "0.8rem" }} />
                    <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ fill: "#6366f1", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Issue Status Pie */}
              <div className="rounded-2xl p-6"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
                <p className="text-gray-400 text-xs font-semibold uppercase mb-4 tracking-wider">Issue Status</p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <Pie data={data.issue_counts} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {data.issue_counts.map((_: any, i: number) => <Cell key={i} fill={["#f43f5e", "#10b981", "#f59e0b"][i % 3]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1e293b", border: "none", color: "#e2e8f0", borderRadius: "0.5rem", fontSize: "0.8rem" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Asset Table */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="p-6 pb-3">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">All Assets</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400">
                      {["Code", "Name", "Category", "Status", "Purchase Date"].map(h => (
                        <th key={h} className="text-left px-6 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {data.assets.map((a: any, i: number) => (
                      <tr key={i} className="hover:bg-white/5 transition-all">
                        <td className="px-6 py-3 font-mono text-cyan-400 text-xs">{a.asset_code}</td>
                        <td className="px-6 py-3 text-white font-medium">{a.asset_name}</td>
                        <td className="px-6 py-3 text-gray-400">{a.asset_category}</td>
                        <td className="px-6 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            a.asset_status === "available" ? "bg-green-500/20 text-green-400" :
                            a.asset_status === "assigned"  ? "bg-indigo-500/20 text-indigo-400" :
                            "bg-amber-500/20 text-amber-400"
                          }`}>{a.asset_status}</span>
                        </td>
                        <td className="px-6 py-3 text-gray-400 text-xs">{a.purchase_date || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
