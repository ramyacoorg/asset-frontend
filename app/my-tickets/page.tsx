// app/my-tickets/page.tsx
"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function MyTicketsPage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [myAssets, setMyAssets] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    asset_id: "",
    issue_description: "",
    priority: "medium",
  });
  const [photo, setPhoto] = useState<File | null>(null);

  const fetchIssues = async () => {
    try {
      const res = await api.get("/api/issues/my");
      setIssues(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyAssets = async () => {
    try {
      const res = await api.get("/api/dashboard/employee");
      setMyAssets(res.data.my_assets || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchIssues();
    fetchMyAssets();
  }, []);

  const handleSubmit = async () => {
    if (!form.asset_id || !form.issue_description.trim()) {
      setError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setError("");

    const formData = new FormData();
    formData.append("asset_id", form.asset_id);
    formData.append("issue_description", form.issue_description);
    formData.append("priority", form.priority);
    if (photo) formData.append("photo", photo);

    try {
      // Use native fetch for FormData (multipart)
      const token = localStorage.getItem("token");
      const res = await fetch(
        "https://assettracker-production-e745.up.railway.app/api/issues/report",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to submit");
      }
      setShowModal(false);
      setForm({ asset_id: "", issue_description: "", priority: "medium" });
      setPhoto(null);
      fetchIssues();
    } catch (e: any) {
      setError(e.message || "Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  };

  const totalTickets = issues.length;
  const inProgress = issues.filter((i) => i.issue_status === "in_progress").length;
  const resolved = issues.filter((i) => i.issue_status === "resolved").length;

  const priorityColor: Record<string, string> = {
    high: "#f43f5e",
    medium: "#f59e0b",
    low: "#10b981",
  };

  const statusColor: Record<string, string> = {
    open: "#f43f5e",
    in_progress: "#f59e0b",
    resolved: "#10b981",
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#fdf6ec,#f0e6d8,#e8d5c4)", padding: "2rem", fontFamily: "sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ color: "#1a0a00", fontSize: "1.75rem", fontWeight: 800, margin: 0 }}>My Tickets</h1>
          <p style={{ color: "rgba(0,0,0,0.4)", fontSize: "0.875rem", margin: "4px 0 0" }}>Track all your reported issues</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setError(""); }}
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: "0.75rem", padding: "0.75rem 1.25rem", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }}
        >
          + New Ticket
        </button>
      </div>

      {/* Summary Pills */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {[
          { icon: "📋", label: "Total Tickets", value: totalTickets },
          { icon: "🕐", label: "In Progress", value: inProgress },
          { icon: "✅", label: "Resolved", value: resolved },
        ].map((s) => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.6)", borderRadius: "1rem", padding: "0.75rem 1.25rem", display: "flex", alignItems: "center", gap: "0.75rem", border: "1px solid rgba(0,0,0,0.08)" }}>
            <span style={{ fontSize: "1.5rem" }}>{s.icon}</span>
            <div>
              <p style={{ color: "#1e293b", fontWeight: 700, fontSize: "1.25rem", margin: 0 }}>{s.value}</p>
              <p style={{ color: "rgba(0,0,0,0.45)", fontSize: "0.7rem", margin: 0 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tickets List */}
      {loading ? (
        <p style={{ color: "rgba(0,0,0,0.4)", textAlign: "center", marginTop: "3rem" }}>Loading tickets...</p>
      ) : issues.length === 0 ? (
        <p style={{ color: "rgba(0,0,0,0.4)", textAlign: "center", marginTop: "3rem" }}>No tickets yet. Report an issue!</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {issues.map((issue) => (
            <div key={issue.id} style={{ background: "rgba(255,255,255,0.7)", borderRadius: "1rem", padding: "1.25rem", border: "1px solid rgba(0,0,0,0.07)", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <div style={{ width: 44, height: 44, borderRadius: "0.75rem", background: issue.issue_status === "resolved" ? "rgba(16,185,129,0.2)" : issue.issue_status === "in_progress" ? "rgba(245,158,11,0.2)" : "rgba(244,63,94,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", flexShrink: 0 }}>
                {issue.issue_status === "resolved" ? "✅" : issue.issue_status === "in_progress" ? "🕐" : "⚠️"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                  <p style={{ color: "#0f172a", fontWeight: 700, margin: 0, fontSize: "0.9rem" }}>{issue.issue_description}</p>
                  <span style={{ fontSize: "0.65rem", padding: "2px 8px", borderRadius: "999px", fontWeight: 600, background: `${priorityColor[issue.priority || "medium"]}22`, color: priorityColor[issue.priority || "medium"], marginLeft: "8px", whiteSpace: "nowrap" }}>
                    {(issue.priority || "medium").charAt(0).toUpperCase() + (issue.priority || "medium").slice(1)}
                  </span>
                </div>
                <p style={{ color: "rgba(0,0,0,0.5)", fontSize: "0.78rem", margin: "0 0 6px" }}>{issue.asset_name} · {new Date(issue.reported_at).toLocaleDateString()}</p>
                <span style={{ fontSize: "0.7rem", padding: "2px 10px", borderRadius: "999px", fontWeight: 600, background: `${statusColor[issue.issue_status] || "#94a3b8"}22`, color: statusColor[issue.issue_status] || "#94a3b8" }}>
                  {issue.issue_status === "in_progress" ? "In Progress" : issue.issue_status.charAt(0).toUpperCase() + issue.issue_status.slice(1)}
                </span>
              </div>
              {issue.photo_url && (
                <img src={issue.photo_url} alt="issue" style={{ width: 56, height: 56, borderRadius: "0.75rem", objectFit: "cover", flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Ticket Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "1rem" }}>
          <div style={{ background: "#fff", borderRadius: "1.5rem", padding: "2rem", width: "100%", maxWidth: "420px", boxShadow: "0 25px 50px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ color: "#0f172a", fontWeight: 700, fontSize: "1.1rem", margin: 0 }}>Report an Issue 🔧</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#64748b" }}>✕</button>
            </div>

            <label style={{ color: "#374151", fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>Select Asset *</label>
            <select
              value={form.asset_id}
              onChange={(e) => setForm({ ...form, asset_id: e.target.value })}
              style={{ width: "100%", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0", fontSize: "0.875rem", marginBottom: "1rem", background: "#f8fafc" }}
            >
              <option value="">-- Select your asset --</option>
              {myAssets.map((a: any, i: number) => (
                <option key={i} value={a.asset_id || i}>{a.asset_name} ({a.asset_code})</option>
              ))}
            </select>

            <label style={{ color: "#374151", fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>Description *</label>
            <textarea
              value={form.issue_description}
              onChange={(e) => setForm({ ...form, issue_description: e.target.value })}
              placeholder="Describe the issue..."
              rows={3}
              style={{ width: "100%", padding: "0.75rem", borderRadius: "0.75rem", border: "1px solid #e2e8f0", fontSize: "0.875rem", marginBottom: "1rem", background: "#f8fafc", resize: "none", boxSizing: "border-box" }}
            />

            <label style={{ color: "#374151", fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "8px" }}>Urgency</label>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
              {["low", "medium", "high"].map((p) => (
                <button
                  key={p}
                  onClick={() => setForm({ ...form, priority: p })}
                  style={{ flex: 1, padding: "0.6rem", borderRadius: "0.75rem", border: `2px solid ${form.priority === p ? priorityColor[p] : "#e2e8f0"}`, background: form.priority === p ? `${priorityColor[p]}15` : "#f8fafc", color: form.priority === p ? priorityColor[p] : "#64748b", fontWeight: form.priority === p ? 700 : 400, cursor: "pointer", fontSize: "0.8rem", textTransform: "capitalize" }}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>

            <label style={{ color: "#374151", fontSize: "0.8rem", fontWeight: 600, display: "block", marginBottom: "6px" }}>Attach Photo <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span></label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
              style={{ width: "100%", marginBottom: "1rem", fontSize: "0.8rem" }}
            />

            {error && <p style={{ color: "#f43f5e", fontSize: "0.8rem", marginBottom: "0.75rem" }}>{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{ width: "100%", padding: "0.875rem", borderRadius: "0.75rem", background: submitting ? "#94a3b8" : "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", color: "#fff", fontWeight: 700, fontSize: "0.9rem", cursor: submitting ? "not-allowed" : "pointer" }}
            >
              {submitting ? "Submitting..." : "Submit Report →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
        }
