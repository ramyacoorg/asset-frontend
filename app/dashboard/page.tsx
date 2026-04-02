"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getRole, logout, getToken } from "@/lib/auth";
import {
  LayoutDashboard, Package, Users, FileText,
  GitBranch, LogOut, Menu, X, Monitor,
  TrendingUp, AlertTriangle, CheckCircle, Clock, Camera
} from "lucide-react";

interface Profile {
  full_name: string;
  email: string;
  role: string;
  photo_url: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const r = getRole();
    if (!r) router.push("/login");
    else {
      setRole(r);
      fetchProfile();
    }
  }, [router]);

  const fetchProfile = async () => {
    try {
      const token = getToken();
      const res = await fetch("http://localhost:8000/api/profile/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = getToken();
      const res = await fetch("http://localhost:8000/api/profile/photo", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      setProfile(prev => prev ? { ...prev, photo_url: data.photo_url } : prev);
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

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

  const links = role === "admin" ? adminLinks : employeeLinks;
  const isAdmin = role === "admin";

  if (!role) return null;

  return (
    <div className="min-h-screen flex"
      style={{
        background: isAdmin
          ? "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)"
          : "linear-gradient(135deg, #e0e7ff 0%, #f0f9ff 40%, #fdf4ff 100%)",
      }}
    >
      {/* SIDEBAR */}
      <div
        className={`${sidebarOpen ? "w-64" : "w-16"} flex flex-col transition-all duration-500`}
        style={{
          background: isAdmin ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.45)",
          backdropFilter: "blur(24px)",
          borderRight: isAdmin ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.6)",
        }}
      >
        {/* Logo */}
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
            className={`${isAdmin ? "text-gray-400 hover:text-white" : "text-gray-400 hover:text-gray-700"} transition-colors`}>
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* PROFILE SECTION */}
        {sidebarOpen && (
          <div className="px-4 py-4" style={{ borderBottom: isAdmin ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(255,255,255,0.4)" }}>
            <div className="flex items-center gap-3">
              {/* Profile Photo */}
              <div className="relative group">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  {profile?.photo_url ? (
                    <img src={profile.photo_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-sm">
                      {profile?.full_name?.[0] ?? "U"}
                    </span>
                  )}
                </div>
                {/* Camera icon on hover */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera className="w-3 h-3 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              {/* Name and Role */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${isAdmin ? "text-white" : "text-gray-800"}`}>
                  {profile?.full_name ?? "Loading..."}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  isAdmin
                    ? "bg-blue-500/20 text-blue-300"
                    : "bg-green-500/20 text-green-700"
                }`}>
                  {isAdmin ? "👑 Admin" : "👤 Employee"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Collapsed profile photo */}
        {!sidebarOpen && (
          <div className="p-2 flex justify-center" style={{ borderBottom: isAdmin ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(255,255,255,0.4)" }}>
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              {profile?.photo_url ? (
                <img src={profile.photo_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-xs">
                  {profile?.full_name?.[0] ?? "U"}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Nav Links */}
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

        {/* Logout */}
        <div className="p-3" style={{ borderTop: isAdmin ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(255,255,255,0.5)" }}>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-sm">
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isAdmin ? "text-white" : "text-gray-800"}`}>
            {isAdmin ? "Admin Dashboard 👑" : "My Dashboard 👤"}
          </h1>
          <p className={`text-sm mt-1 ${isAdmin ? "text-gray-400" : "text-gray-500"}`}>
            Welcome back, {profile?.full_name ?? ""}! Here's what's happening today.
          </p>
        </div>

        {/* ADMIN STATS */}
        {isAdmin && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Assets", value: "124", icon: Package, color: "from-blue-400 to-blue-600", change: "+4 this week" },
                { label: "Deployed", value: "98", icon: CheckCircle, color: "from-green-400 to-emerald-500", change: "79% utilized" },
                { label: "Under Repair", value: "6", icon: AlertTriangle, color: "from-orange-400 to-red-400", change: "2 fixed" },
                { label: "Pending Requests", value: "3", icon: Clock, color: "from-purple-400 to-purple-600", change: "needs review" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl p-5"
                  style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-xl w-fit mb-3 shadow-lg`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
                  <p className="text-blue-400 text-xs mt-1">↑ {stat.change}</p>
                </div>
              ))}
            </div>

            {/* Recent Assignments */}
            <div className="rounded-2xl p-6"
              style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <h2 className="text-white font-semibold mb-5 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                Recent Assignments
              </h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 border-b border-white/10">
                    <th className="text-left pb-3">Employee</th>
                    <th className="text-left pb-3">Asset</th>
                    <th className="text-left pb-3">Date</th>
                    <th className="text-left pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  {[
                    { name: "Ramya", asset: "Dell XPS #001", date: "Mar 1, 2026", status: "Active", color: "green" },
                    { name: "Ben", asset: "MacBook Pro #002", date: "Feb 28, 2026", status: "Active", color: "green" },
                    { name: "Priya", asset: "HP Laptop #003", date: "Feb 25, 2026", status: "Returned", color: "yellow" },
                  ].map((row) => (
                    <tr key={row.name} className="border-b border-white/5 hover:bg-white/5 transition-all">
                      <td className="py-3">{row.name}</td>
                      <td className="py-3">{row.asset}</td>
                      <td className="py-3">{row.date}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          row.color === "green" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                        }`}>{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* EMPLOYEE STATS */}
        {!isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { label: "My Assigned Assets", value: "2", icon: Monitor, color: "from-blue-400 to-blue-600", sub: "All in good condition", subColor: "text-green-600" },
              { label: "Open Tickets", value: "0", icon: AlertTriangle, color: "from-orange-400 to-red-400", sub: "No issues reported", subColor: "text-gray-400" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl p-6"
                style={{ background: "rgba(255,255,255,0.55)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.7)" }}>
                <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-xl w-fit mb-3 shadow-lg`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
                <p className={`text-xs mt-1 ${stat.subColor}`}>{stat.sub}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}