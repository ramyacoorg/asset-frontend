// app/dashboard/page.tsx
"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { getRole } from "@/lib/auth";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = ["#6366f1", "#22d3ee", "#f59e0b", "#10b981", "#f43f5e"];

const glass = {
  background: "rgba(255,255,255,0.07)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: "1rem",
  padding: "1.5rem",
};

const statCard = {
  ...glass,
  display: "flex",
  flexDirection: "column" as const,
  gap: "4px",
};

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const role = getRole();

  useEffect(() => {
    const endpoint = role === "admin" ? "/api/dashboard/admin" : "/api/dashboard/employee";
    api.get(endpoint)
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [role]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1e1b4b,#0f172a)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#a5b4fc", fontSize: "1rem" }}>Loading dashboard...</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1e1b4b,#0f172a,#064e3b)", padding: "2rem", fontFamily: "sans-serif" }}>
      <h1 style={{ color: "#e0e7ff", fontSize: "1.5rem", fontWeight: 600, marginBottom: "1.5rem" }}>
        {role === "admin" ? "Admin Dashboard" : "My Dashboard"}
      </h1>

      {role === "admin" && data && (
        <>
          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            {[
              { label: "Total Assets", value: data.total_assets, color: "#6366f1" },
              { label: "Assigned", value: data.assigned, color: "#22d3ee" },
              { label: "Available", value: data.available, color: "#10b981" },
              { label: "Under Repair", value: data.under_repair, color: "#f59e0b" },
              { label: "Total Users", value: data.total_users, color: "#a78bfa" },
              { label: "Open Issues", value: data.open_issues, color: "#f43f5e" },
            ].map((s) => (
              <div key={s.label} style={statCard}>
                <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</span>
                <span style={{ fontSize: "2rem", fontWeight: 700, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={glass}>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", marginBottom: "1rem" }}>Asset Status</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={[
                    { name: "Assigned", value: data.assigned },
                    { name: "Available", value: data.available },
                    { name: "Repair", value: data.under_repair },
                  ]} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label>
                    {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1e293b", border: "none", color: "#e2e8f0" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={glass}>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", marginBottom: "1rem" }}>Assets by Category</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.category_counts}>
                  <XAxis dataKey="category" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "none", color: "#e2e8f0" }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Issues */}
          <div style={glass}>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", marginBottom: "1rem" }}>Recent Issues</p>
            {data.recent_issues?.length === 0 && <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>No issues reported yet.</p>}
            {data.recent_issues?.map((issue: any) => (
              <div key={issue.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {issue.photo_url && (
                  <img src={issue.photo_url} alt="issue" style={{ width: 48, height: 48, borderRadius: "0.5rem", objectFit: "cover" }} />
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ color: "#e2e8f0", fontSize: "0.875rem", fontWeight: 500, margin: 0 }}>{issue.asset_name}</p>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", margin: "2px 0 0" }}>{issue.issue_description}</p>
                </div>
                <span style={{
                  fontSize: "0.7rem", padding: "3px 10px", borderRadius: "999px", fontWeight: 500,
                  background: issue.issue_status === "open" ? "rgba(244,63,94,0.2)" : "rgba(16,185,129,0.2)",
                  color: issue.issue_status === "open" ? "#fb7185" : "#34d399"
                }}>{issue.issue_status}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {role === "employee" && data && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            {[
              { label: "My Assets", value: data.my_assets_count, color: "#6366f1" },
              { label: "Open Issues", value: data.my_open_issues, color: "#f43f5e" },
            ].map((s) => (
              <div key={s.label} style={statCard}>
                <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</span>
                <span style={{ fontSize: "2rem", fontWeight: 700, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>

          <div style={glass}>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", marginBottom: "1rem" }}>My Assigned Assets</p>
            {data.my_assets?.length === 0 && <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>No assets assigned yet.</p>}
            {data.my_assets?.map((a: any, i: number) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <div>
                  <p style={{ color: "#e2e8f0", fontSize: "0.875rem", fontWeight: 500, margin: 0 }}>{a.asset_name}</p>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", margin: "2px 0 0" }}>{a.asset_code} · {a.asset_category}</p>
                </div>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>Since {new Date(a.assigned_date).toLocaleDateString()}</span>
              </div>
            ))}
          </div>

          <div style={{ ...glass, marginTop: "1rem" }}>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", marginBottom: "1rem" }}>My Recent Issues</p>
            {data.my_recent_issues?.length === 0 && <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem" }}>No issues reported yet.</p>}
            {data.my_recent_issues?.map((issue: any) => (
              <div key={issue.id} style={{ display: "flex", gap: "1rem", padding: "0.75rem 0", borderBottom: "1px solid rgba(255,255,255,0.07)", alignItems: "center" }}>
                {issue.photo_url && <img src={issue.photo_url} alt="issue" style={{ width: 44, height: 44, borderRadius: "0.5rem", objectFit: "cover" }} />}
                <div style={{ flex: 1 }}>
                  <p style={{ color: "#e2e8f0", fontSize: "0.875rem", fontWeight: 500, margin: 0 }}>{issue.asset_name}</p>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", margin: "2px 0 0" }}>{issue.issue_description}</p>
                </div>
                <span style={{
                  fontSize: "0.7rem", padding: "3px 10px", borderRadius: "999px",
                  background: issue.issue_status === "open" ? "rgba(244,63,94,0.2)" : "rgba(16,185,129,0.2)",
                  color: issue.issue_status === "open" ? "#fb7185" : "#34d399"
                }}>{issue.issue_status}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
