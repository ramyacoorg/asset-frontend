"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import api from "@/lib/api";

const RAILWAY = "https://assettracker-production-e745.up.railway.app";

export default function MyTicketsPage() {
  const [issues, setIssues]     = useState<any[]>([]);
  const [myAssets, setMyAssets] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ asset_id: "", description: "", urgency: "Medium" });
  const [photo, setPhoto] = useState<File | null>(null);

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

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async () => {
    if (!form.asset_id || !form.description.trim()) {
      alert("Please select an asset and describe the issue");
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const fd = new FormData();
      fd.append("asset_id", form.asset_id);
      fd.append("issue_description", `[${form.urgency}] ${form.description}`);
      if (photo) fd.append("photo", photo);

      const res = await fetch(`${RAILWAY}/api/issues/report`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error("Failed");

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

  const getUrgency = (desc: string) => {
    if (desc?.startsWith("[High]"))   return "High";
    if (desc?.startsWith("[Low]"))    return "Low";
    return "Medium";
  };
  const cleanDesc = (desc: string) =>
    desc?.replace(/^\[(High|Medium|Low)\]\s*/, "") ?? desc;

  const statusStyle: any = {
    open:        { bg: "rgba(244,63,94,0.12)",  color: "#f43f5e", label: "Open" },
    in_progress: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b", label: "In Progress" },
    resolved:    { bg: "rgba(16,185,129,0.12)", color: "#10b981", label: "Resolved" },
  };

  const urgencyColor: any = {
    High:   { bg: "#fee2e2", color: "#dc2626" },
    Medium: { bg: "#fef3c7", color: "#d97706" },
    Low:    { bg: "#d1fae5", color: "#059669" },
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#fdf4ff,#eff6ff,#f0fdf4)", padding: "1.5rem", fontFamily: "sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b", margin: 0 }}>My Tickets</h1>
          <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "4px 0 0" }}>Track your reported issues</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: "0.875rem", padding: "0.65rem 1.1rem", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem" }}
        >
          + New Ticket
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {[
          { label: "Total",       value: issues.length,                                              icon: "📋", color: "#6366f1" },
          { label: "In Progress", value: issues.filter(i => i.issue_status === "in_progress").length, icon: "🕐", color: "#f59e0b" },
          { label: "Resolved",    value: issues.filter(i => i.issue_status === "resolved").length,    icon: "✅", color: "#10b981" },
        ].map(s => (
          <div key={s.label} style={{ background: "#fff", borderRadius: "1rem", padding: "1rem", boxShadow: "0 1px 12px rgba(0,0,0,0.06)", textAlign: "center" }}>
            <div style={{ fontSize: "1.4rem" }}>{s.icon}</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.68rem", color: "#94a3b8", marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tickets */}
      {loading ? (
        <p style={{ color: "#94a3b8" }}>Loading tickets...</p>
      ) : issues.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 0" }}>
          <p style={{ fontSize: "2rem" }}>🎉</p>
          <p style={{ color: "#94a3b8" }}>No tickets yet!</p>
        </div>
      ) : (
        issues.map(issue => {
          const urgency = getUrgency(issue.issue_description);
          const st      = statusStyle[issue.issue_status] ?? statusStyle.open;
          const uc      = urgencyColor[urgency];
          return (
            <div key={issue.id} style={{ background: "#fff", borderRadius: "1rem", padding: "1.25rem", marginBottom: "0.875rem", boxShadow: "0 1px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={{ fontSize: "0.68rem", color: "#94a3b8", fontFamily: "monospace" }}>
                    TK-{String(issue.id).padStart(3, "0")}
                  </span>
                  <span style={{ fontSize: "0.7rem", fontWeight: 600, color: uc.color, background: uc.bg, padding: "2px 8px", borderRadius: 999 }}>
                    {urgency}
                  </span>
                </div>
                <span style={{ fontSize: "0.7rem", fontWeight: 600, color: st.color, background: st.bg, padding: "3px 10px", borderRadius: 999 }}>
                  {st.label}
                </span>
              </div>
              <p style={{ fontWeight: 600, color: "#1e293b", margin: "0 0 4px", fontSize: "0.95rem" }}>
                {cleanDesc(issue.issue_description)}
              </p>
              <p style={{ color: "#64748b", fontSize: "0.78rem", margin: 0 }}>
                {issue.asset_name} · {new Date(issue.reported_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
              {issue.photo_url && (
                <img src={issue.photo_url} alt="issue" style={{ marginTop: 10, borderRadius: "0.5rem", maxHeight: 140, objectFit: "cover", width: "100%" }} />
              )}
            </div>
          );
        })
      )}

      {/* New Ticket Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 }}>
          <div style={{ background: "#fff", borderRadius: "1.5rem 1.5rem 0 0", padding: "1.75rem", width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1e293b", margin: 0 }}>New Ticket 🎫</h2>
              <button onClick={() => setShowModal(false)} style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: "1.1rem" }}>×</button>
            </div>

            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Select Asset *</label>
            <select
              value={form.asset_id}
              onChange={e => setForm({ ...form, asset_id: e.target.value })}
              style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: "0.75rem", padding: "0.65rem", marginBottom: "1rem", fontSize: "0.9rem", background: "#f8fafc" }}
            >
              <option value="">-- Select your asset --</option>
              {myAssets.map(a => (
                <option key={a.asset_id} value={a.asset_id}>{a.asset_name} ({a.asset_code})</option>
              ))}
            </select>

            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Description *</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the issue..."
              rows={3}
              style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: "0.75rem", padding: "0.65rem", marginBottom: "1rem", fontSize: "0.9rem", resize: "vertical", background: "#f8fafc", boxSizing: "border-box" }}
            />

            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Urgency</label>
            <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
              {["Low", "Medium", "High"].map(u => (
                <button key={u} onClick={() => setForm({ ...form, urgency: u })}
                  style={{
                    flex: 1, padding: "0.5rem", borderRadius: "0.75rem", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600,
                    background: form.urgency === u ? urgencyColor[u].bg : "#f1f5f9",
                    color:      form.urgency === u ? urgencyColor[u].color : "#94a3b8",
                    border:     form.urgency === u ? `2px solid ${urgencyColor[u].color}` : "2px solid transparent",
                  }}
                >{u}</button>
              ))}
            </div>

            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              Photo <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span>
            </label>
            <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files?.[0] || null)} style={{ width: "100%", marginBottom: "1.5rem", fontSize: "0.85rem" }} />

            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{ width: "100%", background: submitting ? "#c7d2fe" : "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: "0.875rem", padding: "0.875rem", fontSize: "1rem", fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer" }}
            >
              {submitting ? "Submitting..." : "Submit Report →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
      }
