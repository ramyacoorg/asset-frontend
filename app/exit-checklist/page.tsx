"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { getRole, logout } from "@/lib/auth";
import {
  Monitor, LogOut, LayoutDashboard, Package, Users, GitBranch,
  FileText, Menu, X, AlertTriangle, ScrollText, ClipboardList, CheckCircle, Clock
} from "lucide-react";

interface ChecklistItem {
  id: number;
  employee_id: number;
  employee_name: string;
  asset_id: number;
  asset_name: string;
  asset_code: string;
  status: string;
}

interface User {
  id: number;
  full_name: string;
  email: string;
  is_active: boolean;
}

const adminLinks = [
  { icon: LayoutDashboard, label: "Dashboard",       href: "/dashboard" },
  { icon: Package,         label: "Inventory",       href: "/inventory" },
  { icon: Users,           label: "All Users",       href: "/users" },
  { icon: GitBranch,       label: "Assignments",     href: "/assignments" },
  { icon: AlertTriangle,   label: "Issues",          href: "/issues" },
  { icon: ScrollText,      label: "Audit Logs",      href: "/audit" },
  { icon: ClipboardList,   label: "Exit Checklist",  href: "/exit-checklist", active: true },
  { icon: FileText,        label: "Reports",         href: "/reports" },
];

export default function ExitChecklistPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<number | null>(null);
  const [marking, setMarking] = useState<number | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");

  useEffect(() => {
    const r = getRole();
    if (!r) { router.push("/login"); return; }
    if (r !== "admin") { router.push("/dashboard"); return; }
    setRole(r);
    fetchData();
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    const [cl, us] = await Promise.all([
      api.get("/api/hr/exit-checklist").catch(() => ({ data: [] })),
      api.get("/api/users/").catch(() => ({ data: [] })),
    ]);
    setItems(cl.data);
    setUsers(Array.isArray(us.data) ? us.data : []);
    setLoading(false);
  };

  const handleGenerate = async () => {
    if (!selectedEmployee) { alert("Select an employee first"); return; }
    setGenerating(Number(selectedEmployee));
    await api.post(`/api/hr/exit-checklist/${selectedEmployee}`).catch(e => alert(e?.response?.data?.detail || "Failed"));
    setGenerating(null);
    setSelectedEmployee("");
    fetchData();
  };

  const handleMarkReturned = async (id: number) => {
    setMarking(id);
    await api.patch(`/api/hr/exit-checklist/${id}/mark-returned`).catch(e => alert(e?.response?.data?.detail || "Failed"));
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: "Returned" } : i));
    setMarking(null);
  };

  const grouped: Record<string, ChecklistItem[]> = {};
  items.forEach(i => {
    if (!grouped[i.employee_name]) grouped[i.employee_name] = [];
    grouped[i.employee_name].push(i);
  });

  if (!role) return null;

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
              <span className="font-bold text-white text-sm">Assentra</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white">
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {adminLinks.map(link => (
            <button key={link.href} onClick={() => router.push(link.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${link.active ? "bg-blue-500/20 text-blue-400" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
              <link.icon className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && <span>{link.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={() => { logout(); router.push("/login"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Exit Checklist</h1>
            <p className="text-gray-400 text-sm mt-1">Manage asset recovery when employees leave</p>
          </div>
          {/* Generate form */}
          <div className="flex items-center gap-3">
            <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}
              className="bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-blue-500">
              <option value="">Select employee…</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
            </select>
            <button onClick={handleGenerate} disabled={!!generating}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:shadow-xl transition-all disabled:opacity-50">
              {generating ? <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" /> : <ClipboardList className="w-4 h-4" />}
              Generate Checklist
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Loading checklists...</p>
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <div className="text-center py-20 rounded-2xl" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <ClipboardList className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-white font-semibold">No exit checklists yet</p>
            <p className="text-gray-400 text-sm mt-1">Select an employee above and generate their checklist.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([name, list]) => {
              const returned = list.filter(i => i.status === "Returned").length;
              const pct = Math.round((returned / list.length) * 100);
              return (
                <div key={name} className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">{name[0]}</div>
                      <div>
                        <p className="text-white font-semibold">{name}</p>
                        <p className="text-gray-400 text-xs">{returned}/{list.length} assets returned</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-white/10 rounded-full h-2">
                        <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-400">{pct}%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {list.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                        <div className="flex items-center gap-3">
                          {item.status === "Returned"
                            ? <CheckCircle className="w-4 h-4 text-green-400" />
                            : <Clock className="w-4 h-4 text-amber-400" />}
                          <div>
                            <p className="text-white text-sm font-medium">{item.asset_name}</p>
                            <p className="text-gray-400 text-xs font-mono">{item.asset_code}</p>
                          </div>
                        </div>
                        {item.status === "Pending" ? (
                          <button onClick={() => handleMarkReturned(item.id)} disabled={marking === item.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg text-xs font-semibold transition-all disabled:opacity-50">
                            {marking === item.id ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                            Mark Returned
                          </button>
                        ) : (
                          <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">Returned ✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
