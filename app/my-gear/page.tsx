"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { getRole, logout } from "@/lib/auth";
import {
  Monitor, LogOut, LayoutDashboard, Laptop, AlertTriangle,
  Menu, X, Package2, CheckCircle
} from "lucide-react";
import TopBar from "@/components/TopBar";



const employeeLinks = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Laptop, label: "My Gear", href: "/my-gear", active: true },
  { icon: AlertTriangle, label: "My Tickets", href: "/my-tickets" },
];

const categoryIcon: any = {
  Laptop: "💻", Mobile: "📱", Monitor: "🖥️", Tablet: "📟", Default: "📦",
};

export default function MyGearPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [issueForm, setIssueForm] = useState({ description: "", urgency: "Medium" });
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const r = getRole();
    if (!r) { router.push("/login"); return; }
    if (r === "admin") { router.push("/dashboard"); return; }
    setRole(r);
    fetchAssets();
  }, [router]);

  const fetchAssets = () => {
    setLoading(true);
    api.get("/api/assignments/my")
      .then(res => setAssets(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const openIssueModal = (asset: any) => {
    setSelectedAsset(asset);
    setIssueForm({ description: "", urgency: "Medium" });
    setPhoto(null);
    setShowIssueModal(true);
  };

  const handleReportIssue = async () => {
    if (!issueForm.description.trim()) { alert("Please describe the issue"); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("asset_id", selectedAsset.asset_id.toString());
      fd.append("issue_description", `[${issueForm.urgency}] ${issueForm.description}`);
      if (photo) fd.append("photo", photo);
      await api.post("/api/issues/report", fd);
      setShowIssueModal(false);
      alert("Issue reported successfully!");
    } catch {
      alert("Failed to report issue");
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">My Gear </h1>
          <p className="text-gray-400 text-sm mt-1">Assets assigned to you</p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Loading your assets...</p>
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center py-20 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <Package2 className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-white font-semibold">No assets assigned yet</p>
            <p className="text-gray-400 text-sm mt-1">Your assigned devices will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {assets.map((asset) => (
              <div key={asset.id} className="rounded-2xl p-6 transition-all hover:scale-[1.01]"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center text-2xl shrink-0 border border-white/10">
                    {categoryIcon[asset.asset_category] || categoryIcon.Default}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{asset.asset_name}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{asset.asset_code} · {asset.asset_category}</p>
                  </div>
                  <span className="ml-auto text-xs px-2.5 py-1 rounded-full bg-green-500/20 text-green-400 font-semibold shrink-0">
                    Active
                  </span>
                </div>

                <div className="flex justify-between rounded-xl p-3 mb-4"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="text-center">
                    <p className="text-gray-500 text-xs uppercase mb-1">Assigned</p>
                    <p className="text-white font-semibold text-xs">
                      {new Date(asset.assigned_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500 text-xs uppercase mb-1">Status</p>
                    <p className="text-green-400 font-semibold text-xs">In Use</p>
                  </div>
                </div>

                <button onClick={() => openIssueModal(asset)}
                  className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all">
                  🔧 Report Issue
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Issue Modal */}
      {showIssueModal && selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-md rounded-2xl p-6"
            style={{ background: "rgba(15,23,42,0.98)", border: "1px solid rgba(255,255,255,0.12)" }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-white font-bold text-lg">Report an Issue 🔧</h2>
                <p className="text-gray-400 text-xs mt-0.5">{selectedAsset.asset_name}</p>
              </div>
              <button onClick={() => setShowIssueModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase mb-2 block">Description *</label>
                <textarea
                  value={issueForm.description}
                  onChange={e => setIssueForm({ ...issueForm, description: e.target.value })}
                  placeholder="Describe the problem in detail..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 resize-none placeholder:text-gray-600"
                />
              </div>

              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase mb-2 block">Urgency</label>
                <div className="flex gap-2">
                  {["Low", "Medium", "High"].map(u => (
                    <button key={u} onClick={() => setIssueForm({ ...issueForm, urgency: u })}
                      className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all border ${issueForm.urgency === u
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

              <button onClick={handleReportIssue} disabled={submitting}
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
