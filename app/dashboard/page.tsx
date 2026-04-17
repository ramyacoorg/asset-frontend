"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { getRole, logout } from "@/lib/auth";
import {
  Monitor, LogOut, LayoutDashboard, Package,
  Users, GitBranch, FileText, Menu, X,
  AlertTriangle, TrendingUp, CheckCircle, Wrench,
  Package2, UserCheck, Laptop, Camera
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from "recharts";

const COLORS = ["#6366f1", "#22d3ee", "#f59e0b", "#10b981", "#f43f5e"];

const adminLinks = [
  { icon: LayoutDashboard, label: "Dashboard",      href: "/dashboard", active: true },
  { icon: Package,         label: "Inventory",      href: "/inventory" },
  { icon: Users,           label: "All Users",      href: "/users" },
  { icon: GitBranch,       label: "Assignments",    href: "/assignments" },
  { icon: AlertTriangle,   label: "Issues",         href: "/issues" },
  { icon: FileText,        label: "Audit Logs",     href: "/audit" },
  { icon: FileText,        label: "Exit Checklist", href: "/exit-checklist" },
  { icon: FileText,        label: "Reports",        href: "/reports" },
];

const employeeLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", active: true },
  { icon: Laptop, label: "My Gear", href: "/my-gear" },
  { icon: AlertTriangle, label: "My Tickets", href: "/my-tickets" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<any>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append("photo", file);

      const res = await api.post("/api/profile/upload-photo", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setData((prev: any) => ({ ...prev, photo_url: res.data.photo_url }));
    } catch (err) {
      alert("Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Step 1 — detect role client-side
  useEffect(() => {
    const r = getRole();
    if (!r) { router.push("/login"); return; }
    setRole(r);
  }, [router]);

  // Step 2 — fetch dashboard data once role is known
  useEffect(() => {
    if (!role) return;
    const endpoint =
      role === "admin" ? "/api/dashboard/admin" : "/api/dashboard/employee";
    api
      .get(endpoint)
      .then((res) => setData(res.data))
      .catch((e: any) =>
        setError(e?.response?.data?.detail || "Failed to load dashboard data")
      )
      .finally(() => setLoading(false));
  }, [role]);

  const links = role === "admin" ? adminLinks : employeeLinks;

  // ── Sidebar ──────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <div
      className={`${sidebarOpen ? "w-64" : "w-16"} flex flex-col transition-all duration-500`}
      style={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(24px)",
        borderRight: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {/* Logo */}
      <div
        className="p-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
              <Monitor className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm">OptiAsset</span>
          </div>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-400 hover:text-white"
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Role badge */}
      {sidebarOpen && (
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-2 rounded-xl border border-blue-500/20">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-blue-300">
              {role === "admin" ? "👑 Administrator" : "👤 Employee"}
            </span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {links.map((link) => (
          <button
            key={link.label}
            onClick={() => router.push(link.href)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${link.active
                ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/20"
                : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
          >
            <link.icon className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>{link.label}</span>}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-sm"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading || !role)
    return (
      <div
        className="min-h-screen flex"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" }}
      >
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error)
    return (
      <div
        className="min-h-screen flex"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" }}
      >
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 font-semibold">{error}</p>
          </div>
        </div>
      </div>
    );

  // ══════════════════════════════════════════════════════════════════════════
  //  ADMIN DASHBOARD
  // ══════════════════════════════════════════════════════════════════════════
  if (role === "admin" && data) {
    const statCards = [
      { label: "Total Assets", value: data.total_assets ?? 0, icon: Package2, color: "from-indigo-400 to-purple-500" },
      { label: "Assigned", value: data.assigned ?? 0, icon: UserCheck, color: "from-cyan-400 to-blue-500" },
      { label: "Available", value: data.available ?? 0, icon: CheckCircle, color: "from-emerald-400 to-green-500" },
      { label: "Under Repair", value: data.under_repair ?? 0, icon: Wrench, color: "from-amber-400 to-orange-500" },
      { label: "Total Users", value: data.total_users ?? 0, icon: Users, color: "from-violet-400 to-purple-500" },
      { label: "Open Issues", value: data.open_issues ?? 0, icon: AlertTriangle, color: "from-rose-400 to-red-500" },
    ];

    const pieData = [
      { name: "Assigned", value: data.assigned ?? 0 },
      { name: "Available", value: data.available ?? 0 },
      { name: "Repair", value: data.under_repair ?? 0 },
      { name: "Retired", value: data.retired ?? 0 },
    ];

    return (
      <div
        className="min-h-screen flex"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" }}
      >
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Admin Dashboard 📊</h1>
            <p className="text-gray-400 text-sm mt-1">Real-time asset overview for your organization</p>
          </div>

          {/* Profile Card */}
          <div
            className="rounded-2xl p-6 flex items-center gap-4 mb-8"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(20px)",
            }}
          >
            <div
              className="relative group cursor-pointer shrink-0"
              onClick={() => document.getElementById('photo-upload')?.click()}
            >
              <input type="file" id="photo-upload" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
              {data?.photo_url ? (
                <img
                  src={data.photo_url}
                  alt="profile"
                  className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500/50"
                  style={{ opacity: uploadingPhoto ? 0.5 : 1 }}
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                  {(data?.full_name as string)?.[0]?.toUpperCase() ?? "A"}
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingPhoto ? (
                  <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
              </div>
            </div>
            <div>
              <p className="text-white font-bold text-lg">Welcome, {data?.full_name ?? "Administrator"}!</p>
              <p className="text-gray-400 text-sm mt-0.5">{data?.email}</p>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {statCards.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl p-5 flex flex-col gap-3 transition-all hover:scale-[1.02]"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backdropFilter: "blur(20px)",
                }}
              >
                <div className={`bg-gradient-to-br ${s.color} p-2.5 rounded-xl w-fit shadow-lg`}>
                  <s.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            {/* Pie Chart */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(20px)",
              }}
            >
              <p className="text-gray-400 text-xs font-semibold uppercase mb-4 tracking-wider">
                Asset Status Breakdown
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={55} outerRadius={85}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#1e293b", border: "none",
                      color: "#e2e8f0", borderRadius: "0.5rem", fontSize: "0.8rem",
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(v) => <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(20px)",
              }}
            >
              <p className="text-gray-400 text-xs font-semibold uppercase mb-4 tracking-wider">
                Assets by Category
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.category_counts ?? []} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis type="category" dataKey="category" tick={{ fill: "#94a3b8", fontSize: 11 }} width={75} />
                  <Tooltip
                    contentStyle={{
                      background: "#1e293b", border: "none",
                      color: "#e2e8f0", borderRadius: "0.5rem", fontSize: "0.8rem",
                    }}
                  />
                  <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Issues */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(20px)",
            }}
          >
            <p className="text-gray-400 text-xs font-semibold uppercase mb-5 tracking-wider">
              Recent Issues
            </p>

            {!data.recent_issues?.length ? (
              <div className="text-center py-10">
                <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No issues reported yet. All good! 🎉</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(data.recent_issues ?? []).map((issue: any) => (
                  <div
                    key={issue.id}
                    className="flex items-center gap-4 p-4 rounded-xl transition-all hover:bg-white/5"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    {issue.photo_url ? (
                      <img
                        src={issue.photo_url}
                        alt=""
                        className="w-11 h-11 rounded-xl object-cover shrink-0 border border-white/10"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0 text-base">
                        ⚠️
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{issue.asset_name}</p>
                      <p className="text-gray-400 text-xs truncate mt-0.5">{issue.issue_description}</p>
                      <p className="text-gray-500 text-xs mt-0.5">by {issue.employee_name}</p>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 ${issue.issue_status === "open"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-green-500/20 text-green-400"
                        }`}
                    >
                      {issue.issue_status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  EMPLOYEE DASHBOARD
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div
      className="min-h-screen flex"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" }}
    >
      <Sidebar />

      <div className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">My Dashboard 🏠</h1>
          <p className="text-gray-400 text-sm mt-1">Welcome back! Here's your overview.</p>
        </div>

        {/* Profile Card */}
        <div
          className="rounded-2xl p-6 flex items-center gap-4 mb-6"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div
            className="relative group cursor-pointer shrink-0"
            onClick={() => document.getElementById('employee-photo-upload')?.click()}
          >
            <input type="file" id="employee-photo-upload" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
            {data?.photo_url ? (
              <img
                src={data.photo_url}
                alt="profile"
                className="w-14 h-14 rounded-full object-cover border-2 border-indigo-500/50"
                style={{ opacity: uploadingPhoto ? 0.5 : 1 }}
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                {(data?.full_name as string)?.[0]?.toUpperCase() ?? "U"}
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {uploadingPhoto ? (
                <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-white" />
              )}
            </div>
          </div>
          <div>
            <p className="text-white font-bold text-lg">Welcome, {data?.full_name ?? "Employee"}!</p>
            <p className="text-gray-400 text-sm mt-0.5">{data?.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "My Assets", value: data?.my_assets_count ?? 0, icon: Package2, color: "from-indigo-400 to-purple-500" },
            { label: "Open Issues", value: data?.open_tickets ?? 0, icon: AlertTriangle, color: "from-rose-400 to-red-500" },
            { label: "Resolved", value: data?.resolved_tickets ?? 0, icon: CheckCircle, color: "from-emerald-400 to-green-500" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-5 flex items-center gap-4 transition-all hover:scale-[1.02]"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(20px)",
              }}
            >
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

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* My Assigned Assets */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(20px)",
            }}
          >
            <p className="text-gray-400 text-xs font-semibold uppercase mb-4 tracking-wider">
              My Assigned Assets
            </p>
            {!(data?.my_assets as any[])?.length ? (
              <div className="text-center py-10">
                <Package2 className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No assets assigned yet.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {(data.my_assets as any[]).map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div>
                      <p className="text-white font-semibold text-sm">{a.asset_name}</p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {a.asset_code} · {a.asset_category}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold">
                        assigned
                      </span>
                      <p className="text-gray-500 text-xs mt-1">
                        Since {new Date(a.assigned_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Recent Issues */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(20px)",
            }}
          >
            <p className="text-gray-400 text-xs font-semibold uppercase mb-4 tracking-wider">
              My Recent Issues
            </p>
            {!(data?.recent_issues as any[])?.length ? (
              <div className="text-center py-10">
                <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No issues reported yet.</p>
              </div>
            ) : (
              <div className="space-y-1">
                {(data.recent_issues as any[]).map((issue) => (
                  <div
                    key={issue.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    {issue.photo_url ? (
                      <img
                        src={issue.photo_url}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover shrink-0 border border-white/10"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0 text-sm">
                        ⚠️
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{issue.asset_name}</p>
                      <p className="text-gray-400 text-xs truncate mt-0.5">{issue.issue_description}</p>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 ${issue.issue_status === "open"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-green-500/20 text-green-400"
                        }`}
                    >
                      {issue.issue_status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
