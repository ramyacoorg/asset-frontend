"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRole, logout, getToken } from "@/lib/auth";
import { Monitor, LogOut, LayoutDashboard, Package, Users, GitBranch, FileText, Menu, X, Plus, Search, AlertTriangle, Trash2 } from "lucide-react";

interface User {
  id: number;
  full_name: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

const API = "https://assettracker-production-e745.up.railway.app";

export default function UsersPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ full_name: "", email: "", password: "", role_id: 2 });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");

  useEffect(() => {
    const r = getRole();
    if (!r) router.push("/login");
    else if (r !== "admin") router.push("/dashboard");
    else { setRole(r); fetchUsers(); }
  }, [router]);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}/api/users/`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleAddUser = async () => {
    setAddLoading(true);
    setAddError("");
    setAddSuccess("");
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(addForm)
      });
      const data = await res.json();
      if (!res.ok) {
        setAddError(data.detail || "Failed to add user");
        return;
      }
      setAddSuccess("User created successfully!");
      setAddForm({ full_name: "", email: "", password: "", role_id: 2 });
      fetchUsers();
      setTimeout(() => { setShowAdd(false); setAddSuccess(""); }, 2000);
    } catch (err) {
      setAddError("Cannot connect to server!");
    } finally {
      setAddLoading(false);
    }
  };

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const adminLinks = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Package, label: "Inventory", href: "/inventory" },
    { icon: Users, label: "All Users", href: "/users", active: true },
    { icon: GitBranch, label: "Assignments", href: "/assignments" },
    { icon: AlertTriangle, label: "Issues", href: "/issues" },
    { icon: FileText, label: "Reports", href: "/reports" },
  ];

  if (!role) return null;

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" }}>

      {/* SIDEBAR */}
      <div className={`${sidebarOpen ? "w-64" : "w-16"} flex flex-col transition-all duration-500`}
        style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(24px)", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
                <Monitor className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-sm">OptiAsset</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white">
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
        {sidebarOpen && (
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 bg-blue-500/10 px-3 py-2 rounded-xl border border-blue-500/20">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-blue-300"> Administrator</span>
            </div>
          </div>
        )}
        <nav className="flex-1 p-3 space-y-1">
          {adminLinks.map((link) => (
            <button key={link.label} onClick={() => router.push(link.href)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                link.active ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/20"
                : "text-gray-400 hover:text-white hover:bg-white/10"}`}>
              <link.icon className="w-4 h-4 shrink-0" />
              {sidebarOpen && <span>{link.label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all text-sm">
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">All Users </h1>
            <p className="text-gray-400 text-sm mt-1">Manage employee accounts</p>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..."
            className="w-full bg-white/5 border border-white/10 text-white pl-11 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 placeholder:text-gray-500" />
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Loading users...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filtered.length === 0 ? (
              <div className="col-span-3 text-center py-12 text-gray-500">No users found</div>
            ) : filtered.map((user) => (
              <div key={user.id} className="rounded-2xl p-5 transition-all hover:scale-[1.02]"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                    {user.full_name?.[0] ?? "U"}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{user.full_name}</p>
                    <p className="text-gray-400 text-xs">{user.email}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs">Status</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${user.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs">Joined</span>
                    <span className="text-gray-300 text-xs">{new Date(user.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD USER MODAL */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-md rounded-2xl p-6"
            style={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-lg">Add New User ➕</h2>
              <button onClick={() => { setShowAdd(false); setAddError(""); setAddSuccess(""); }}
                className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            {addError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">{addError}</div>}
            {addSuccess && <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl mb-4 text-sm">{addSuccess}</div>}
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase mb-2 block">Full Name</label>
                <input value={addForm.full_name} onChange={(e) => setAddForm({...addForm, full_name: e.target.value})}
                  placeholder="e.g. John Smith"
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase mb-2 block">Email</label>
                <input value={addForm.email} onChange={(e) => setAddForm({...addForm, email: e.target.value})}
                  placeholder="e.g. john@company.com"
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase mb-2 block">Password</label>
                <input type="password" value={addForm.password} onChange={(e) => setAddForm({...addForm, password: e.target.value})}
                  placeholder="Create a password"
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase mb-2 block">Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setAddForm({...addForm, role_id: 1})}
                    className={`py-3 rounded-xl text-sm font-semibold transition-all ${addForm.role_id === 1 ? "bg-blue-500/20 border border-blue-500/40 text-blue-300" : "bg-white/5 border border-white/10 text-gray-400"}`}>
                     Admin
                  </button>
                  <button onClick={() => setAddForm({...addForm, role_id: 2})}
                    className={`py-3 rounded-xl text-sm font-semibold transition-all ${addForm.role_id === 2 ? "bg-green-500/20 border border-green-500/40 text-green-300" : "bg-white/5 border border-white/10 text-gray-400"}`}>
                     Employee
                  </button>
                </div>
              </div>
              <button onClick={handleAddUser} disabled={addLoading || !addForm.full_name || !addForm.email || !addForm.password}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl disabled:opacity-50 transition-all">
                {addLoading ? "Creating..." : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
