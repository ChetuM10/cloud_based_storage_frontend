import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { utilsAPI } from "../lib/api";
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  Folder,
  FileIcon,
} from "lucide-react";
import toast from "react-hot-toast";

export default function Trash() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["trash"],
    queryFn: () => utilsAPI.getTrash().then((res) => res.data),
  });

  const restoreMutation = useMutation({
    mutationFn: (item) =>
      utilsAPI.restore({
        resourceType: item.type,
        resourceId: item.id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["trash"]);
      queryClient.invalidateQueries(["folder"]);
      toast.success("Item restored");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || "Failed to restore");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (item) =>
      utilsAPI.permanentDelete({
        resourceType: item.type,
        resourceId: item.id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["trash"]);
      toast.success("Permanently deleted");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || "Failed to delete");
    },
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-dark-700 rounded w-48"></div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-dark-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const items = data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Trash</h1>
        {items.length > 0 && (
          <p className="text-sm text-dark-400">
            Items are permanently deleted after 30 days
          </p>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <Trash2 className="w-16 h-16 mx-auto text-dark-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            Trash is empty
          </h3>
          <p className="text-dark-400">
            Deleted files and folders will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 bg-dark-800/50 border border-dark-700 rounded-xl hover:bg-dark-800 transition-colors"
            >
              {/* Icon */}
              <div
                className={
                  item.type === "folder" ? "text-yellow-400" : "text-dark-400"
                }
              >
                {item.type === "folder" ? (
                  <Folder className="w-8 h-8" fill="currentColor" />
                ) : (
                  <FileIcon className="w-8 h-8" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{item.name}</p>
                <div className="flex items-center gap-3 text-xs text-dark-400">
                  <span>
                    Deleted {new Date(item.deletedAt).toLocaleDateString()}
                  </span>
                  {item.daysUntilDeletion <= 7 && (
                    <span className="flex items-center gap-1 text-orange-400">
                      <AlertTriangle className="w-3 h-3" />
                      {item.daysUntilDeletion} days left
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => restoreMutation.mutate(item)}
                  disabled={restoreMutation.isPending}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-dark-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restore
                </button>
                <button
                  onClick={() => {
                    if (confirm("Are you sure? This cannot be undone.")) {
                      deleteMutation.mutate(item);
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete forever
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
