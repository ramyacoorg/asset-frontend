"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import api from "@/lib/api";

const RAILWAY = "https://assettracker-production-e745.up.railway.app";

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [availableAssets, setAvailableAssets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ asset_id: "", employee_id: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAssign = async () => {
    if (!form.asset_id || !form.employee_id) {
      alert("Select both asset and employee");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/api/assignments/assign", {
        asset_id:    parseInt(form.asset_id),
        employee_id: parseInt(form.employee_id),
      });
      setShowModal(false);
      setForm({ asset_id: "", employee_id: "" });
      fetchAll();
    } catch (e: any) {
      alert(e?.response?.data?.detail || "Failed to assign");
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

  const bg: React.CSSProperties = {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#1e1b4b,#0f172a)",
    padding: "1.5rem",
    fontFamily: "sans-serif",
  };

  const glass: React.CSSProperties = {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "1rem",
    padding: "1rem 1.25rem",
  };

  return (
    <div style={bg}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ color: "#e0e7ff", fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>Assignments</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", margin: "4px 0 0" }}>Track asset assignments</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: "0.75rem", padding: "0.6rem 1.2rem", cursor: "pointer", fontWeight: 600, fontSize: "0.9rem" }}
        >
          + Assign Asset
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.75rem", marginBottom: "1.25rem" }}>
        {[
          { label: "Total",    value: assignments.length,                                    color: "#6366f1" },
          { label: "Active",   value: assignments.filter(a => a.status === "active").length,   color: "#10b981" },
          { label: "Returned", value: assignments.filter(a => a.status === "returned").length, color: "#f59e0b" },
        ].map(s => (
          <div key={s.label} style={{ ...glass, textAlign: "center" }}>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <p style={{ color: "rgba(255,255,255,0.4)" }}>Loading...</p>
      ) : error ? (
        <p style={{ color: "#f87171" }}>{error}</p>
      ) : assignments.length === 0 ? (
        <p style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: "2rem" }}>No assignments yet.</p>
      ) : (
        assignments.map(a => (
          <div key={a.id} style={{ ...glass, display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.75rem" }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "1rem", flexShrink: 0 }}>
              {a.employee_name?.[0]?.toUpperCase() || "?"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: "#e2e8f0", fontWeight: 600, margin: 0, fontSize: "0.9rem" }}>{a.employee_name}</p>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.78rem", margin: "2px 0 0" }}>
                {a.asset_name} · <span style={{ color: "#22d3ee" }}>{a.asset_code}</span>
              </p>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <span style={{
                fontSize: "0.7rem", padding: "3px 10px", borderRadius: 999, fontWeight: 600,
                background: a.status === "active" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                color: a.status === "active" ? "#34d399" : "#fbbf24",
              }}>{a.status}</span>
              <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.68rem", margin: "4px 0 2px" }}>
                {a.return_date ? `Returned: ${a.return_date}` : `Assigned: ${a.assigned_date}`}
              </p>
              {a.status === "active" && (
                <button
                  onClick={() => handleReturn(a.id)}
                  style={{ background: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "0.5rem", padding: "3px 10px", cursor: "pointer", fontSize: "0.72rem", fontWeight: 600 }}
                >
                  Return
                </button>
              )}
            </div>
          </div>
        ))
      )}

      {/* Assign Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "1rem" }}>
          <div style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "1.25rem", padding: "1.75rem", width: "100%", maxWidth: 420 }}>
            <h2 style={{ color: "#e0e7ff", fontSize: "1.1rem", fontWeight: 700, margin: "0 0 1.25rem" }}>Assign Asset</h2>

            <label style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem", display: "block", marginBottom: 6 }}>Available Asset</label>
            <select
              value={form.asset_id}
              onChange={e => setForm({ ...form, asset_id: e.target.value })}
              style={{ width: "100%", background: "#0f172a", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "0.75rem", padding: "0.65rem 0.875rem", marginBottom: "1rem", fontSize: "0.9rem" }}
            >
              <option value="">-- Select Asset --</option>
              {availableAssets.map(a => (
                <option key={a.id} value={a.id}>{a.asset_name} ({a.asset_code})</option>
              ))}
            </select>

            <label style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.78rem", display: "block", marginBottom: 6 }}>Employee</label>
            <select
              value={form.employee_id}
              onChange={e => setForm({ ...form, employee_id: e.target.value })}
              style={{ width: "100%", background: "#0f172a", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "0.75rem", padding: "0.65rem 0.875rem", marginBottom: "1.5rem", fontSize: "0.9rem" }}
            >
              <option value="">-- Select Employee --</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
              ))}
            </select>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => { setShowModal(false); setForm({ asset_id: "", employee_id: "" }); }}
                style={{ flex: 1, background: "rgba(255,255,255,0.06)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "0.75rem", padding: "0.7rem", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={submitting}
                style={{ flex: 1, background: submitting ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: "0.75rem", padding: "0.7rem", cursor: submitting ? "not-allowed" : "pointer", fontWeight: 600 }}
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
