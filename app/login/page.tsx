"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"signin" | "signup">("signin");

  // Sign In state
  const [siEmail, setSiEmail] = useState("");
  const [siPass, setSiPass] = useState("");
  const [siShowPass, setSiShowPass] = useState(false);
  const [siError, setSiError] = useState("");
  const [siLoading, setSiLoading] = useState(false);

  // Sign Up state
  const [suFirst, setSuFirst] = useState("");
  const [suLast, setSuLast] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPass, setSuPass] = useState("");
  const [suShowPass, setSuShowPass] = useState(false);
  const [suRole, setSuRole] = useState<"admin" | "employee">("employee");
  const [suError, setSuError] = useState("");
  const [suLoading, setSuLoading] = useState(false);
  const [suSuccess, setSuSuccess] = useState("");

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setSiError("");
    setSiLoading(true);
    try {
      const res = await api.post("/api/auth/login", {
        email: siEmail,
        password: siPass,
      });
      saveAuth(res.data.access_token, res.data.role);
      router.push("/dashboard");
    } catch (err: any) {
      setSiError(err?.response?.data?.detail || "Invalid email or password.");
    } finally {
      setSiLoading(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setSuError("");
    setSuSuccess("");
    setSuLoading(true);
    try {
      await api.post("/api/auth/register", {
        full_name: `${suFirst} ${suLast}`.trim(),
        email: suEmail,
        password: suPass,
        role_id: suRole === "admin" ? 1 : 2,
      });
      setSuSuccess("Account created! You can now sign in.");
      setTab("signin");
    } catch (err: any) {
      setSuError(err?.response?.data?.detail || "Registration failed. Try again.");
    } finally {
      setSuLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0c1120; }
        .lp { min-height: 100vh; width: 100%; font-family: 'Plus Jakarta Sans', sans-serif; background: #0c1120; display: flex; position: relative; overflow: hidden; }
        .lp-bg { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
        .lp-orb { position: absolute; border-radius: 50%; filter: blur(100px); }
        .lp-orb-1 { width: 700px; height: 700px; background: rgba(79,70,229,.22); top: -280px; left: -180px; }
        .lp-orb-2 { width: 500px; height: 500px; background: rgba(14,165,233,.16); bottom: -180px; right: 120px; }
        .lp-orb-3 { width: 300px; height: 300px; background: rgba(124,58,237,.14); top: 35%; right: -60px; }
        .lp-dots { position: absolute; inset: 0; background-image: radial-gradient(circle, rgba(148,163,184,.06) 1px, transparent 1px); background-size: 28px 28px; }
        .lp-left { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 3rem 4rem; position: relative; z-index: 2; max-width: 580px; }
        .lp-brand { display: flex; align-items: center; gap: 13px; margin-bottom: 2.5rem; }
        .lp-brand-icon { width: 44px; height: 44px; border-radius: 12px; background: #4f46e5; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 0 1px rgba(99,102,241,.5), 0 4px 16px rgba(79,70,229,.35); }
        .lp-brand-icon svg { width: 20px; height: 20px; stroke: #fff; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
        .lp-brand-name { font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 700; color: #f1f5f9; letter-spacing: -.4px; }
        .lp-brand-sub { font-size: 10px; color: #475569; letter-spacing: 1.8px; text-transform: uppercase; margin-top: 2px; }
        .lp-chip { display: inline-flex; align-items: center; gap: 6px; background: rgba(79,70,229,.15); border: 1px solid rgba(99,102,241,.25); border-radius: 20px; padding: 4px 12px; font-size: 10px; color: #818cf8; font-weight: 700; letter-spacing: 1px; margin-bottom: 1.5rem; width: fit-content; }
        .lp-chip-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ade80; box-shadow: 0 0 6px rgba(74,222,128,.8); animation: lp-pulse 2s ease-in-out infinite; }
        @keyframes lp-pulse { 0%, 100% { opacity: 1; } 50% { opacity: .4; } }
        .lp-hero-title { font-family: 'Space Grotesk', sans-serif; font-size: 48px; font-weight: 700; color: #f1f5f9; line-height: 1.08; letter-spacing: -2px; margin-bottom: 1rem; }
        .lp-hero-title .accent { background: linear-gradient(90deg, #818cf8 0%, #38bdf8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .lp-hero-sub { font-size: 15px; color: #64748b; line-height: 1.75; max-width: 380px; margin-bottom: 2rem; }
        .lp-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 2rem; }
        .lp-stat { background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.07); border-radius: 14px; padding: 16px 14px; }
        .lp-stat-num { font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 700; color: #818cf8; }
        .lp-stat-label { font-size: 10px; color: #475569; margin-top: 3px; letter-spacing: .2px; }
        .lp-features { display: flex; flex-direction: column; gap: 10px; }
        .lp-feat { display: flex; align-items: center; gap: 10px; }
        .lp-feat-dot { width: 6px; height: 6px; border-radius: 50%; background: #4f46e5; flex-shrink: 0; }
        .lp-feat-text { font-size: 13px; color: #64748b; }
        .lp-divider-panel { width: 1px; background: linear-gradient(to bottom, transparent, rgba(255,255,255,.07) 30%, rgba(255,255,255,.07) 70%, transparent); position: relative; z-index: 2; }
        .lp-right { width: 480px; display: flex; align-items: center; justify-content: center; padding: 2.5rem 2rem; position: relative; z-index: 2; }
        .lp-card { width: 100%; background: rgba(255,255,255,.045); border: 1px solid rgba(255,255,255,.11); border-radius: 22px; padding: 32px 28px; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); position: relative; overflow: hidden; }
        .lp-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #4f46e5, #7c3aed, #0ea5e9); border-radius: 22px 22px 0 0; }
        .lp-card::after { content: ''; position: absolute; top: 0; left: 10%; width: 80%; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,.15), transparent); }
        .lp-tabs { display: flex; background: rgba(0,0,0,.3); border-radius: 12px; padding: 4px; gap: 4px; margin-bottom: 24px; }
        .lp-tab { flex: 1; padding: 9px; font-size: 13px; font-weight: 600; border: none; background: transparent; color: #475569; border-radius: 9px; cursor: pointer; transition: all .2s ease; font-family: 'Plus Jakarta Sans', sans-serif; letter-spacing: .1px; }
        .lp-tab.active { background: #4f46e5; color: #fff; box-shadow: 0 2px 8px rgba(79,70,229,.4); }
        .lp-tab:not(.active):hover { color: #94a3b8; }
        .lp-form-title { font-family: 'Space Grotesk', sans-serif; font-size: 20px; font-weight: 700; color: #f1f5f9; margin-bottom: 4px; }
        .lp-form-sub { font-size: 12px; color: #64748b; margin-bottom: 20px; }
        .lp-error { background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.2); border-radius: 10px; padding: 10px 14px; font-size: 12px; color: #fca5a5; margin-bottom: 14px; }
        .lp-success { background: rgba(74,222,128,.1); border: 1px solid rgba(74,222,128,.2); border-radius: 10px; padding: 10px 14px; font-size: 12px; color: #86efac; margin-bottom: 14px; }
        .lp-field { margin-bottom: 14px; }
        .lp-label { display: block; font-size: 10px; font-weight: 700; color: #475569; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 7px; }
        .lp-input-wrap { position: relative; }
        .lp-input-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 14px; height: 14px; stroke: #334155; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; pointer-events: none; }
        .lp-input { width: 100%; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.09); border-radius: 11px; padding: 11px 14px 11px 38px; font-size: 13px; color: #f1f5f9; font-family: 'Plus Jakarta Sans', sans-serif; outline: none; transition: border-color .2s, background .2s; }
        .lp-input:focus { border-color: rgba(99,102,241,.6); background: rgba(99,102,241,.06); }
        .lp-input::placeholder { color: #1e293b; }
        .lp-eye { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: transparent; border: none; cursor: pointer; padding: 2px; display: flex; align-items: center; }
        .lp-eye svg { width: 15px; height: 15px; stroke: #334155; fill: none; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
        .lp-forgot { text-align: right; margin-bottom: 14px; margin-top: -6px; }
        .lp-forgot a { font-size: 11px; color: #818cf8; text-decoration: none; }
        .lp-forgot a:hover { color: #a5b4fc; }
        .lp-btn { width: 100%; padding: 12px; background: #4f46e5; border: none; border-radius: 11px; color: #fff; font-size: 13px; font-weight: 700; font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer; letter-spacing: .2px; transition: background .2s, transform .1s, box-shadow .2s; box-shadow: 0 4px 14px rgba(79,70,229,.35); }
        .lp-btn:hover:not(:disabled) { background: #4338ca; box-shadow: 0 4px 20px rgba(79,70,229,.5); }
        .lp-btn:active:not(:disabled) { transform: scale(.99); }
        .lp-btn:disabled { opacity: .5; cursor: not-allowed; }
        .lp-or { display: flex; align-items: center; gap: 10px; margin: 14px 0; }
        .lp-or-line { flex: 1; height: 1px; background: rgba(255,255,255,.07); }
        .lp-or span { font-size: 11px; color: #334155; }
        .lp-note { font-size: 11px; color: #475569; text-align: center; margin-top: 14px; }
        .lp-note a { color: #818cf8; text-decoration: none; font-weight: 600; }
        .lp-note a:hover { color: #a5b4fc; }
        .lp-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .lp-role-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .lp-role-btn { padding: 10px; background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.09); border-radius: 11px; cursor: pointer; text-align: center; transition: all .2s; font-family: 'Plus Jakarta Sans', sans-serif; }
        .lp-role-btn.selected { background: rgba(79,70,229,.15); border-color: rgba(99,102,241,.4); }
        .lp-role-icon { font-size: 18px; margin-bottom: 4px; }
        .lp-role-label { font-size: 12px; font-weight: 600; color: #94a3b8; }
        .lp-role-btn.selected .lp-role-label { color: #a5b4fc; }
        .lp-hint { background: rgba(79,70,229,.08); border: 1px solid rgba(99,102,241,.15); border-radius: 10px; padding: 10px 14px; margin-top: 14px; }
        .lp-hint-title { font-size: 10px; font-weight: 700; color: #475569; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 6px; }
        .lp-hint-row { font-size: 11px; color: #64748b; margin-bottom: 2px; }
        .lp-hint-row span { color: #818cf8; font-weight: 600; }
        @media (max-width: 900px) {
          .lp { flex-direction: column; }
          .lp-left { max-width: 100%; padding: 2rem; }
          .lp-divider-panel { display: none; }
          .lp-right { width: 100%; padding: 0 1.5rem 2rem; }
          .lp-hero-title { font-size: 32px; }
        }
      `}</style>

      <div className="lp">
        {/* Background */}
        <div className="lp-bg">
          <div className="lp-orb lp-orb-1" />
          <div className="lp-orb lp-orb-2" />
          <div className="lp-orb lp-orb-3" />
          <div className="lp-dots" />
        </div>

        {/* Left Panel */}
        <div className="lp-left">
          <div className="lp-brand">
            <div className="lp-brand-icon">
              <svg viewBox="0 0 24 24">
                <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
              </svg>
            </div>
            <div>
              <div className="lp-brand-name">OptiAsset</div>
              <div className="lp-brand-sub">IT Asset Management</div>
            </div>
          </div>

          <div className="lp-chip">
            <span className="lp-chip-dot" />
            PLATFORM v2.0 · LIVE
          </div>

          <div className="lp-hero-title">
            Manage every<br />
            asset <span className="accent">smarter</span><br />
            and faster.
          </div>
          <div className="lp-hero-sub">
            Track, assign, and maintain your IT assets across your
            entire organization — all from one powerful dashboard.
          </div>

          <div className="lp-stats">
            <div className="lp-stat">
              <div className="lp-stat-num">2.4k</div>
              <div className="lp-stat-label">Assets tracked</div>
            </div>
            <div className="lp-stat">
              <div className="lp-stat-num">98%</div>
              <div className="lp-stat-label">Uptime SLA</div>
            </div>
            <div className="lp-stat">
              <div className="lp-stat-num">150+</div>
              <div className="lp-stat-label">Teams using it</div>
            </div>
          </div>

          <div className="lp-features">
            {[
              "Role-based access control (RBAC)",
              "Real-time issue tracking & photo uploads",
              "Asset assignments & inventory reports",
            ].map((f) => (
              <div className="lp-feat" key={f}>
                <div className="lp-feat-dot" />
                <div className="lp-feat-text">{f}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="lp-divider-panel" />

        {/* Right Panel */}
        <div className="lp-right">
          <div className="lp-card">
            <div className="lp-tabs">
              <button
                className={`lp-tab${tab === "signin" ? " active" : ""}`}
                onClick={() => setTab("signin")}
              >
                Sign In
              </button>
              <button
                className={`lp-tab${tab === "signup" ? " active" : ""}`}
                onClick={() => setTab("signup")}
              >
                Sign Up
              </button>
            </div>

            {/* SIGN IN */}
            {tab === "signin" && (
              <form onSubmit={handleSignIn}>
                <div className="lp-form-title">Welcome back</div>
                <div className="lp-form-sub">Sign in to your OptiAsset account</div>

                {siError && <div className="lp-error">{siError}</div>}
                {suSuccess && <div className="lp-success">{suSuccess}</div>}

                <div className="lp-field">
                  <label className="lp-label">Email Address</label>
                  <div className="lp-input-wrap">
                    <svg className="lp-input-icon" viewBox="0 0 24 24">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M2 7l10 7 10-7" />
                    </svg>
                    <input
                      className="lp-input"
                      type="email"
                      placeholder="ramya2@admin.com"
                      value={siEmail}
                      onChange={(e) => setSiEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="lp-field">
                  <label className="lp-label">Password</label>
                  <div className="lp-input-wrap">
                    <svg className="lp-input-icon" viewBox="0 0 24 24">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    <input
                      className="lp-input"
                      type={siShowPass ? "text" : "password"}
                      placeholder="Enter your password"
                      value={siPass}
                      onChange={(e) => setSiPass(e.target.value)}
                      required
                    />
                    <button type="button" className="lp-eye" onClick={() => setSiShowPass((p) => !p)}>
                      <svg viewBox="0 0 24 24">
                        {siShowPass ? (
                          <>
                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </>
                        ) : (
                          <>
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </>
                        )}
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="lp-forgot"><a href="#">Forgot password?</a></div>

                <button className="lp-btn" type="submit" disabled={siLoading}>
                  {siLoading ? "Signing in…" : "Sign In to Dashboard"}
                </button>

                <div className="lp-hint">
                  <div className="lp-hint-title">🔑 Test Credentials</div>
                  <div className="lp-hint-row"><span>Admin:</span> ramya2@admin.com / admin123</div>
                  <div className="lp-hint-row"><span>Employee:</span> ben2@employee.com / admin123</div>
                </div>

                <div className="lp-note">
                  Don&apos;t have an account?{" "}
                  <a href="#" onClick={(e) => { e.preventDefault(); setTab("signup"); }}>Sign up free</a>
                </div>
              </form>
            )}

            {/* SIGN UP */}
            {tab === "signup" && (
              <form onSubmit={handleSignUp}>
                <div className="lp-form-title">Create account</div>
                <div className="lp-form-sub">Join OptiAsset — it&apos;s free to get started</div>

                {suError && <div className="lp-error">{suError}</div>}

                <div className="lp-grid-2">
                  <div className="lp-field">
                    <label className="lp-label">First Name</label>
                    <div className="lp-input-wrap">
                      <svg className="lp-input-icon" viewBox="0 0 24 24">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <input
                        className="lp-input"
                        type="text"
                        placeholder="First name"
                        value={suFirst}
                        onChange={(e) => setSuFirst(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="lp-field">
                    <label className="lp-label">Last Name</label>
                    <div className="lp-input-wrap">
                      <svg className="lp-input-icon" viewBox="0 0 24 24">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <input
                        className="lp-input"
                        type="text"
                        placeholder="Last name"
                        value={suLast}
                        onChange={(e) => setSuLast(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="lp-field">
                  <label className="lp-label">Email Address</label>
                  <div className="lp-input-wrap">
                    <svg className="lp-input-icon" viewBox="0 0 24 24">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M2 7l10 7 10-7" />
                    </svg>
                    <input
                      className="lp-input"
                      type="email"
                      placeholder="your@email.com"
                      value={suEmail}
                      onChange={(e) => setSuEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="lp-field">
                  <label className="lp-label">Password</label>
                  <div className="lp-input-wrap">
                    <svg className="lp-input-icon" viewBox="0 0 24 24">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" />
                    </svg>
                    <input
                      className="lp-input"
                      type={suShowPass ? "text" : "password"}
                      placeholder="Create a password"
                      value={suPass}
                      onChange={(e) => setSuPass(e.target.value)}
                      required
                    />
                    <button type="button" className="lp-eye" onClick={() => setSuShowPass((p) => !p)}>
                      <svg viewBox="0 0 24 24">
                        {suShowPass ? (
                          <>
                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </>
                        ) : (
                          <>
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </>
                        )}
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="lp-field">
                  <label className="lp-label">Role</label>
                  <div className="lp-role-row">
                    <button
                      type="button"
                      className={`lp-role-btn${suRole === "employee" ? " selected" : ""}`}
                      onClick={() => setSuRole("employee")}
                    >
                      <div className="lp-role-icon">👤</div>
                      <div className="lp-role-label">Employee</div>
                    </button>
                    <button
                      type="button"
                      className={`lp-role-btn${suRole === "admin" ? " selected" : ""}`}
                      onClick={() => setSuRole("admin")}
                    >
                      <div className="lp-role-icon">👑</div>
                      <div className="lp-role-label">Admin</div>
                    </button>
                  </div>
                </div>

                <button className="lp-btn" type="submit" disabled={suLoading}>
                  {suLoading ? "Creating account…" : "Create Account"}
                </button>

                <div className="lp-note">
                  Already have an account?{" "}
                  <a href="#" onClick={(e) => { e.preventDefault(); setTab("signin"); }}>Sign in</a>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
