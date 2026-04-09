"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Laptop, Shield, Zap } from "lucide-react";
import api from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/api/auth/login", { email, password });
      saveAuth(res.data.access_token, res.data.role);
      if (res.data.role === "admin") {
        router.push("/dashboard");
      } else {
        router.push("/my-gear");
      }
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen flex bg-slate-950">

      {/* LEFT SIDE */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 relative overflow-hidden">
        <div className="absolute top-[-80px] left-[-80px] w-[300px] h-[300px] rounded-full bg-white/5 blur-2xl" />
        <div className="absolute bottom-[-100px] right-[-60px] w-[400px] h-[400px] rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
            <Laptop className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-white text-2xl font-bold">OptiAsset</h1>
            <p className="text-blue-200 text-xs">Enterprise Edition</p>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-white text-4xl font-bold leading-tight">
              Manage Your<br />
              <span className="text-blue-200">IT Assets</span><br />
              Smarter.
            </h2>
            <p className="text-blue-100/70 mt-4 text-sm leading-relaxed max-w-sm">
              A centralized platform to track, assign, and manage all your company assets with role-based access control.
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 w-fit">
              <Shield className="text-blue-200 w-4 h-4" />
              <span className="text-white text-sm">Role-Based Access Control</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 w-fit">
              <Zap className="text-blue-200 w-4 h-4" />
              <span className="text-white text-sm">Real-time Asset Tracking</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 w-fit">
              <Laptop className="text-blue-200 w-4 h-4" />
              <span className="text-white text-sm">Full Inventory Management</span>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-blue-200/50 text-xs">© 2026 OptiAsset. All rights reserved.</p>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-950">
        <div className="w-full max-w-md">

          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="bg-blue-600 p-3 rounded-xl">
              <Laptop className="text-white w-6 h-6" />
            </div>
            <h1 className="text-white text-2xl font-bold">OptiAsset</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-white text-3xl font-bold">Welcome back 👋</h2>
            <p className="text-slate-400 mt-2 text-sm">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="mb-5">
            <label className="text-slate-300 text-sm font-medium mb-2 block">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="you@company.com"
              className="w-full bg-slate-900 text-white px-4 py-3.5 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600 text-sm"
            />
          </div>

          <div className="mb-8">
            <label className="text-slate-300 text-sm font-medium mb-2 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="••••••••••"
                className="w-full bg-slate-900 text-white px-4 py-3.5 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600 text-sm pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl transition-all duration-200 disabled:opacity-50 text-sm shadow-lg shadow-blue-600/20"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Signing in...
              </span>
            ) : "Sign In →"}
          </button>

          <div className="mt-6 p-4 bg-slate-900 rounded-xl border border-slate-800">
            <p className="text-slate-500 text-xs font-medium mb-2">🔑 Test Credentials</p>
            <p className="text-slate-400 text-xs"><span className="text-blue-400">Admin:</span> ramya@2admin.com / secret</p>
            <p className="text-slate-400 text-xs mt-1"><span className="text-green-400">Employee:</span> ben@2employee.com / secret</p>
          </div>

        </div>
      </div>
    </div>
  );
}
