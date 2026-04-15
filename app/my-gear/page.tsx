
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import api from "@/lib/api";

const RAILWAY = "https://assettracker-production-e745.up.railway.app";

export default function MyGearPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [issueForm, setIssueForm] = useState({ description: "", urgency: "Medium" });
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchAssets = () => {
    setLoading(true);
    api.get("/api/assignments/my")
      .then(res => setAssets(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAssets(); }, []);

  const openIssueModal = (asset: any) => {
    setSelectedAsset(asset);
    setIssueForm({ description: "", urgency: "Medium" });
    setPhoto(null);
    setShowIssueModal(true);
  };

  const handleReportIssue = async () => {
    if (!issueForm.description.trim()) {
      alert("Please describe the issue");
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const fd = new FormData();
      fd.append("asset_id", selectedAsset.asset_id.toString());
      fd.append("issue_description", `[${issueForm.urgency}] ${issueForm.description}`);
      if (photo) fd.append("photo", photo);

      const res = await fetch(`${RAILWAY}/api/issues/report`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (!res.ok) throw new Error("Failed");
      setShowIssueModal(false);
      alert("Issue reported successfully!");
    } catch {
      alert("Failed to report issue");
    } finally {
      setSubmitting(false);
    }
  };

  const bg: React.CSSProperties = {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#fdf4ff,#eff6ff,#f0fdf4)",
    padding: "1.5rem",
    fontFamily: "sans-serif",
  };

  const categoryIcon: any = {
    Laptop: "💻", Mobile: "📱", Monitor: "🖥️", Tablet: "📟", Default: "📦",
  };

  return (
    <div style={bg}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b", margin: 0 }}>My Gear</h1>
        <p style={{ color: "#64748b", fontSize: "0.85rem", margin: "4px 0 0" }}>Assets assigned to you</p>
      </div>

      {loading ? (
        <p style={{ color: "#94a3b8" }}>Loading your assets...</p>
      ) : assets.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 0" }}>
          <p style={{ fontSize: "2rem" }}>📭</p>
          <p style={{ color: "#94a3b8" }}>No assets assigned to you yet.</p>
        </div>
      ) : (
        assets.map(asset => (
          <div key={asset.id} style={{ background: "#fff", borderRadius: "1.25rem", padding: "1.25rem", marginBottom: "1rem", boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.875rem" }}>
              <div style={{ width: 52, height: 52, borderRadius: "1rem", background: "linear-gradient(135deg,#ede9fe,#ddd6fe)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", flexShrink: 0 }}>
                {categoryIcon[asset.asset_category] || categoryIcon.Default}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, color: "#1e293b", margin: 0, fontSize: "1rem" }}>{asset.asset_name}</p>
                <p style={{ color: "#64748b", fontSize: "0.78rem", margin: "2px 0 0" }}>
                  {asset.asset_code} · {asset.asset_category}
                </p>
              </div>
              <span style={{ fontSize: "0.72rem", padding: "3px 10px", borderRadius: 999, background: "#dcfce7", color: "#16a34a", fontWeight: 600 }}>
                Active
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "#f8fafc", borderRadius: "0.75rem", marginBottom: "0.875rem" }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ color: "#94a3b8", fontSize: "0.68rem", margin: 0, textTransform: "uppercase" }}>Assigned</p>
                <p style={{ color: "#1e293b", fontWeight: 600, fontSize: "0.85rem", margin: "2px 0 0" }}>
                  {new Date(asset.assigned_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ color: "#94a3b8", fontSize: "0.68rem", margin: 0, textTransform: "uppercase" }}>Status</p>
                <p style={{ color: "#16a34a", fontWeight: 600, fontSize: "0.85rem", margin: "2px 0 0" }}>In Use</p>
              </div>
            </div>

            <button
              onClick={() => openIssueModal(asset)}
              style={{ width: "100%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: "0.875rem", padding: "0.75rem", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" }}
            >
              🔧 Report Issue
            </button>
          </div>
        ))
      )}

      {/* Report Issue Modal */}
      {showIssueModal && selectedAsset && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 50 }}>
          <div style={{ background: "#fff", borderRadius: "1.5rem 1.5rem 0 0", padding: "1.75rem", width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1e293b", margin: 0 }}>Report an Issue 🔧</h2>
                <p style={{ color: "#64748b", fontSize: "0.8rem", margin: "2px 0 0" }}>{selectedAsset.asset_name}</p>
              </div>
              <button onClick={() => setShowIssueModal(false)} style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: "1.1rem" }}>×</button>
            </div>

            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Description *</label>
            <textarea
              value={issueForm.description}
              onChange={e => setIssueForm({ ...issueForm, description: e.target.value })}
              placeholder="Describe the problem in detail..."
              rows={3}
              style={{ width: "100%", border: "1.5px solid #e2e8f0", borderRadius: "0.75rem", padding: "0.65rem 0.875rem", marginBottom: "1rem", fontSize: "0.9rem", resize: "vertical", background: "#f8fafc", boxSizing: "border-box" }}
            />

            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Urgency</label>
            <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
              {["Low", "Medium", "High"].map(u => (
                <button
                  key={u}
                  onClick={() => setIssueForm({ ...issueForm, urgency: u })}
                  style={{
                    flex: 1, padding: "0.5rem", borderRadius: "0.75rem", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600,
                    background: issueForm.urgency === u ? (u === "High" ? "#fee2e2" : u === "Medium" ? "#fef3c7" : "#d1fae5") : "#f1f5f9",
                    color: issueForm.urgency === u ? (u === "High" ? "#dc2626" : u === "Medium" ? "#d97706" : "#059669") : "#94a3b8",
                    border: issueForm.urgency === u ? `2px solid ${u === "High" ? "#fca5a5" : u === "Medium" ? "#fcd34d" : "#6ee7b7"}` : "2px solid transparent",
                  }}
                >{u}</button>
              ))}
            </div>

            <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              Photo <span style={{ color: "#94a3b8", fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setPhoto(e.target.files?.[0] || null)}
              style={{ width: "100%", marginBottom: "1.5rem", fontSize: "0.85rem" }}
            />

            <button
              onClick={handleReportIssue}
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
