"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", { email, password });
      saveAuth(res.data.access_token, res.data.role);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0c1120",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "sans-serif"
    }}>
      <div style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "20px",
        padding: "40px",
        width: "100%",
        maxWidth: "400px",
      }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={{
            background: "#4f46e5",
            borderRadius: "12px",
            width: "48px",
            height: "48px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 12px"
          }}>
            <span style={{ color: "white", fontSize: "24px" }}>📊</span>
          </div>
          <h1 style={{ color: "white", fontSize: "24px", fontWeight: "bold", margin: "0 0 8px" }}>
            OptiAsset
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
            Sign in to your account
          </p>
        </div>

        {error && (
          <div style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "10px",
            padding: "12px",
            color: "#fca5a5",
            fontSize: "13px",
            marginBottom: "20px"
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSignIn}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ color: "#94a3b8", fontSize: "12px", display: "block", marginBottom: "6px" }}>
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ramya@admin.com"
              required
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                padding: "12px",
                color: "white",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ color: "#94a3b8", fontSize: "12px", display: "block", marginBottom: "6px" }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{
                width: "100%",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "10px",
                padding: "12px",
                color: "white",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: "#4f46e5",
              border: "none",
              borderRadius: "10px",
              padding: "13px",
              color: "white",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <div style={{
          background: "rgba(79,70,229,0.08)",
          border: "1px solid rgba(99,102,241,0.2)",
          borderRadius: "10px",
          padding: "14px",
          marginTop: "20px"
        }}>
          <p style={{ color: "#64748b", fontSize: "11px", fontWeight: "bold", marginBottom: "8px" }}>
            🔑 TEST CREDENTIALS
          </p>
          <p style={{ color: "#818cf8", fontSize: "12px", margin: "0 0 4px" }}>
            Admin: ramya@admin.com / secret
          </p>
          <p style={{ color: "#4ade80", fontSize: "12px", margin: 0 }}>
            Employee: ben@employee.com / secret
          </p>
        </div>
      </div>
    </div>
  );
}
