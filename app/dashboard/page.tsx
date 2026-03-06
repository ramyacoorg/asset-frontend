"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRole, logout } from "@/lib/auth";
import {
  LayoutDashboard, Package, Users, FileText,
  GitBranch, LogOut, Menu, X, Monitor
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const r = getRole();
    if (!r) {
      router.push("/login");
    } else {
      setRole(r);
    }
  }, [router]);

  const adminLinks = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Package, label: "Inventory", href: "/inventory" },
    { icon: Users, label: "All Users", href: "/users" },
    { icon: GitBranch, label: "Assignments", href: "/assignments" },
    { icon: FileText, label: "Reports", href: "/reports" },
  ];

  const employeeLinks = [
    { icon: Monitor, label: "My Gear", href: "/my-gear" },
    { icon: FileText, label: "My Tickets", href: "/my-tickets" },
  ];

  const links = role === "admin" ? adminLinks : employeeLinks;

  if (!role) return null;

  return (
    <div className="min-h-screen flex bg-slate-950 text-white">

      {/* SIDEBAR */}
      <div className={`${sidebarOpen ? "w-64" : "w-16"} bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300`}>

        {/* Logo */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Monitor className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">OptiAsset</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Role Badge */}
        {sidebarOpen && (
          <div className="px-4 py-3">
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${role === "admin" ? "bg-blue-600/20 text-blue-400" : "bg-green-600/20 text-green-400"}`}>
              {role === "admin" ? "Administrator" : " Employee"}
            </span>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 p-3 space-y-1">
          {links.map((link) => (
            <button
              key={link.label}
              onClick={() => router.push(link.href)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-sm"
            >
              <link.icon className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span>{link.label}</span>}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-sm"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">
            {role === "admin" ? "Admin Dashboard " : "My Dashboard "}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>

        {/* Stat Cards - Admin Only */}
        {role === "admin" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <p className="text-slate-400 text-sm">Total Assets</p>
              <p className="text-3xl font-bold text-white mt-2">124</p>
              <p className="text-blue-400 text-xs mt-1">↑ 4 added this week</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <p className="text-slate-400 text-sm">Deployed Assets</p>
              <p className="text-3xl font-bold text-white mt-2">98</p>
              <p className="text-green-400 text-xs mt-1">↑ 79% utilization</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <p className="text-slate-400 text-sm">Under Repair</p>
              <p className="text-3xl font-bold text-white mt-2">6</p>
              <p className="text-red-400 text-xs mt-1">↓ 2 fixed this week</p>
            </div>
          </div>
        )}

        {/* Employee View */}
        {role === "employee" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <p className="text-slate-400 text-sm">My Assigned Assets</p>
              <p className="text-3xl font-bold text-white mt-2">2</p>
              <p className="text-green-400 text-xs mt-1">All in good condition</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <p className="text-slate-400 text-sm">Open Tickets</p>
              <p className="text-3xl font-bold text-white mt-2">0</p>
              <p className="text-slate-400 text-xs mt-1">No issues reported</p>
            </div>
          </div>
        )}

        {/* Recent Assignments Table - Admin Only */}
        {role === "admin" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4">Recent Assignments</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="text-left pb-3">Employee</th>
                  <th className="text-left pb-3">Asset</th>
                  <th className="text-left pb-3">Date</th>
                  <th className="text-left pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                <tr className="border-b border-slate-800/50">
                  <td className="py-3">Ramya</td>
                  <td className="py-3">Dell Laptop #001</td>
                  <td className="py-3">Mar 1, 2026</td>
                  <td className="py-3"><span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">Active</span></td>
                </tr>
                <tr className="border-b border-slate-800/50">
                  <td className="py-3">Ben</td>
                  <td className="py-3">MacBook Pro #002</td>
                  <td className="py-3">Feb 28, 2026</td>
                  <td className="py-3"><span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">Active</span></td>
                </tr>
                <tr>
                  <td className="py-3">Priya</td>
                  <td className="py-3">HP Laptop #003</td>
                  <td className="py-3">Feb 25, 2026</td>
                  <td className="py-3"><span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs">Returned</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}