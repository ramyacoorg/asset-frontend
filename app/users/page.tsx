"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRole, logout } from "@/lib/auth";
import { Monitor, LogOut, LayoutDashboard, Package, Users, GitBranch, FileText, Menu, X, Plus, Search } from "lucide-react";

export default function UsersPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const r = getRole();
    if (!r) router.push("/login");
    else if (r !== "admin") router.push("/my-gear");
    else setRole(r);
  }, [router]);

  if (!role) return null;

  const users = [
    { name: "Ramya", email: "ramya@admin.com", role: "Admin", dept: "IT", status: "Active", joined: "Jan 1, 2026" },
    { name: "Ben", email: "ben@employee.com", role: "Employee", dept: "Engineering", status: "Active", joined: "Feb 1, 2026" },
    { name: "Priya", email: "priya@company.com", role: "Employee", dept: "HR", status: "Active", joined: "Mar 1, 2026" },
  ];

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const adminLinks = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Package, label: "Inventory", href: "/inventory" },
    { icon: Users, label: "All Users", href: "/users", active: true },
    { icon: GitBranch, label: "Assignments", href: "/assignments" },
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
            <h1 className="text-3xl font-bold text-white">All Users 👥</h1>
            <p className="text-gray-400 text-sm mt-1">Manage employee accounts</p>
          </div>
          <button className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full bg-white/5 border border-white/10 text-white pl-11 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 placeholder:text-gray-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtered.map((user) => (
            <div key={user.email} className="rounded-2xl p-5 transition-all hover:scale-[1.02]"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                  {user.name[0]}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{user.name}</p>
                  <p className="text-gray-400 text-xs">{user.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">Role</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    user.role === "Admin" ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"
                  }`}>{user.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">Department</span>
                  <span className="text-gray-300 text-xs">{user.dept}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">Joined</span>
                  <span className="text-gray-300 text-xs">{user.joined}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 text-xs">Status</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                    {user.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}