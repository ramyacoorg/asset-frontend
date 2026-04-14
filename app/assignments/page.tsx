"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ asset_id: "", employee_id: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [asgn, assetRes, userRes] = await Promise.all([
        api.get("/api/assignments/"),
        api.get("/api/assets/"),
        api.get("/api/users/"),
      ]);
      setAssignments(asgn.data);
      setAssets(assetRes.data.filter((a: any) => a.asset_status === "available"));
      setUsers(userRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAssign = async () => {
    if (!form.asset_id || !form.employee_id) {
      alert("Please select both asset and employee");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/api/assignments/assign", {
        asset_id: parseInt(form.asset_id),
        employee_id: parseInt(form.employee_id),
      });
      setShowModal(false);
      setForm({ asset_id: "", employee_id: "" });
      fetchAll();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to assign asset");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturn = async (id: number) => {
    if (!confirm("Mark this asset as returned?")) return;
    try {
      await api.patch(`/api/assignments/${id}/return`);
      fetchAll();
    } catch (e) {
      alert("Failed to return asset");
    }
  };

  const statusColor: any = {
    active: { bg: "rgba(16,185,129,0.15)", color: "#34d399" },
    returned: { bg: "rgba(245,158,11,0.15)", color: "#fbbf24" },
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1e1b4b,#0f172a)", padding: "2rem", fontFamily: "sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ color: "#e0e7ff", fontSize: "1.75rem", fontWeight: 700, margin: 0 }}>Assignments</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem", margin: "4px 0 0" }}>Track asset assignments</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: "0.75rem", padding: "0.6rem 1.25rem", cursor: "pointer", fontSize: "0.9rem", fontWeight: 600 }}
        >
          + Assign Asset
        </button>
      </div>

      {/* List */}
      {loading ? (
        <p style={{ color: "rgba(255,255,255,0.4)" }}>Loading...</p>
      ) : assignments.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,0.4)" }}>No assignments yet.</p>
      ) : (
        assignments.map((a) => (
          <div key={a.id} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "1rem", padding: "1rem 1.25rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "1rem", flexShrink: 0 }}>
              {a.employee_name?.[0]?.toUpperCase() || "?"}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: "#e2e8f0", fontWeight: 600, margin: 0 }}>{a.employee_name}</p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", margin: "2px 0 0" }}>
                {a.asset_name} · <span style={{ color: "#22d3ee" }}>{a.asset_code}</span>
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ ...statusColor[a.status], fontSize: "0.75rem", padding: "3px 10px", borderRadius: "999px", fontWeight: 600 }}>{a.status}</span>
              <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.7rem", margin: "6px 0 0" }}>
                {a.return_date ? `Returned: ${a.return_date}` : `Assigned: ${a.assigned_date}`}
              </p>
              {a.status === "active" && (
                <button
                  onClick={() => handleReturn(a.id)}
                  style={{ marginTop: 6, background: "rgba(245,158,11,0.15)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "0.5rem", padding: "3px 10px", cursor: "pointer", fontSize: "0.75rem" }}
                >
                  Return
                </button>
              )}
            </div>
          </div>
        ))
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "1rem" }}>
          <div style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "1.25rem", padding: "1.75rem", width: "100%", maxWidth: 420 }}>
            <h2 style={{ color: "#e0e7ff", fontSize: "1.2rem", fontWeight: 700, margin: "0 0 1.5rem" }}>Assign Asset</h2>

            <label style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", display: "block", marginBottom: 6 }}>Select Asset (Available only)</label>
            <select
              value={form.asset_id}
              onChange={(e) => setForm({ ...form, asset_id: e.target.value })}
              style={{ width: "100%", background: "rgba(255,255,255,0.08)", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "0.75rem", padding: "0.6rem 0.875rem", marginBottom: "1rem", fontSize: "0.9rem" }}
            >
              <option value="" style={{ background: "#1e293b" }}>-- Select Asset --</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id} style={{ background: "#1e293b" }}>{a.asset_name} ({a.asset_code})</option>
              ))}
            </select>

            <label style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", display: "block", marginBottom: 6 }}>Select Employee</label>
            <select
              value={form.employee_id}
              onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
              style={{ width: "100%", background: "rgba(255,255,255,0.08)", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "0.75rem", padding: "0.6rem 0.875rem", marginBottom: "1.5rem", fontSize: "0.9rem" }}
            >
              <option value="" style={{ background: "#1e293b" }}>-- Select Employee --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id} style={{ background: "#1e293b" }}>{u.full_name} ({u.email})</option>
              ))}
            </select>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => { setShowModal(false); setForm({ asset_id: "", employee_id: "" }); }}
                style={{ flex: 1, background: "rgba(255,255,255,0.08)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.7rem", cursor: "pointer", fontSize: "0.9rem" }}
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={submitting}
                style={{ flex: 1, background: submitting ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: "0.75rem", padding: "0.7rem", cursor: submitting ? "not-allowed" : "pointer", fontSize: "0.9rem", fontWeight: 600 }}
              >
                {submitting ? "Assigning..." : "Assign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
