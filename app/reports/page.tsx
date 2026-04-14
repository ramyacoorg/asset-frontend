"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";

const COLORS = ["#6366f1", "#22d3ee", "#10b981", "#f59e0b", "#f43f5e", "#a78bfa"];

const glass = {
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "1rem",
  padding: "1.25rem",
};

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    api.get("/api/reports/summary")
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://assettracker-production-e745.up.railway.app/api/reports/export-csv", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "optiasset_report.csv";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert("Export failed");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1e1b4b,#0f172a)", padding: "2rem", fontFamily: "sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ color: "#e0e7ff", fontSize: "1.75rem", fontWeight: 700, margin: 0 }}>Reports</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem", margin: "4px 0 0" }}>Asset analytics and summaries</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={exporting}
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: "0.75rem", padding: "0.65rem 1.25rem", cursor: exporting ? "not-allowed" : "pointer", fontSize: "0.9rem", fontWeight: 600, opacity: exporting ? 0.7 : 1 }}
        >
          {exporting ? "Exporting..." : "⬇ Export CSV"}
        </button>
      </div>

      {loading && <p style={{ color: "rgba(255,255,255,0.4)" }}>Loading reports...</p>}

      {!loading && data && (
        <>
          {/* Summary Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: "0.875rem", marginBottom: "1.5rem" }}>
            {[
              { label: "Total Assets", value: data.total_assets, color: "#6366f1" },
              { label: "Total Issues", value: data.total_issues, color: "#f43f5e" },
              { label: "Categories", value: data.category_counts?.length || 0, color: "#22d3ee" },
              { label: "Assignments", value: data.monthly_assignments?.reduce((s: number, m: any) => s + m.count, 0) || 0, color: "#10b981" },
            ].map((s) => (
              <div key={s.label} style={{ ...glass, display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</span>
                <span style={{ fontSize: "1.8rem", fontWeight: 700, color: s.color }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Charts Row 1 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            {/* Status Pie */}
            <div style={glass}>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", margin: "0 0 1rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Asset Status</p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={data.status_counts} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={40} outerRadius={70} label={({ status }) => status}>
                    {data.status_counts.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1e293b", border: "none", color: "#e2e8f0", borderRadius: "0.5rem" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Bar */}
            <div style={glass}>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", margin: "0 0 1rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>By Category</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={data.category_counts} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                  <YAxis type="category" dataKey="category" tick={{ fill: "#94a3b8", fontSize: 10 }} width={80} />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "none", color: "#e2e8f0", borderRadius: "0.5rem" }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {data.category_counts.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Charts Row 2 */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            {/* Monthly Assignments Line */}
            <div style={glass}>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", margin: "0 0 1rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Monthly Assignments</p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={data.monthly_assignments}>
                  <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "#1e293b", border: "none", color: "#e2e8f0", borderRadius: "0.5rem" }} />
                  <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ fill: "#6366f1", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Issue Status Pie */}
            <div style={glass}>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", margin: "0 0 1rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>Issue Status</p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={data.issue_counts} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={40} outerRadius={70} label={({ status }) => status}>
                    {data.issue_counts.map((_: any, i: number) => <Cell key={i} fill={["#f43f5e", "#10b981", "#f59e0b"][i % 3]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1e293b", border: "none", color: "#e2e8f0", borderRadius: "0.5rem" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Asset Table */}
          <div style={glass}>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", margin: "0 0 1rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>All Assets</p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                <thead>
                  <tr>
                    {["Code", "Name", "Category", "Status", "Purchase Date"].map((h) => (
                      <th key={h} style={{ color: "rgba(255,255,255,0.4)", padding: "0.5rem 0.75rem", textAlign: "left", borderBottom: "1px solid rgba(255,255,255,0.08)", fontWeight: 500, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.assets.map((a: any, i: number) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ color: "#22d3ee", padding: "0.6rem 0.75rem", fontFamily: "monospace" }}>{a.asset_code}</td>
                      <td style={{ color: "#e2e8f0", padding: "0.6rem 0.75rem" }}>{a.asset_name}</td>
                      <td style={{ color: "rgba(255,255,255,0.5)", padding: "0.6rem 0.75rem" }}>{a.asset_category}</td>
                      <td style={{ padding: "0.6rem 0.75rem" }}>
                        <span style={{
                          fontSize: "0.7rem", padding: "2px 8px", borderRadius: "999px", fontWeight: 600,
                          background: a.asset_status === "available" ? "rgba(16,185,129,0.15)" : a.asset_status === "assigned" ? "rgba(99,102,241,0.15)" : "rgba(245,158,11,0.15)",
                          color: a.asset_status === "available" ? "#34d399" : a.asset_status === "assigned" ? "#818cf8" : "#fbbf24"
                        }}>{a.asset_status}</span>
                      </td>
                      <td style={{ color: "rgba(255,255,255,0.4)", padding: "0.6rem 0.75rem" }}>{a.purchase_date || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
