// app/reports/page.tsx
"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#22d3ee", "#a78bfa"];

const glass = {
  background: "rgba(255,255,255,0.07)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "1rem",
  padding: "1.5rem",
};

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/dashboard/reports")
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = async () => {
    try {
      const res = await api.get("/api/dashboard/reports/export-csv", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "optiasset_report.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      alert("Failed to export CSV");
    }
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1e1b4b,#0f172a)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "#a5b4fc" }}>Loading reports...</p>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1e1b4b,#0f172a,#064e3b)", padding: "2rem", fontFamily: "sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ color: "#e0e7ff", fontSize: "1.75rem", fontWeight: 700, margin: 0 }}>Reports</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.875rem", margin: "4px 0 0" }}>Asset analytics and summaries</p>
        </div>
        <button
          onClick={handleExportCSV}
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none", borderRadius: "0.75rem", padding: "0.75rem 1.25rem", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "6px" }}
        >
          ⬇ Export CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {data && [
          { label: "Total Assets", value: data.summary.total_assets, color: "#6366f1" },
          { label: "Assigned", value: data.summary.assigned, color: "#22d3ee" },
          { label: "Available", value: data.summary.available, color: "#10b981" },
          { label: "Under Repair", value: data.summary.under_repair, color: "#f59e0b" },
          { label: "Total Issues", value: data.summary.total_issues, color: "#a78bfa" },
          { label: "Open Issues", value: data.summary.open_issues, color: "#f43f5e" },
        ].map((s) => (
          <div key={s.label} style={{ ...glass, padding: "1rem" }}>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>{s.label}</p>
            <p style={{ color: s.color, fontSize: "1.75rem", fontWeight: 700, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={glass}>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", fontWeight: 500, marginBottom: "1rem" }}>Asset Status Distribution</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data?.status_chart}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {data?.status_chart.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#1e293b", border: "none", color: "#e2e8f0", borderRadius: "0.5rem" }} />
              <Legend wrapperStyle={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={glass}>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", fontWeight: 500, marginBottom: "1rem" }}>Assets by Category</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.category_chart} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <XAxis dataKey="category" tick={{ fill: "#94a3b8", fontSize: 10 }} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "none", color: "#e2e8f0", borderRadius: "0.5rem" }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data?.category_chart.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Assets Table */}
      <div style={glass}>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", fontWeight: 500, marginBottom: "1rem" }}>All Assets — Detailed View</p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
            <thead>
              <tr>
                {["Code", "Name", "Category", "Status", "Assigned To", "Purchase Date"].map((h) => (
                  <th key={h} style={{ color: "rgba(255,255,255,0.4)", fontWeight: 500, textAlign: "left", padding: "0.5rem 0.75rem", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.assets_table.map((row: any, i: number) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                  <td style={{ padding: "0.6rem 0.75rem", color: "#6366f1", fontFamily: "monospace" }}>{row.asset_code}</td>
                  <td style={{ padding: "0.6rem 0.75rem", color: "#e2e8f0" }}>{row.asset_name}</td>
                  <td style={{ padding: "0.6rem 0.75rem", color: "rgba(255,255,255,0.5)" }}>{row.asset_category}</td>
                  <td style={{ padding: "0.6rem 0.75rem" }}>
                    <span style={{
                      fontSize: "0.7rem", padding: "2px 8px", borderRadius: "999px", fontWeight: 500,
                      background: row.asset_status === "assigned" ? "rgba(34,211,238,0.15)" : row.asset_status === "available" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                      color: row.asset_status === "assigned" ? "#22d3ee" : row.asset_status === "available" ? "#10b981" : "#f59e0b"
                    }}>
                      {row.asset_status}
                    </span>
                  </td>
                  <td style={{ padding: "0.6rem 0.75rem", color: "rgba(255,255,255,0.5)" }}>{row.assigned_to}</td>
                  <td style={{ padding: "0.6rem 0.75rem", color: "rgba(255,255,255,0.35)", fontSize: "0.75rem" }}>{row.purchase_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
