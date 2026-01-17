import { useQuery } from "@tanstack/react-query";
import { utilsAPI } from "../lib/api";
import {
  HardDrive,
  Image,
  Video,
  FileText,
  Music,
  File,
  Trash2,
} from "lucide-react";

const formatBytes = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const StorageDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["storage"],
    queryFn: () => utilsAPI.getStorageUsage().then((res) => res.data),
  });

  const usage = data?.usage || {};
  const breakdown = usage.breakdown || {};

  const categories = [
    { key: "images", label: "Images", icon: Image, color: "bg-blue-500" },
    { key: "videos", label: "Videos", icon: Video, color: "bg-purple-500" },
    {
      key: "documents",
      label: "Documents",
      icon: FileText,
      color: "bg-green-500",
    },
    { key: "audio", label: "Audio", icon: Music, color: "bg-yellow-500" },
    { key: "other", label: "Other", icon: File, color: "bg-gray-500" },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Storage</h1>

      {isLoading ? (
        <div className="glass-card rounded-xl p-8 text-center text-white/60">
          <HardDrive className="w-8 h-8 mx-auto mb-2 animate-pulse" />
          <p>Loading storage info...</p>
        </div>
      ) : (
        <>
          {/* Main usage card */}
          <div className="glass-card rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                  <HardDrive className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Cloud Storage
                  </h2>
                  <p className="text-sm text-white/60">
                    {usage.fileCount || 0} files • {usage.folderCount || 0}{" "}
                    folders
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">
                  {formatBytes(usage.totalBytes || 0)}
                </p>
                <p className="text-sm text-white/60">
                  of {formatBytes(usage.quotaBytes || 0)}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(usage.usagePercent || 0, 100)}%` }}
              />
            </div>
            <p className="text-sm text-white/60 mt-2">
              {usage.usagePercent || 0}% used
            </p>
          </div>

          {/* Breakdown */}
          <div className="glass-card rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Storage Breakdown
            </h3>
            <div className="space-y-4">
              {categories.map(({ key, label, icon: Icon, color }) => {
                const bytes = breakdown[key] || 0;
                const percent = usage.totalBytes
                  ? ((bytes / usage.totalBytes) * 100).toFixed(1)
                  : 0;

                return (
                  <div key={key} className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-lg ${color}/20 flex items-center justify-center`}
                    >
                      <Icon
                        className={`w-5 h-5 ${color
                          .replace("bg-", "text-")
                          .replace("-500", "-400")}`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-medium">{label}</span>
                        <span className="text-white/60 text-sm">
                          {formatBytes(bytes)}
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${color} rounded-full transition-all duration-500`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trash info */}
          {usage.trashBytes > 0 && (
            <div className="glass-card rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-white font-medium">Trash</p>
                  <p className="text-sm text-white/60">Items in trash</p>
                </div>
              </div>
              <p className="text-white font-semibold">
                {formatBytes(usage.trashBytes)}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StorageDashboard;
