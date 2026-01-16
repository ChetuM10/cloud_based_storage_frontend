import { NavLink, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Cloud,
  HardDrive,
  Users,
  Star,
  Clock,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  Folder,
  Activity,
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { utilsAPI } from "../lib/api";

const navItems = [
  { path: "/drive", icon: HardDrive, label: "My Drive" },
  { path: "/shared", icon: Users, label: "Shared with me" },
  { path: "/starred", icon: Star, label: "Starred" },
  { path: "/recent", icon: Clock, label: "Recent" },
  { path: "/trash", icon: Trash2, label: "Trash" },
  { path: "/storage", icon: Cloud, label: "Storage" },
  { path: "/activity", icon: Activity, label: "Activity" },
];

export default function Sidebar({ isOpen, onToggle }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const { data: storageData } = useQuery({
    queryKey: ["storage"],
    queryFn: () => utilsAPI.getStorageUsage().then((res) => res.data),
  });

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const formatBytes = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <aside
      className={`${
        isOpen ? "w-64" : "w-20"
      } flex flex-col bg-dark-900/50 backdrop-blur-lg border-r border-dark-700 transition-all duration-300`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-dark-700">
        <div className="flex-shrink-0 p-2 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl">
          <Cloud className="w-6 h-6 text-white" />
        </div>
        {isOpen && (
          <span className="font-bold text-lg text-white">Cloud Drive</span>
        )}
        <button
          onClick={onToggle}
          className="ml-auto p-1.5 rounded-lg hover:bg-white/10 text-dark-400 hover:text-white transition-colors"
        >
          {isOpen ? (
            <ChevronLeft className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              sidebar-item ${isActive ? "sidebar-item-active" : ""}
              ${!isOpen ? "justify-center px-3" : ""}
            `}
            title={!isOpen ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Storage usage */}
      {isOpen && storageData?.usage && (
        <div className="p-4 border-t border-dark-700">
          <div className="text-sm text-dark-400 mb-2">Storage</div>
          <div className="h-2 bg-dark-700 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(storageData.usage.usagePercent, 100)}%`,
              }}
            />
          </div>
          <div className="text-xs text-dark-400">
            {formatBytes(storageData.usage.totalBytes)} of{" "}
            {formatBytes(storageData.usage.quotaBytes)} used
          </div>
        </div>
      )}

      {/* User section */}
      <div className="p-3 border-t border-dark-700">
        <div
          className={`flex items-center gap-3 ${
            !isOpen ? "justify-center" : ""
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-medium">
            {user?.name?.[0]?.toUpperCase() ||
              user?.email?.[0]?.toUpperCase() ||
              "U"}
          </div>
          {isOpen && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {user?.name || "User"}
              </div>
              <div className="text-xs text-dark-400 truncate">
                {user?.email}
              </div>
            </div>
          )}
        </div>

        {isOpen && (
          <button
            onClick={handleLogout}
            className="mt-3 w-full sidebar-item text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign out</span>
          </button>
        )}
      </div>
    </aside>
  );
}
