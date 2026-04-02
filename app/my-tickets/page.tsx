"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRole, logout } from "@/lib/auth";
import { Monitor, LogOut, LayoutDashboard, FileText, Menu, X, Clock, CheckCircle, AlertTriangle, Plus } from "lucide-react";

export default function MyTicketsPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const r = getRole();
    if (!r) router.push("/login");
    else setRole(r);
  }, [router]);

  if (!role) return null;

  const tickets = [
    { id: "TK-001", issue: "Screen flickering issue", asset: "Dell XPS DL-001", date: "Mar 1, 2026", status: "In Progress", urgency: "High", icon: AlertTriangle, color: "from-orange-400 to-red-400" },
    { id: "TK-002", issue: "Battery draining fast", asset: "iPhone 14 IP-014", date: "Feb 20, 2026", status: "Resolved", urgency: "Medium", icon: CheckCircle, color: "from-green-400 to-emerald-500" },
  ];

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "linear-gradient(135deg, #5869a1 0%, #ebbb8f 40%, #734449 100%)" }}
    >
      {/* SIDEBAR */}
      <div
        className={`${sidebarOpen ? "w-64" : "w-16"} flex flex-col transition-all duration-500`}
        style={{
          background: "rgba(255,255,255,0.45)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRight: "1px solid rgba(255,255,255,0.6)",
          boxShadow: "4px 0 24px rgba(0,0,0,0.06)",
        }}
      >
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.5)" }}>
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl shadow-lg">
                <Monitor className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-800 text-sm">OptiAsset</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-gray-700">
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {sidebarOpen && (
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 bg-gradient-to-r from-green-400/20 to-emerald-400/20 px-3 py-2 rounded-xl border border-green-200/50">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-green-700"> Employee</span>
            </div>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-1">
          {[
            { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
            { icon: Monitor, label: "My Gear", href: "/my-gear" },
            { icon: FileText, label: "My Tickets", href: "/my-tickets", active: true },
          ].map((link) => (
            <button
              key={link.label}
              onClick={() => router.push(link.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                link.active
                  ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-700 font-medium border border-blue-200/50"
                  : "text-gray-500 hover:text-gray-800 hover:bg-white/50"
              }`}
            >
              <link.icon className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span>{link.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.5)" }}>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-50/50 transition-all text-sm">
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Tickets 🎫</h1>
            <p className="text-gray-500 text-sm mt-1">Track all your reported issues</p>
          </div>
          <button className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all">
            <Plus className="w-4 h-4" />
            New Ticket
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Tickets", value: "2", icon: FileText, color: "from-blue-400 to-blue-600" },
            { label: "In Progress", value: "1", icon: Clock, color: "from-orange-400 to-red-400" },
            { label: "Resolved", value: "1", icon: CheckCircle, color: "from-green-400 to-emerald-500" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-5 flex items-center gap-4"
              style={{
                background: "rgba(255,255,255,0.55)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.7)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
              }}
            >
              <div className={`bg-gradient-to-br ${s.color} p-3 rounded-xl shadow-lg`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                <p className="text-gray-500 text-xs">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Ticket Cards */}
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="rounded-2xl p-5 transition-all hover:scale-[1.01]"
              style={{
                background: "rgba(255,255,255,0.6)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.8)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`bg-gradient-to-br ${ticket.color} p-3 rounded-xl shadow-lg`}>
                    <ticket.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-400 text-xs font-mono">{ticket.id}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        ticket.urgency === "High" ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                      }`}>{ticket.urgency}</span>
                    </div>
                    <h3 className="text-gray-800 font-semibold">{ticket.issue}</h3>
                    <p className="text-gray-400 text-xs mt-0.5">{ticket.asset} • {ticket.date}</p>
                  </div>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  ticket.status === "Resolved"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {ticket.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}