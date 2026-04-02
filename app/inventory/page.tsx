"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRole, logout } from "@/lib/auth";
import { Monitor, LogOut, LayoutDashboard, Package, Users, GitBranch, FileText, Menu, X, Plus, Search } from "lucide-react";

export default function InventoryPage() {
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

  const assets = [
    { id: "DL-001", name: "Dell XPS 15", category: "Laptop", status: "Assigned", employee: "Ramya", date: "Jan 15, 2026" },
    { id: "MB-002", name: "MacBook Pro", category: "Laptop", status: "Assigned", employee: "Ben", date: "Feb 1, 2026" },
    { id: "HP-003", name: "HP EliteBook", category: "Laptop", status: "Available", employee: "-", date: "-" },
    { id: "IP-014", name: "iPhone 14 Pro", category: "Mobile", status: "Assigned", employee: "Ben", date: "Feb 1, 2026" },
    { id: "DL-005", name: "Dell Monitor 27\"", category: "Monitor", status: "Under Repair", employee: "-", date: "-" },
  ];

  const filtered = assets.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.id.toLowerCase().includes(search.toLowerCase())
  );

  const adminLinks = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Package, label: "Inventory", href: "/inventory", active: true },
    { icon: Users, label: "All Users", href: "/users" },
    { icon: GitBranch, label: "Assignments", href: "/assignments" },
    { icon: FileText, label: "Reports", href: "/reports" },
  ];

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
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Inventory 📦</h1>
            <p className="text-gray-400 text-sm mt-1">Manage all company assets</p>
          </div>
          <button className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all">
            <Plus className="w-4 h-4" /> Add Asset
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets..."
            className="w-full bg-white/5 border border-white/10 text-white pl-11 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 placeholder:text-gray-500"
          />
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-gray-400">
                <th className="text-left px-6 py-4">Asset ID</th>
                <th className="text-left px-6 py-4">Name</th>
                <th className="text-left px-6 py-4">Category</th>
                <th className="text-left px-6 py-4">Assigned To</th>
                <th className="text-left px-6 py-4">Date</th>
                <th className="text-left px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="text-gray-300 divide-y divide-white/5">
              {filtered.map((asset) => (
                <tr key={asset.id} className="hover:bg-white/5 transition-all">
                  <td className="px-6 py-4 font-mono text-blue-400 text-xs">{asset.id}</td>
                  <td className="px-6 py-4 font-medium text-white">{asset.name}</td>
                  <td className="px-6 py-4">{asset.category}</td>
                  <td className="px-6 py-4">{asset.employee}</td>
                  <td className="px-6 py-4">{asset.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      asset.status === "Assigned" ? "bg-green-500/20 text-green-400" :
                      asset.status === "Available" ? "bg-blue-500/20 text-blue-400" :
                      "bg-orange-500/20 text-orange-400"
                    }`}>{asset.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}