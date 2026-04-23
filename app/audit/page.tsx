"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { getRole, logout } from "@/lib/auth";
import {
  Monitor, LogOut, LayoutDashboard, Package, Users, GitBranch,
  FileText, Menu, X, AlertTriangle, ScrollText, ChevronLeft, ChevronRight, Search
} from "lucide-react";
import TopBar from "@/components/TopBar";
import CustomSelect from "@/components/ui/CustomSelect";

interface Log {
  id: number;
  user_id: number | null;
  user_name: string;
  action: string;
  asset_id: number | null;
  asset_name: string | null;
  description: string | null;
  timestamp: string;
}

const ACTION_COLORS: Record<string, string> = {
  ADD_ASSET:    "bg-green-500/20 text-green-400",
  EDIT_ASSET:   "bg-blue-500/20 text-blue-400",
  DELETE_ASSET: "bg-red-500/20 text-red-400",
  ASSIGN_ASSET: "bg-purple-500/20 text-purple-400",
  RETURN_ASSET: "bg-amber-500/20 text-amber-400",
};

const adminLinks = [
  { icon: LayoutDashboard, label: "Dashboard",      href: "/dashboard" },
  { icon: Package,         label: "Inventory",      href: "/inventory" },
  { icon: Users,           label: "All Users",      href: "/users" },
  { icon: GitBranch,       label: "Assignments",    href: "/assignments" },
  { icon: AlertTriangle,   label: "Issues",         href: "/issues" },
  { icon: ScrollText,      label: "Audit Logs",     href: "/audit", active: true },
  { icon: FileText,        label: "Exit Checklist", href: "/exit-checklist" },
  { icon: FileText,        label: "Reports",        href: "/reports" },
];

const ITEMS = 15;

export default function AuditPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [logs, setLogs] = useState<Log[]>([]);
  const [filtered, setFiltered] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const r = getRole();
    if (!r) { router.push("/login"); return; }
    if (r !== "admin") { router.push("/dashboard"); return; }
    setRole(r);
    api.get("/api/audit/").then(res => { setLogs(res.data); setFiltered(res.data); }).catch(console.error).finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    let data = logs;
    if (actionFilter !== "ALL") data = data.filter(l => l.action === actionFilter);
    if (search) data = data.filter(l =>
      l.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.description?.toLowerCase().includes(search.toLowerCase()) ||
      l.asset_name?.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(data);
    setCurrentPage(1);
  }, [search, actionFilter, logs]);

  const totalPages = Math.ceil(filtered.length / ITEMS) || 1;
  const paginated = filtered.slice((currentPage - 1) * ITEMS, currentPage * ITEMS);

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
        {sidebarOpen && (
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-2 rounded-xl border border-blue-500/20">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-blue-300"> Administrator</span>
            </div>
          </div>
        )}
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
        <TopBar />
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
            <p className="text-gray-400 text-sm mt-1">Complete history of all system actions</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by user, asset, or description..."
              className="w-full bg-white/5 border border-white/10 text-white pl-11 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 placeholder:text-gray-500" />
          </div>
          <div className="w-48">
            <CustomSelect
              value={actionFilter}
              onChange={val => setActionFilter(val)}
              options={[
                { value: "ALL", label: "All Actions" },
                { value: "ADD_ASSET", label: "ADD_ASSET" },
                { value: "EDIT_ASSET", label: "EDIT_ASSET" },
                { value: "DELETE_ASSET", label: "DELETE_ASSET" },
                { value: "ASSIGN_ASSET", label: "ASSIGN_ASSET" },
                { value: "RETURN_ASSET", label: "RETURN_ASSET" }
              ]}
              className="w-full"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Loading audit logs...</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-400">
                  <th className="text-left px-6 py-4">#</th>
                  <th className="text-left px-6 py-4">User</th>
                  <th className="text-left px-6 py-4">Action</th>
                  <th className="text-left px-6 py-4">Description</th>
                  <th className="text-left px-6 py-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginated.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-gray-500">No logs found</td></tr>
                ) : paginated.map(log => (
                  <tr key={log.id} className="hover:bg-white/5 transition-all">
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{log.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">{log.user_name?.[0] ?? "?"}</div>
                        <span className="text-white text-sm">{log.user_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ACTION_COLORS[log.action] ?? "bg-gray-500/20 text-gray-400"}`}>{log.action}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-xs max-w-xs truncate">{log.description}</td>
                    <td className="px-6 py-4 text-gray-400 text-xs whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filtered.length > ITEMS && (
          <div className="flex items-center justify-between mt-6 px-4">
            <p className="text-xs text-gray-400">
              Showing <span className="font-semibold text-white">{(currentPage - 1) * ITEMS + 1}</span> – <span className="font-semibold text-white">{Math.min(currentPage * ITEMS, filtered.length)}</span> of <span className="font-semibold text-white">{filtered.length}</span> logs
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 disabled:opacity-30 border border-white/10 transition-all">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-xl text-xs font-semibold transition-all ${currentPage === i + 1 ? "bg-blue-500/20 text-blue-400 border border-blue-500/20" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
                  {i + 1}
                </button>
              ))}
              <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 disabled:opacity-30 border border-white/10 transition-all">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
