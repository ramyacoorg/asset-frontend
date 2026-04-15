"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRole, logout } from "@/lib/auth";
import api from "@/lib/api";
import {
  Monitor, LogOut, LayoutDashboard, Package,
  Users, GitBranch, FileText, Menu, X,
  AlertTriangle, CheckCircle, Clock, Image
} from "lucide-react";

interface Issue {
  id: number;
  asset_id: number;
  asset_name: string;
  employee_id: number;
  employee_name: string;
  issue_description: string;
  issue_status: string;
  photo_url: string | null;
  reported_at: string;
}

export default function IssuesPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    const r = getRole();
    if (!r) router.push("/login");
    else if (r !== "admin") router.push("/my-gear");
    else {
      setRole(r);
      fetchIssues();
    }
  }, [router]);

  const fetchIssues = async () => {
    try {
      // ✅ FIXED: was fetching from hardcoded localhost:8000 with wrong endpoint
      const res = await api.get("/api/issues/all");
      setIssues(res.data);
    } catch (err) {
      console.error("Failed to fetch issues", err);
    } finally {
      setLoading(false);
    }
  };

  const adminLinks = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Package, label: "Inventory", href: "/inventory" },
    { icon: Users, label: "All Users", href: "/users" },
    { icon: GitBranch, label: "Assignments", href: "/assignments" },
    { icon: AlertTriangle, label: "Issues", href: "/issues", active: true },
    { icon: FileText, label: "Reports", href: "/reports" },
  ];

  if (!role) return null;

  return (
    <div className="min-h-screen flex"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" }}>

      {/* SIDEBAR */}
      <div className={`${sidebarOpen ? "w-64" : "w-16"} flex flex-col transition-all duration-500`}
        style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(24px)", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="p-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
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
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-sm">
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Asset Issues 🔧</h1>
          <p className="text-gray-400 text-sm mt-1">All reported issues from employees</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Issues", value: issues.length, icon: AlertTriangle, color: "from-orange-400 to-red-400" },
            { label: "Open", value: issues.filter(i => i.issue_status === "open").length, icon: Clock, color: "from-yellow-400 to-orange-400" },
            { label: "Resolved", value: issues.filter(i => i.issue_status === "resolved").length, icon: CheckCircle, color: "from-green-400 to-emerald-500" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl p-5 flex items-center gap-4"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
              <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-xl shadow-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-gray-400 text-xs">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Issues List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Loading issues...</p>
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center py-20"
            style={{ background: "rgba(255,255,255,0.05)", borderRadius: "1rem", border: "1px solid rgba(255,255,255,0.1)" }}>
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <p className="text-white font-semibold">No issues reported yet!</p>
            <p className="text-gray-400 text-sm mt-1">All assets are working fine 🎉</p>
          </div>
        ) : (
          <div className="space-y-4">
            {issues.map((issue) => (
              <div key={issue.id} className="rounded-2xl p-5 transition-all hover:scale-[1.01]"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Issue ID and Status */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-400 text-xs font-mono">#{issue.id}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${issue.issue_status === "open"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : issue.issue_status === "in_progress"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-green-500/20 text-green-400"
                        }`}>
                        {issue.issue_status}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-white font-medium text-sm mb-2">
                      {issue.issue_description}
                    </p>

                    {/* Meta info */}
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>🖥️ {issue.asset_name || `Asset #${issue.asset_id}`}</span>
                      <span>👤 {issue.employee_name || `Employee #${issue.employee_id}`}</span>
                      <span>📅 {new Date(issue.reported_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                  </div>

                  {/* Photo */}
                  <div className="shrink-0">
                    {issue.photo_url ? (
                      <button onClick={() => setSelectedPhoto(issue.photo_url)}
                        className="relative group">
                        <img
                          src={issue.photo_url}
                          alt="Issue photo"
                          className="w-20 h-20 object-cover rounded-xl border border-white/20"
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Image className="w-5 h-5 text-white" />
                        </div>
                      </button>
                    ) : (
                      <div className="w-20 h-20 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
                        <Image className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PHOTO FULLSCREEN MODAL */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
          onClick={() => setSelectedPhoto(null)}>
          <div className="relative max-w-2xl w-full">
            <img src={selectedPhoto} alt="Issue" className="w-full rounded-2xl shadow-2xl" />
            <button onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-xl hover:bg-black/70">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}