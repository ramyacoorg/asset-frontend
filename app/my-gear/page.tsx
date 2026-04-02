"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getRole, logout, getToken } from "@/lib/auth";
import {
  Monitor, LogOut, LayoutDashboard, FileText,
  Menu, X, Laptop, Smartphone, AlertTriangle,
  CheckCircle, Clock, Wifi, Battery, Shield, Camera, Upload
} from "lucide-react";

export default function MyGearPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [reportModal, setReportModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState("");
  const [selectedAssetId, setSelectedAssetId] = useState<number>(0);
  const [issueDescription, setIssueDescription] = useState("");
  const [issueType, setIssueType] = useState("Hardware Problem");
  const [urgency, setUrgency] = useState("Medium");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const r = getRole();
    if (!r) router.push("/login");
    else setRole(r);
  }, [router]);

  if (!role) return null;

  const assets = [
    { id: 1, name: "Dell XPS 15", code: "DL-001", type: "Laptop", icon: Laptop,
      status: "Active", assigned: "Jan 15, 2026", battery: 85,
      color: "from-blue-400 to-blue-600", bg: "from-blue-50 to-blue-100/50" },
    { id: 2, name: "iPhone 14 Pro", code: "IP-014", type: "Mobile", icon: Smartphone,
      status: "Active", assigned: "Feb 1, 2026", battery: 72,
      color: "from-purple-400 to-purple-600", bg: "from-purple-50 to-purple-100/50" },
  ];

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    // Show preview
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmitIssue = async () => {
    if (!issueDescription.trim()) return;
    setSubmitting(true);

    try {
      const token = getToken();
      const formData = new FormData();
      formData.append("asset_id", selectedAssetId.toString());
      formData.append("issue_description", `[${issueType}] [${urgency}] ${issueDescription}`);
      if (photo) formData.append("file", photo);

      await fetch("http://localhost:8000/api/issues/report", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      setSuccess(true);
      setTimeout(() => {
        setReportModal(false);
        setSuccess(false);
        setIssueDescription("");
        setPhoto(null);
        setPhotoPreview(null);
      }, 2000);

    } catch (err) {
      console.error("Failed to submit issue", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex"
      style={{ background: "linear-gradient(135deg, #e0e7ff 0%, #f0f9ff 40%, #fdf4ff 100%)" }}>

      {/* SIDEBAR */}
      <div className={`${sidebarOpen ? "w-64" : "w-16"} flex flex-col transition-all duration-500`}
        style={{
          background: "rgba(255,255,255,0.45)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRight: "1px solid rgba(255,255,255,0.6)",
          boxShadow: "4px 0 24px rgba(0,0,0,0.06)",
        }}>
        <div className="p-4 flex items-center justify-between"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.5)" }}>
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl shadow-lg">
                <Monitor className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-800 text-sm">OptiAsset</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-gray-700">
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {sidebarOpen && (
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 bg-gradient-to-r from-green-400/20 to-emerald-400/20 px-3 py-2 rounded-xl border border-green-200/50">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-green-700">👤 Employee</span>
            </div>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-1">
          {[
            { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
            { icon: Monitor, label: "My Gear", href: "/my-gear", active: true },
            { icon: FileText, label: "My Tickets", href: "/my-tickets" },
          ].map((link) => (
            <button key={link.label} onClick={() => router.push(link.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                link.active
                  ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-700 font-medium border border-blue-200/50"
                  : "text-gray-500 hover:text-gray-800 hover:bg-white/50"
              }`}>
              <link.icon className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span>{link.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.5)" }}>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-50/50 transition-all text-sm">
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Gear 💻</h1>
          <p className="text-gray-500 text-sm mt-1">All devices currently assigned to you</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Devices", value: "2", icon: Monitor, color: "from-blue-400 to-blue-600" },
            { label: "All Active", value: "2", icon: CheckCircle, color: "from-green-400 to-emerald-500" },
            { label: "Open Tickets", value: "0", icon: AlertTriangle, color: "from-orange-400 to-red-400" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl p-5 flex items-center gap-4"
              style={{
                background: "rgba(255,255,255,0.55)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.7)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
              }}>
              <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-xl shadow-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-gray-500 text-xs">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Asset Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assets.map((asset) => (
            <div key={asset.id} className="rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
              style={{
                background: "rgba(255,255,255,0.6)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(255,255,255,0.8)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
              }}>
              {/* Card Top */}
              <div className={`bg-gradient-to-r ${asset.color} p-6 relative overflow-hidden`}>
                <div className="absolute top-[-20px] right-[-20px] w-32 h-32 rounded-full bg-white/10 blur-xl" />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-xs font-medium">{asset.type}</p>
                    <h3 className="text-white text-xl font-bold mt-1">{asset.name}</h3>
                    <p className="text-white/60 text-xs mt-1">#{asset.code}</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                    <asset.icon className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-green-600 text-sm font-medium">Active</span>
                  </div>
                  <span className="text-gray-400 text-xs">Assigned {asset.assigned}</span>
                </div>

                <div className="flex gap-2 mb-5">
                  <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full">
                    <Wifi className="w-3 h-3 text-blue-500" />
                    <span className="text-blue-600 text-xs">Connected</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-full">
                    <Battery className="w-3 h-3 text-green-500" />
                    <span className="text-green-600 text-xs">{asset.battery}%</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-full">
                    <Shield className="w-3 h-3 text-purple-500" />
                    <span className="text-purple-600 text-xs">Protected</span>
                  </div>
                </div>

                {/* Battery Bar */}
                <div className="mb-5">
                  <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                    <span>Battery Health</span>
                    <span>{asset.battery}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className={`bg-gradient-to-r ${asset.color} h-2 rounded-full`}
                      style={{ width: `${asset.battery}%` }} />
                  </div>
                </div>

                {/* Report Button */}
                <button
                  onClick={() => {
                    setSelectedAsset(asset.name);
                    setSelectedAssetId(asset.id);
                    setReportModal(true);
                  }}
                  className="w-full py-3 rounded-2xl text-sm font-semibold transition-all duration-200 hover:shadow-lg"
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    color: "#ef4444",
                  }}>
                  🔧 Report an Issue
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* REPORT ISSUE MODAL */}
      {reportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-md rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
            style={{
              background: "rgba(255,255,255,0.90)",
              backdropFilter: "blur(32px)",
              border: "1px solid rgba(255,255,255,0.9)",
              boxShadow: "0 32px 64px rgba(0,0,0,0.15)",
            }}>

            {/* Success State */}
            {success ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-gray-800 font-bold text-lg">Issue Reported!</h3>
                <p className="text-gray-500 text-sm mt-1">Your ticket has been submitted successfully.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-gray-800 font-bold text-lg">Report an Issue 🔧</h2>
                    <p className="text-gray-400 text-sm mt-0.5">{selectedAsset}</p>
                  </div>
                  <button onClick={() => {
                    setReportModal(false);
                    setPhoto(null);
                    setPhotoPreview(null);
                    setIssueDescription("");
                  }} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-2 rounded-xl">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Issue Type */}
                  <div>
                    <label className="text-gray-600 text-sm font-medium mb-2 block">Issue Type</label>
                    <select
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-400">
                      <option>Hardware Problem</option>
                      <option>Software Problem</option>
                      <option>Battery Issue</option>
                      <option>Screen Damage</option>
                      <option>Other</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-gray-600 text-sm font-medium mb-2 block">Description</label>
                    <textarea
                      rows={3}
                      value={issueDescription}
                      onChange={(e) => setIssueDescription(e.target.value)}
                      placeholder="Describe the issue in detail..."
                      className="w-full bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-400 resize-none"
                    />
                  </div>

                  {/* Urgency */}
                  <div>
                    <label className="text-gray-600 text-sm font-medium mb-2 block">Urgency</label>
                    <div className="flex gap-2">
                      {["Low", "Medium", "High"].map((u) => (
                        <button key={u}
                          onClick={() => setUrgency(u)}
                          className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${
                            urgency === u
                              ? u === "High"
                                ? "bg-red-50 border-red-300 text-red-600"
                                : u === "Medium"
                                  ? "bg-orange-50 border-orange-300 text-orange-600"
                                  : "bg-green-50 border-green-300 text-green-600"
                              : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                          }`}>
                          {u}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 📸 PHOTO UPLOAD */}
                  <div>
                    <label className="text-gray-600 text-sm font-medium mb-2 block">
                      Attach Photo <span className="text-gray-400 font-normal">(optional)</span>
                    </label>

                    {photoPreview ? (
                      // Show preview if photo selected
                      <div className="relative rounded-xl overflow-hidden border border-gray-200">
                        <img src={photoPreview} alt="Issue photo" className="w-full h-40 object-cover" />
                        <button
                          onClick={() => { setPhoto(null); setPhotoPreview(null); }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-lg">
                          <X className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">
                          📎 {photo?.name}
                        </div>
                      </div>
                    ) : (
                      // Upload button
                      <button
                        onClick={() => photoInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-300 hover:bg-blue-50/50 transition-all">
                        <div className="flex flex-col items-center gap-2">
                          <div className="bg-gray-100 p-3 rounded-xl">
                            <Camera className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm font-medium">Click to add photo</p>
                            <p className="text-gray-400 text-xs mt-0.5">JPG, PNG, WEBP up to 10MB</p>
                          </div>
                          <div className="flex items-center gap-1 text-blue-500 text-xs">
                            <Upload className="w-3 h-3" />
                            <span>Upload from device</span>
                          </div>
                        </div>
                      </button>
                    )}

                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmitIssue}
                    disabled={submitting || !issueDescription.trim()}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                        Submitting...
                      </span>
                    ) : "Submit Report →"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}