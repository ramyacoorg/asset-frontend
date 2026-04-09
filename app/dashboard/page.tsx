"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getRole, logout, getToken } from "@/lib/auth";
import {
  LayoutDashboard, Package, Users, FileText,
  GitBranch, LogOut, Menu, X, Monitor,
  TrendingUp, AlertTriangle, CheckCircle, Clock, Camera, BarChart2
} from "lucide-react";

interface AdminStats {
  total_assets: number;
  available: number;
  assigned: number;
  under_repair: number;
  retired: number;
  total_users: number;
  open_issues: number;
  resolved_issues: number;
  recent_issues: any[];
}

interface EmployeeStats {
  my_assets: number;
  open_tickets: number;
  total_tickets: number;
  full_name: string;
  email: string;
}

interface Profile {
  full_name: string;
  email: string;
  role: string;
  photo_url: string | null;
}

const API = "https://assettracker-production-e745.up.railway.app";

export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [employeeStats, setEmployeeStats] = useState<EmployeeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const r = getRole();
    if (!r) router.push("/login");
    else {
      setRole(r);
      fetchProfile();
      if (r === "admin") fetchAdminStats();
      else fetchEmployeeStats();
    }
  }, [router]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API}/api/profile/me`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) setProfile(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchAdminStats = async () => {
    try {
      const res = await fetch(`${API}/api/dashboard/admin`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) setAdminStats(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchEmployeeStats = async () => {
    try {
      const res = await fetch(`${API}/api/dashboard/employee`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) setEmployeeStats(await res.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`${API}/api/profile/photo`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      });
      const data = await res.json();
      setProfile(prev => prev ? { ...prev, photo_url: data.photo_url } : prev);
    } catch (err) { console.error(err); }
  };

  const isAdmin = role === "admin";

  const adminLinks = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", active: true },
    { icon: Package, label: "Inventory", href: "/inventory" },
    { icon: Users, label: "All Users", href: "/users" },
    { icon: GitBranch, label: "Assignments", href: "/assignments" },
    { icon: AlertTriangle, label: "Issues", href: "/issues" },
    { icon: FileText, label: "Reports", href: "/reports" },
  ];

  const employeeLinks = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", active: true },
    { icon: Monitor, label: "My Gear", href: "/my-gear" },
    { icon: FileText, label: "My Tickets", href: "/my-tickets" },
  ];

  const links = isAdmin ? adminLinks : employeeLinks;

  if (!role) return null;

  const DonutChart = ({ available, assigned, repair }: { available: number, assigned: number, repair: number }) => {
    const total = available + assigned + repair || 1;
    const circumference = 2 * Math.PI * 40;
    const availDash = (available / total) * circumference;
    const assignDash = (assigned / total) * circumference;
    const repairDash = (repair / total) * circumference;
    return (
      <div className="flex items-center gap-6">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="16" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="16"
            strokeDasharray={`${availDash} ${circumference - availDash}`}
            strokeDashoffset={circumference * 0.25} />
          <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="16"
            strokeDasharray={`${assignDash} ${circumference - assignDash}`}
            strokeDashoffset={circumference * 0.25 - availDash} />
          <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="16"
            strokeDasharray={`${repairDash} ${circumference - repairDash}`}
            strokeDashoffset={circumference * 0.25 - availDash - assignDash} />
          <text x="50" y="54" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">{total}</text>
        </svg>
        <div className="space-y-2">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500" /><span className="text-gray-300 text-xs">Available: {available}</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-gray-300 text-xs">Assigned: {assigned}</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-gray-300 text-xs">Repair: {repair}</span></div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex"
      style={{
        background: isAdmin
          ? "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)"
          : "linear-gradient(135deg, #e0e7ff 0%, #f0f9ff 40%, #fdf4ff 100%)",
      }}>

      {/* SIDEBAR */}
      <div className={`${sidebarOpen ? "w-64" : "w-16"} flex flex-col transition-all duration-500`}
        style={{
          background: isAdmin ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.45)",
          backdropFilter: "blur(24px)",
          borderRight: isAdmin ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.6)",
        }}>

        <div className="p-4 flex items-center justify-between"
          style={{ borderBottom: isAdmin ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(255,255,255,0.5)" }}>
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl shadow-lg">
                <Monitor className="w-4 h-4 text-white" />
              </div>
              <span className={`font-bold text-sm ${isAdmin ? "text-white" : "text-gray-800"}`}>OptiAsset</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`${isAdmin ? "text-gray-400 hover:text-white" : "text-gray-400 hover:text-gray-700"}`}>
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Profile */}
        {sidebarOpen && (
          <div className="px-4 py-4"
            style={{ borderBottom: isAdmin ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(255,255,255,0.4)" }}>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  {profile?.photo_url ? (
                    <img src={profile.photo_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-sm">{profile?.full_name?.[0] ?? "U"}</span>
                  )}
                </div>
                <button onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-3 h-3 text-white" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isAdmin ? "text-white" : "text-gray-800"}`}>
                  {profile?.full_name ?? "Loading..."}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  isAdmin ? "bg-blue-500/20 text-blue-300" : "bg-green-500/20 text-green-700"
                }`}>
                  {isAdmin ? "Admin" : " Employee"}
                </span>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-1">
          {links.map((link) => (
            <button key={link.label} onClick={() => router.push(link.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                link.active
                  ? isAdmin
                    ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/20"
                    : "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-700 border border-blue-200/50"
                  : isAdmin
                    ? "text-gray-400 hover:text-white hover:bg-white/10"
                    : "text-gray-500 hover:text-gray-800 hover:bg-white/50"
              }`}>
              <link.icon className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span>{link.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-3" style={{ borderTop: isAdmin ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(255,255,255,0.5)" }}>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-sm">
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isAdmin ? "text-white" : "text-gray-800"}`}>
            {isAdmin ? "Admin Dashboard " : "My Dashboard "}
          </h1>
          <p className={`text-sm mt-1 ${isAdmin ? "text-gray-400" : "text-gray-500"}`}>
            Welcome back, {profile?.full_name ?? ""}!
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className={isAdmin ? "text-gray-400" : "text-gray-500"}>Loading dashboard...</p>
          </div>
        ) : isAdmin && adminStats ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Assets", value: adminStats.total_assets, icon: Package, color: "from-blue-400 to-blue-600", click: "/inventory" },
                { label: "Total Users", value: adminStats.total_users, icon: Users, color: "from-purple-400 to-purple-600", click: "/users" },
                { label: "Open Issues", value: adminStats.open_issues, icon: AlertTriangle, color: "from-orange-400 to-red-400", click: "/issues" },
                { label: "Resolved", value: adminStats.resolved_issues, icon: CheckCircle, color: "from-green-400 to-emerald-500", click: "/issues" },
              ].map((stat) => (
                <button key={stat.label} onClick={() => router.push(stat.click)}
                  className="rounded-2xl p-5 text-left transition-all hover:scale-[1.02] hover:shadow-xl"
                  style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-xl w-fit mb-3 shadow-lg`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
                  <p className="text-blue-400 text-xs mt-1">Click to view →</p>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="rounded-2xl p-6"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-blue-400" /> Asset Status
                </h3>
                <DonutChart available={adminStats.available} assigned={adminStats.assigned} repair={adminStats.under_repair} />
              </div>

              <div className="rounded-2xl p-6"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" /> Asset Breakdown
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Available", value: adminStats.available, total: adminStats.total_assets, color: "bg-blue-500" },
                    { label: "Assigned", value: adminStats.assigned, total: adminStats.total_assets, color: "bg-emerald-500" },
                    { label: "Under Repair", value: adminStats.under_repair, total: adminStats.total_assets, color: "bg-amber-500" },
                    { label: "Retired", value: adminStats.retired, total: adminStats.total_assets, color: "bg-red-500" },
                  ].map((bar) => (
                    <div key={bar.label}>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>{bar.label}</span>
                        <span>{bar.value}</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div className={`${bar.color} h-2 rounded-full`}
                          style={{ width: `${bar.total ? (bar.value / bar.total) * 100 : 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-6"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400" /> Recent Issues
                </h3>
                <button onClick={() => router.push("/issues")} className="text-blue-400 text-xs hover:text-blue-300">
                  View All →
                </button>
              </div>
              {adminStats.recent_issues.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No issues reported yet 🎉</p>
              ) : (
                <div className="space-y-3">
                  {adminStats.recent_issues.map((issue: any) => (
                    <div key={issue.id} className="flex items-center justify-between p-3 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="flex items-center gap-3">
                        {issue.photo_url ? (
                          <img src={issue.photo_url} alt="Issue" className="w-10 h-10 object-cover rounded-lg" />
                        ) : (
                          <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-orange-400" />
                          </div>
                        )}
                        <div>
                          <p className="text-white text-sm font-medium">{issue.issue_description}</p>
                          <p className="text-gray-400 text-xs">Asset #{issue.asset_id} • {new Date(issue.reported_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        issue.issue_status === "open" ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"
                      }`}>{issue.issue_status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : !isAdmin && employeeStats ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "My Assigned Assets", value: employeeStats.my_assets, icon: Monitor, color: "from-blue-400 to-blue-600", click: "/my-gear", sub: "Click to view →" },
                { label: "Open Tickets", value: employeeStats.open_tickets, icon: Clock, color: "from-orange-400 to-red-400", click: "/my-tickets", sub: "Needs attention" },
                { label: "Total Tickets", value: employeeStats.total_tickets, icon: FileText, color: "from-purple-400 to-purple-600", click: "/my-tickets", sub: "All time" },
              ].map((stat) => (
                <button key={stat.label} onClick={() => router.push(stat.click)}
                  className="rounded-2xl p-6 text-left transition-all hover:scale-[1.02] hover:shadow-xl"
                  style={{
                    background: "rgba(255,255,255,0.55)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.7)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
                  }}>
                  <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-xl w-fit mb-3 shadow-lg`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-gray-600 text-sm mt-1">{stat.label}</p>
                  <p className="text-blue-500 text-xs mt-1">{stat.sub}</p>
                </button>
              ))}
            </div>

            <div className="rounded-2xl p-6"
              style={{
                background: "rgba(255,255,255,0.55)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.7)",
              }}>
              <h3 className="text-gray-800 font-semibold mb-4">Quick Actions ⚡</h3>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => router.push("/my-gear")}
                  className="p-4 rounded-xl text-left hover:scale-[1.02] transition-all"
                  style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
                  <Monitor className="w-5 h-5 text-blue-500 mb-2" />
                  <p className="text-gray-700 font-medium text-sm">View My Gear</p>
                 </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
        }
