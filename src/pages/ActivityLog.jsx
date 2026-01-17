import { useQuery } from "@tanstack/react-query";
import { utilsAPI } from "../lib/api";
import {
  Upload,
  Edit,
  Trash2,
  RotateCcw,
  Move,
  Share2,
  Download,
  Clock,
  FileText,
  Folder,
} from "lucide-react";

const actionIcons = {
  upload: Upload,
  rename: Edit,
  delete: Trash2,
  restore: RotateCcw,
  move: Move,
  share: Share2,
  download: Download,
  create_folder: Folder,
  revert: RotateCcw,
};

const actionLabels = {
  upload: "Uploaded",
  rename: "Renamed",
  delete: "Deleted",
  restore: "Restored",
  move: "Moved",
  share: "Shared",
  download: "Downloaded",
  create_folder: "Created folder",
  revert: "Reverted",
};

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return date.toLocaleDateString();
};

const ActivityLog = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: () => utilsAPI.getActivities(50).then((res) => res.data),
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Activity Log</h1>

      <div className="glass-card rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-white/60">
            <Clock className="w-8 h-8 mx-auto mb-2 animate-spin" />
            <p>Loading activities...</p>
          </div>
        ) : !data?.activities?.length ? (
          <div className="p-8 text-center text-white/60">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {data.activities.map((activity) => {
              const Icon = actionIcons[activity.action] || FileText;
              return (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">
                      {actionLabels[activity.action] || activity.action}{" "}
                      <span className="text-white/60">
                        {activity.resource_type}
                      </span>
                    </p>
                    {activity.context?.previousName && (
                      <p className="text-sm text-white/50 truncate">
                        "{activity.context.previousName}" → new name
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-white/40 flex-shrink-0">
                    {formatTimeAgo(activity.created_at)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
