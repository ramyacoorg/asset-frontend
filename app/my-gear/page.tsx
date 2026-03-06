"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRole, logout } from "@/lib/auth";
import { Monitor, LogOut, LayoutDashboard, FileText, Menu, X } from "lucide-react";

export default function MyGearPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const r = getRole();
    if (!r) router.push("/login");
    else setRole(r);
  }, [router]);

  if (!role) return null;

  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900">

      {/* SIDEBAR - Light Mode */}
      <div className={`${sidebarOpen ? "w-64" : "w-16"} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shadow-sm`}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Monitor className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-800">OptiAsset</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-gray-600">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {sidebarOpen && (
          <div className="px-4 py-3">
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-700">
               Employee
            </span>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-1">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all text-sm"
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Dashboard</span>}
          </button>
          <button
            onClick={() => router.push("/my-gear")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-blue-50 text-blue-600 font-medium transition-all text-sm"
          >
            <Monitor className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>My Gear</span>}
          </button>
          <button
            onClick={() => router.push("/my-tickets")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all text-sm"
          >
            <FileText className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>My Tickets</span>}
          </button>
        </nav>

        <div className="p-3 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50 transition-all text-sm"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Gear 💻</h1>
          <p className="text-gray-500 text-sm mt-1">Assets currently assigned to you</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Monitor className="w-6 h-6 text-blue-600" />
              </div>
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">Active</span>
            </div>
            <h3 className="font-semibold text-gray-900">Dell Laptop</h3>
            <p className="text-gray-500 text-sm mt-1">Asset Code: DL-001</p>
            <p className="text-gray-400 text-xs mt-1">Assigned: Jan 15, 2026</p>
            <button className="mt-4 w-full bg-red-50 text-red-500 hover:bg-red-100 text-sm py-2 rounded-xl transition-all font-medium">
               Report Issue
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-xl">
                <Monitor className="w-6 h-6 text-purple-600" />
              </div>
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">Active</span>
            </div>
            <h3 className="font-semibold text-gray-900">iPhone 14</h3>
            <p className="text-gray-500 text-sm mt-1">Asset Code: IP-014</p>
            <p className="text-gray-400 text-xs mt-1">Assigned: Feb 1, 2026</p>
            <button className="mt-4 w-full bg-red-50 text-red-500 hover:bg-red-100 text-sm py-2 rounded-xl transition-all font-medium">
              🔧 Report Issue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}