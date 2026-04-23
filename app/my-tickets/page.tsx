"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { getRole, logout } from "@/lib/auth";
import {
  Monitor, LogOut, LayoutDashboard, Laptop, AlertTriangle,
  Menu, X, Plus, CheckCircle, Clock, FileText
} from "lucide-react";
import TopBar from "@/components/TopBar";
import CustomSelect from "@/components/ui/CustomSelect";



const employeeLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Laptop, label: "My Gear", href: "/my-gear" },
  { icon: AlertTriangle, label: "My Tickets", href: "/my-tickets", active: true },
];

const getUrgency = (desc: string) => {
  if (desc?.startsWith("[High]")) return "High";
  if (desc?.startsWith("[Low]")) return "Low";
  return "Medium";
};
const cleanDesc = (desc: string) =>
  desc?.replace(/^\[(High|Medium|Low)\]\s*/, "") ?? desc;

const urgencyColor: any = {
  High: "bg-red-500/20 text-red-400",
  Medium: "bg-amber-500/20 text-amber-400",
  Low: "bg-green-500/20 text-green-400",
};

export default function MyTicketsPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [issues, setIssues] = useState<any[]>([]);
  const [myAssets, setMyAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ asset_id: "", description: "", urgency: "Medium" });
  const [photo, setPhoto] = useState<File | null>(null);

  useEffect(() => {
    const r = getRole();
    if (!r) { router.push("/login"); return; }
    if (r === "admin") { router.push("/dashboard"); return; }
    setRole(r);
    fetchData();
  }, [router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [issueRes, assetRes] = await Promise.all([
        api.get("/api/issues/my"),
        api.get("/api/assignments/my"),
      ]);
      setIssues(issueRes.data);
      setMyAssets(assetRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.asset_id || !form.description.trim()) {
      alert("Please select an asset and describe the issue");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("asset_id", form.asset_id);
      fd.append("issue_description", `[${form.urgency}] ${form.description}`);
      if (photo) fd.append("photo", photo);
      await api.post("/api/issues/report", fd);
      setShowModal(false);
      setForm({ asset_id: "", description: "", urgency: "Medium" });
      setPhoto(null);
      fetchData();
    } catch {
      alert("Failed to submit ticket. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

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
              <span className="text-xs font-semibold text-blue-300">👤 Employee</span>
            </div>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-1">
          {employeeLinks.map((link) => (
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
            <h1 className="text-3xl font-bold text-white">My Tickets </h1>
            <p className="text-gray-400 text-sm mt-1">Track your reported issues</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all">
            <Plus className="w-4 h-4" /> New Ticket
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total", value: issues.length, icon: FileText, color: "from-indigo-400 to-purple-500" },
            { label: "In Progress", value: issues.filter(i => i.issue_status === "in_progress").length, icon: Clock, color: "from-amber-400 to-orange-500" },
            { label: "Resolved", value: issues.filter(i => i.issue_status === "resolved").length, icon: CheckCircle, color: "from-emerald-400 to-green-500" },
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

        {/* Ticket List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Loading tickets...</p>
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center py-20 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <p className="text-white font-semibold">No tickets yet!</p>
            <p className="text-gray-400 text-sm mt-1">All good — raise a ticket if you have an issue.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {issues.map((issue) => {
              const urgency = getUrgency(issue.issue_description);
              return (
                <div key={issue.id} className="rounded-2xl p-5 transition-all hover:scale-[1.005]"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-blue-400 text-xs font-mono">
                          TK-{String(issue.id).padStart(3, "0")}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${urgencyColor[urgency]}`}>
                          {urgency}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ml-auto ${issue.issue_status === "open"
                          ? "bg-red-500/20 text-red-400"
                          : issue.issue_status === "in_progress"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-green-500/20 text-green-400"
                          }`}>{issue.issue_status}</span>
                      </div>
                      <p className="text-white font-semibold text-sm mb-1">
                        {cleanDesc(issue.issue_description)}
                      </p>
                      <p className="text-gray-400 text-xs">
                        🖥️ {issue.asset_name} &nbsp;·&nbsp;
                        📅 {new Date(issue.reported_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    {issue.photo_url && (
                      <img src={issue.photo_url} alt="issue"
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/10" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-md rounded-2xl p-6"
            style={{ background: "rgba(15,23,42,0.98)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">New Ticket </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase mb-2 block">Select Asset *</label>
                {myAssets.length === 0 ? (
                  <div className="w-full bg-amber-500/10 border border-amber-500/20 text-amber-300 px-4 py-3 rounded-xl text-sm">
                    ⚠️ No assets assigned to you yet. Contact your admin to get an asset assigned first.
                  </div>
                ) : (
                  <CustomSelect
                    value={form.asset_id}
                    onChange={val => setForm({ ...form, asset_id: val })}
                    options={myAssets.map(a => ({
                      value: String(a.asset_id),
                      label: `${a.asset_name} (${a.asset_code})`
                    }))}
                    placeholder="-- Select your asset --"
                  />
                )}
              </div>

              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase mb-2 block">Description *</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the issue..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 resize-none placeholder:text-gray-600" />
              </div>

              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase mb-2 block">Urgency</label>
                <div className="flex gap-2">
                  {["Low", "Medium", "High"].map(u => (
                    <button key={u} onClick={() => setForm({ ...form, urgency: u })}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all border ${form.urgency === u
                        ? u === "High" ? "bg-red-500/20 border-red-500/40 text-red-300"
                          : u === "Medium" ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                            : "bg-green-500/20 border-green-500/40 text-green-300"
                        : "bg-white/5 border-white/10 text-gray-500"
                        }`}>
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase mb-2 block">
                  Photo <span className="text-gray-600 normal-case">(optional)</span>
                </label>
                <input type="file" accept="image/*"
                  onChange={e => setPhoto(e.target.files?.[0] || null)}
                  className="w-full text-gray-400 text-sm file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:text-xs file:font-semibold" />
              </div>

              <button onClick={handleSubmit} disabled={submitting}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl disabled:opacity-50 transition-all text-sm">
                {submitting ? "Submitting..." : "Submit Report →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
