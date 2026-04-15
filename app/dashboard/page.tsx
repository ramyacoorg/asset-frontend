"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { getRole } from "@/lib/auth";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";

const COLORS = ["#6366f1", "#22d3ee", "#f59e0b", "#10b981", "#f43f5e"];

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const role = typeof window !== "undefined" ? localStorage.getItem("role") : null;

  useEffect(() => {
    const endpoint =
      role === "admin" ? "/api/dashboard/admin" : "/api/dashboard/employee";
    api
      .get(endpoint)
      .then((res) => setData(res.data))
      .catch((e: any) =>
        setError(e?.response?.data?.detail || "Failed to load")
      )
      .finally(() => setLoading(false));
  }, [role]);

  const bg: React.CSSProperties = {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#1e1b4b,#0f172a,#064e3b)",
    padding: "1.5rem",
    fontFamily: "sans-serif",
  };

  const glass: React.CSSProperties = {
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.13)",
    borderRadius: "1rem",
    padding: "1.25rem",
  };

  if (loading)
    return (
      <div style={{ ...bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#a5b4fc" }}>Loading dashboard...</p>
      </div>
    );

  if (error)
    return (
      <div style={{ ...bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#f87171" }}>Error: {error}</p>
      </div>
    );

  if (role === "admin" && data) {
    return (
      <div style={bg}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ color: "#e0e7ff", fontSize: "1.5rem", fontWeight: 700, margin: 0 }}>
            Admin Dashboard
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", margin: "4px 0 0" }}>
            Real-time asset overview
          </p>
        </div>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: "0.875rem", marginBottom: "1.25rem" }}>
          {[
            { label: "Total Assets",  value: data.total_assets  ?? 0, color: "#6366f1" },
            { label: "Assigned",      value: data.assigned       ?? 0, color: "#22d3ee" },
            { label: "Available",     value: data.available      ?? 0, color: "#10b981" },
            { label: "Under Repair",  value: data.under_repair   ?? 0, color: "#f59e0b" },
            { label: "Total Users",   value: data.total_users    ?? 0, color: "#a78bfa" },
            { label: "Open Issues",   value: data.open_issues    ?? 0, color: "#f43f5e" },
          ].map((s) => (
            <div key={s.label} style={{ ...glass, display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
                {s.label}
              </span>
              <span style={{ fontSize: "1.8rem", fontWeight: 700, color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
          <div style={glass}>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem", margin: "0 0 0.875rem", textTransform: "uppercase" }}>
              Asset Status
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Assigned",  value: data.assigned      ?? 0 },
                    { name: "Available", value: data.available     ?? 0 },
                    { name: "Repair",    value: data.under_repair  ?? 0 },
                    { name: "Retired",   value: data.retired       ?? 0 },
                  ]}
                  cx="50%" cy="50%"
                  innerRadius={40} outerRadius={70}
                  dataKey="value"
                >
                  {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "none", color: "#e2e8f0", borderRadius: "0.5rem", fontSize: "0.8rem" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={glass}>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem", margin: "0 0 0.875rem", textTransform: "uppercase" }}>
              By Category
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={data.category_counts ?? []}
                layout="vertical"
                margin={{ left: 10 }}
              >
                <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <YAxis type="category" dataKey="category" tick={{ fill: "#94a3b8", fontSize: 10 }} width={70} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "none", color: "#e2e8f0", borderRadius: "0.5rem", fontSize: "0.8rem" }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Issues */}
        <div style={glass}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem", margin: "0 0 0.875rem", textTransform: "uppercase" }}>
            Recent Issues
          </p>
          {!data.recent_issues?.length && (
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem" }}>No issues yet.</p>
          )}
          {(data.recent_issues ?? []).map((issue: any) => (
            <div key={issue.id} style={{ display: "flex", alignItems: "center", gap: "0.875rem", padding: "0.75rem 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {issue.photo_url ? (
                <img src={issue.photo_url} alt="" style={{ width: 44, height: 44, borderRadius: "0.5rem", objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <div style={{ width: 44, height: 44, borderRadius: "0.5rem", background: "rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>⚠️</div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: "#e2e8f0", fontWeight: 600, margin: 0, fontSize: "0.875rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {issue.asset_name}
                </p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", margin: "2px 0 0" }}>
                  {issue.issue_description}
                </p>
                <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.7rem", margin: "2px 0 0" }}>
                  by {issue.employee_name}
                </p>
              </div>
              <span style={{
                fontSize: "0.68rem", padding: "2px 8px", borderRadius: 999, fontWeight: 600, flexShrink: 0,
                background: issue.issue_status === "open" ? "rgba(244,63,94,0.15)" : "rgba(16,185,129,0.15)",
                color: issue.issue_status === "open" ? "#fb7185" : "#34d399",
              }}>
                {issue.issue_status}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Employee Dashboard
  return (
    <div style={bg}>
      {/* Profile Header */}
      <div style={{ ...glass, display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem" }}>
        {data?.photo_url ? (
          <img src={data.photo_url} alt="profile" style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(99,102,241,0.5)" }} />
        ) : (
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "1.4rem", fontWeight: 700, flexShrink: 0 }}>
            {(data?.full_name as string)?.[0]?.toUpperCase() ?? "U"}
          </div>
        )}
        <div>
          <p style={{ color: "#e0e7ff", fontWeight: 700, fontSize: "1.1rem", margin: 0 }}>
            Welcome, {data?.full_name ?? "Employee"}!
          </p>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.8rem", margin: "2px 0 0" }}>
            {data?.email}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.75rem", marginBottom: "1.25rem" }}>
        {[
          { label: "My Assets",   value: data?.my_assets_count ?? 0, color: "#6366f1" },
          { label: "Open Issues", value: data?.open_tickets    ?? 0, color: "#f43f5e" },
          { label: "Resolved",    value: data?.resolved_tickets ?? 0, color: "#10b981" },
        ].map((s) => (
          <div key={s.label} style={{ ...glass, textAlign: "center" }}>
            <div style={{ fontSize: "1.8rem", fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.4)", marginTop: 4, textTransform: "uppercase" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* My Assets */}
      <div style={{ ...glass, marginBottom: "1.25rem" }}>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem", margin: "0 0 0.875rem", textTransform: "uppercase" }}>
          My Assigned Assets
        </p>
        {!(data?.my_assets as any[])?.length ? (
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem" }}>No assets assigned yet.</p>
        ) : (
          (data.my_assets as any[]).map((a, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div>
                <p style={{ color: "#e2e8f0", fontWeight: 600, margin: 0, fontSize: "0.875rem" }}>{a.asset_name}</p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", margin: "2px 0 0" }}>
                  {a.asset_code} · {a.asset_category}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "0.68rem", padding: "2px 8px", borderRadius: 999, background: "rgba(99,102,241,0.15)", color: "#818cf8", fontWeight: 600 }}>
                  assigned
                </span>
                <p style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.68rem", margin: "4px 0 0" }}>
                  Since {new Date(a.assigned_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Recent Issues */}
      <div style={glass}>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem", margin: "0 0 0.875rem", textTransform: "uppercase" }}>
          My Recent Issues
        </p>
        {!(data?.recent_issues as any[])?.length ? (
          <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.85rem" }}>No issues reported yet.</p>
        ) : (
          (data.recent_issues as any[]).map((issue) => (
            <div key={issue.id} style={{ display: "flex", alignItems: "center", gap: "0.875rem", padding: "0.75rem 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              {issue.photo_url ? (
                <img src={issue.photo_url} alt="" style={{ width: 40, height: 40, borderRadius: "0.5rem", objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <div style={{ width: 40, height: 40, borderRadius: "0.5rem", background: "rgba(244,63,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>⚠️</div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: "#e2e8f0", fontWeight: 600, margin: 0, fontSize: "0.85rem" }}>{issue.asset_name}</p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {issue.issue_description}
                </p>
              </div>
              <span style={{
                fontSize: "0.68rem", padding: "2px 8px", borderRadius: 999, fontWeight: 600, flexShrink: 0,
                background: issue.issue_status === "open" ? "rgba(244,63,94,0.15)" : "rgba(16,185,129,0.15)",
                color: issue.issue_status === "open" ? "#fb7185" : "#34d399",
              }}>
                {issue.issue_status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
                  }
