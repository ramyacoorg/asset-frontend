"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRole, logout, getToken } from "@/lib/auth";
import { Monitor, LogOut, LayoutDashboard, Package, Users, GitBranch, FileText, Menu, X, Plus, Search, Pencil, Trash2, AlertTriangle } from "lucide-react";

interface Asset {
  id: number;
  asset_code: string;
  asset_name: string;
  asset_category: string;
  asset_status: string;
  created_at: string;
}

const API = "https://assettracker-production-e745.up.railway.app";

export default function InventoryPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Add Modal
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ asset_code: "", asset_name: "", asset_category: "Laptop", asset_status: "available" });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  // Edit Modal
  const [showEdit, setShowEdit] = useState(false);
  const [editAsset, setEditAsset] = useState<Asset | null>(null);
  const [editForm, setEditForm] = useState({ asset_name: "", asset_category: "", asset_status: "" });
  const [editLoading, setEditLoading] = useState(false);

  // Delete Modal
  const [showDelete, setShowDelete] = useState(false);
  const [deleteAsset, setDeleteAsset] = useState<Asset | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const r = getRole();
    if (!r) router.push("/login");
    else if (r !== "admin") router.push("/dashboard");
    else { setRole(r); fetchAssets(); }
  }, [router]);

  const fetchAssets = async () => {
    try {
      const res = await fetch(`${API}/api/assets/`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      setAssets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    setAddLoading(true);
    setAddError("");
    try {
      const res = await fetch(`${API}/api/assets/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(addForm)
      });
      if (!res.ok) {
        const err = await res.json();
        setAddError(err.detail || "Failed to add asset");
        return;
      }
      setShowAdd(false);
      setAddForm({ asset_code: "", asset_name: "", asset_category: "Laptop", asset_status: "available" });
      fetchAssets();
    } catch (err) {
      setAddError("Something went wrong!");
    } finally {
      setAddLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editAsset) return;
    setEditLoading(true);
    try {
      await fetch(`${API}/api/assets/${editAsset.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(editForm)
      });
      setShowEdit(false);
      fetchAssets();
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteAsset) return;
    setDeleteLoading(true);
    try {
      await fetch(`${API}/api/assets/${deleteAsset.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      setShowDelete(false);
      fetchAssets();
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = assets.filter(a =>
    a.asset_name.toLowerCase().includes(search.toLowerCase()) ||
    a.asset_code.toLowerCase().includes(search.toLowerCase())
  );

  const adminLinks = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Package, label: "Inventory", href: "/inventory", active: true },
    { icon: Users, label: "All Users", href: "/users" },
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
              <span className="text-xs font-semibold text-blue-300">👑 Administrator</span>
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
            <h1 className="text-3xl font-bold text-white">Inventory 📦</h1>
            <p className="text-gray-400 text-sm mt-1">Manage all company assets</p>
          </div>
          <button onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all">
            <Plus className="w-4 h-4" /> Add Asset
          </button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search assets..."
            className="w-full bg-white/5 border border-white/10 text-white pl-11 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 placeholder:text-gray-500" />
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Loading assets...</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-400">
                  <th className="text-left px-6 py-4">Asset Code</th>
                  <th className="text-left px-6 py-4">Name</th>
                  <th className="text-left px-6 py-4">Category</th>
                  <th className="text-left px-6 py-4">Status</th>
                  <th className="text-left px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-gray-500">No assets found</td></tr>
                ) : filtered.map((asset) => (
                  <tr key={asset.id} className="hover:bg-white/5 transition-all">
                    <td className="px-6 py-4 font-mono text-blue-400 text-xs">{asset.asset_code}</td>
                    <td className="px-6 py-4 font-medium text-white">{asset.asset_name}</td>
                    <td className="px-6 py-4 text-gray-300">{asset.asset_category}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        asset.asset_status === "assigned" ? "bg-green-500/20 text-green-400" :
                        asset.asset_status === "available" ? "bg-blue-500/20 text-blue-400" :
                        "bg-orange-500/20 text-orange-400"}`}>{asset.asset_status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setEditAsset(asset); setEditForm({ asset_name: asset.asset_name, asset_category: asset.asset_category, asset_status: asset.asset_status }); setShowEdit(true); }}
                          className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all">
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button onClick={() => { setDeleteAsset(asset); setShowDelete(true); }}
                          className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD MODAL */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-lg">Add New Asset ➕</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            {addError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">{addError}</div>}
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase mb-2 block">Asset Code</label>
                <input value={addForm.asset_code} onChange={(e) => setAddForm({...addForm, asset_code: e.target.value})}
                  placeholder="e.g. DL-001" className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase mb-2 block">Asset Name</label>
                <input value={addForm.asset_name} onChange={(e) => setAddForm({...addForm, asset_name: e.target.value})}
                  placeholder="e.g. Dell XPS 15" className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase mb-2 block">Category</label>
                <select value={addForm.asset_category} onChange={(e) => setAddForm({...addForm, asset_category: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500">
                  <option value="Laptop">Laptop</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Monitor">Monitor</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase mb-2 block">Status</label>
                <select value={addForm.asset_status} onChange={(e) => setAddForm({...addForm, asset_status: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500">
                  <option value="available">Available</option>
                  <option value="assigned">Assigned</option>
                  <option value="under_repair">Under Repair</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
              <button onClick={handleAdd} disabled={addLoading || !addForm.asset_code || !addForm.asset_name}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl disabled:opacity-50">
                {addLoading ? "Adding..." : "Add Asset"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEdit && editAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-lg">Edit Asset ✏️</h2>
              <button onClick={() => setShowEdit(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase mb-2 block">Asset Name</label>
                <input value={editForm.asset_name} onChange={(e) => setEditForm({...editForm, asset_name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase mb-2 block">Category</label>
                <select value={editForm.asset_category} onChange={(e) => setEditForm({...editForm, asset_category: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500">
                  <option value="Laptop">Laptop</option>
                  <option value="Mobile">Mobile</option>
                  <option value="Monitor">Monitor</option>
                  <option value="Tablet">Tablet</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs font-semibold uppercase mb-2 block">Status</label>
                <select value={editForm.asset_status} onChange={(e) => setEditForm({...editForm, asset_status: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500">
                  <option value="available">Available</option>
                  <option value="assigned">Assigned</option>
                  <option value="under_repair">Under Repair</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
              <button onClick={handleEdit} disabled={editLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl disabled:opacity-50">
                {editLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDelete && deleteAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-sm rounded-2xl p-6 text-center" style={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <h2 className="text-white font-bold text-lg mb-2">Delete Asset?</h2>
            <p className="text-gray-400 text-sm mb-6">Are you sure you want to delete <span className="text-white font-semibold">{deleteAsset.asset_name}</span>? This cannot be undone!</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)} className="flex-1 py-3 bg-white/5 border border-white/10 text-gray-300 rounded-xl text-sm">Cancel</button>
              <button onClick={handleDelete} disabled={deleteLoading} className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-xl text-sm disabled:opacity-50">
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
      }
