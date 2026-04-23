"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { getRole, logout } from "@/lib/auth";
import { Monitor, LogOut, LayoutDashboard, Package, Users, GitBranch, FileText, Menu, X, Plus, AlertTriangle, ChevronLeft, ChevronRight, CheckCircle, RotateCcw } from "lucide-react";
import TopBar from "@/components/TopBar";
import CustomSelect from "@/components/ui/CustomSelect";

const adminLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Package, label: "Inventory", href: "/inventory" },
  { icon: Users, label: "All Users", href: "/users" },
  { icon: GitBranch, label: "Assignments", href: "/assignments", active: true },
  { icon: AlertTriangle, label: "Issues", href: "/issues" },
  { icon: FileText, label: "Audit Logs", href: "/audit" },
  { icon: FileText, label: "Exit Checklist", href: "/exit-checklist" },
  { icon: FileText, label: "Reports", href: "/reports" },
];

export default function AssignmentsPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [availableAssets, setAvailableAssets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ asset_id: "", employee_id: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    const r = getRole();
    if (!r) { router.push("/login"); return; }
    if (r !== "admin") { router.push("/dashboard"); return; }
    setRole(r);
    fetchAll();
  }, [router]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [aRes, asRes, uRes] = await Promise.all([
        api.get("/api/assignments/"),
        api.get("/api/assets/"),
        api.get("/api/users/"),
      ]);
      setAssignments(aRes.data);
      setAvailableAssets(asRes.data.filter((a: any) => a.asset_status === "available"));
      setUsers(uRes.data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      setError(err?.response?.data?.detail || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!form.asset_id || !form.employee_id) { alert("Select both asset and employee"); return; }
    setSubmitting(true);
    try {
      await api.post("/api/assignments/assign", {
        asset_id: parseInt(form.asset_id),
        employee_id: parseInt(form.employee_id),
      });
      setShowModal(false);
      setForm({ asset_id: "", employee_id: "" });
      fetchAll();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      alert(err?.response?.data?.detail || "Failed to assign");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturn = async (id: number) => {
    if (!confirm("Mark this asset as returned?")) return;
    try {
      await api.patch(`/api/assignments/${id}/return`);
      fetchAll();
    } catch {
      alert("Failed to return asset");
    }
  };

  const totalPages = Math.ceil(assignments.length / ITEMS_PER_PAGE) || 1;
  const paginated = assignments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
          {adminLinks.map((link) => (
            <button key={link.label} onClick={() => router.push(link.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${link.active
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
        <TopBar />
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Assignments </h1>
            <p className="text-gray-400 text-sm mt-1">Track asset assignments across employees</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all">
            <Plus className="w-4 h-4" /> Assign Asset
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total", value: assignments.length, icon: GitBranch, color: "from-indigo-400 to-purple-500" },
            { label: "Active", value: assignments.filter(a => a.status === "active").length, icon: CheckCircle, color: "from-emerald-400 to-green-500" },
            { label: "Returned", value: assignments.filter(a => a.status === "returned").length, icon: RotateCcw, color: "from-amber-400 to-orange-500" },
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

        {/* List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Loading assignments...</p>
          </div>
        ) : error ? (
          <p className="text-red-400">{error}</p>
        ) : assignments.length === 0 ? (
          <div className="text-center py-20 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <GitBranch className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-white font-semibold">No assignments yet</p>
            <p className="text-gray-400 text-sm mt-1">Assign an asset to get started.</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-400">
                  <th className="text-left px-6 py-4">Employee</th>
                  <th className="text-left px-6 py-4">Asset</th>
                  <th className="text-left px-6 py-4">Date</th>
                  <th className="text-left px-6 py-4">Status</th>
                  <th className="text-left px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginated.map(a => (
                  <tr key={a.id} className="hover:bg-white/5 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                          {a.employee_name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <span className="text-white font-medium">{a.employee_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{a.asset_name}</p>
                      <p className="text-cyan-400 font-mono text-xs mt-0.5">{a.asset_code}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {a.return_date ? `Returned: ${new Date(a.return_date).toLocaleDateString()}` : `Since: ${new Date(a.assigned_date).toLocaleDateString()}`}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${a.status === "active"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-amber-500/20 text-amber-400"
                        }`}>{a.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      {a.status === "active" && (
                        <button onClick={() => handleReturn(a.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition-all text-xs font-semibold">
                          <RotateCcw className="w-3 h-3" /> Return
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && assignments.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between mt-6 px-4">
            <p className="text-xs text-gray-400">
              Showing <span className="font-semibold text-white">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> to <span className="font-semibold text-white">{Math.min(currentPage * ITEMS_PER_PAGE, assignments.length)}</span> of <span className="font-semibold text-white">{assignments.length}</span> assignments
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-30 transition-all border border-white/10">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-xl text-xs font-semibold transition-all ${currentPage === i + 1 ? "bg-blue-500/20 text-blue-400 border border-blue-500/20" : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}>
                    {i + 1}
                  </button>
                ))}
              </div>
              <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white disabled:opacity-30 transition-all border border-white/10">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-md rounded-2xl p-6"
            style={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-lg">Assign Asset 🔗</h2>
              <button onClick={() => { setShowModal(false); setForm({ asset_id: "", employee_id: "" }); }}
                className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase mb-2 block">Available Asset</label>
                <CustomSelect
                  value={form.asset_id}
                  onChange={val => setForm({ ...form, asset_id: val })}
                  options={availableAssets.map((a: any) => ({
                    value: String(a.id),
                    label: `${a.asset_name} (${a.asset_code})`
                  }))}
                  placeholder="-- Select Asset --"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase mb-2 block">Employee</label>
                <CustomSelect
                  value={form.employee_id}
                  onChange={val => setForm({ ...form, employee_id: val })}
                  options={users.map((u: any) => ({
                    value: String(u.id),
                    label: `${u.full_name} (${u.email})`
                  }))}
                  placeholder="-- Select Employee --"
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => { setShowModal(false); setForm({ asset_id: "", employee_id: "" }); }}
                  className="flex-1 py-3 bg-white/5 border border-white/10 text-gray-300 rounded-xl text-sm">
                  Cancel
                </button>
                <button onClick={handleAssign} disabled={submitting}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl text-sm disabled:opacity-50">
                  {submitting ? "Assigning..." : "Assign"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
