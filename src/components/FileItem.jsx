import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Folder,
  FileText,
  Image,
  Film,
  Music,
  Archive,
  MoreVertical,
  Star,
  Download,
  Trash2,
  Share2,
  Edit2,
  FileIcon,
} from "lucide-react";
import { filesAPI, foldersAPI, utilsAPI } from "../lib/api";
import toast from "react-hot-toast";
import ShareModal from "./ShareModal";

// Get icon based on file type
const getFileIcon = (mimeType) => {
  if (!mimeType) return FileIcon;
  if (mimeType.startsWith("image/")) return Image;
  if (mimeType.startsWith("video/")) return Film;
  if (mimeType.startsWith("audio/")) return Music;
  if (
    mimeType.includes("zip") ||
    mimeType.includes("rar") ||
    mimeType.includes("7z")
  )
    return Archive;
  if (
    mimeType.includes("pdf") ||
    mimeType.includes("document") ||
    mimeType.includes("text")
  )
    return FileText;
  return FileIcon;
};

// Get icon color based on file type
const getIconColor = (type, mimeType) => {
  if (type === "folder") return "text-yellow-400";
  if (!mimeType) return "text-dark-400";
  if (mimeType.startsWith("image/")) return "text-pink-400";
  if (mimeType.startsWith("video/")) return "text-purple-400";
  if (mimeType.startsWith("audio/")) return "text-green-400";
  if (mimeType.includes("pdf")) return "text-red-400";
  return "text-primary-400";
};

// Format file size
const formatSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

export default function FileItem({ item, currentFolderId }) {
  const [showMenu, setShowMenu] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [newName, setNewName] = useState(item.name);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isFolder = item.type === "folder";
  const Icon = isFolder ? Folder : getFileIcon(item.mimeType);
  const iconColor = getIconColor(item.type, item.mimeType);

  // Star/unstar mutation
  const starMutation = useMutation({
    mutationFn: () =>
      item.isStarred
        ? utilsAPI.removeStar({ resourceType: item.type, resourceId: item.id })
        : utilsAPI.addStar({ resourceType: item.type, resourceId: item.id }),
    onSuccess: () => {
      queryClient.invalidateQueries(["folder"]);
      queryClient.invalidateQueries(["starred"]);
      toast.success(
        item.isStarred ? "Removed from starred" : "Added to starred"
      );
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () =>
      isFolder
        ? foldersAPI.deleteFolder(item.id)
        : filesAPI.deleteFile(item.id),
    onSuccess: () => {
      queryClient.invalidateQueries(["folder"]);
      toast.success("Moved to trash");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || "Failed to delete");
    },
  });

  // Rename mutation
  const renameMutation = useMutation({
    mutationFn: (name) =>
      isFolder
        ? foldersAPI.updateFolder(item.id, { name })
        : filesAPI.updateFile(item.id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries(["folder"]);
      setShowRename(false);
      toast.success("Renamed successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || "Failed to rename");
    },
  });

  // Download file
  const handleDownload = async () => {
    try {
      const response = await filesAPI.getFile(item.id);
      const { downloadUrl, name } = response.data.file;
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = name;
      link.click();
    } catch (error) {
      toast.error("Failed to download file");
    }
  };

  const handleClick = () => {
    if (isFolder) {
      navigate(`/folder/${item.id}`);
    } else {
      handleDownload();
    }
  };

  const handleRename = () => {
    if (newName.trim() && newName !== item.name) {
      renameMutation.mutate(newName.trim());
    } else {
      setShowRename(false);
    }
  };

  return (
    <>
      <div className="file-item group relative" onDoubleClick={handleClick}>
        {/* Icon */}
        <div className={`flex-shrink-0 ${iconColor}`}>
          <Icon className="w-8 h-8" fill={isFolder ? "currentColor" : "none"} />
        </div>

        {/* Name and details */}
        <div className="flex-1 min-w-0">
          {showRename ? (
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") setShowRename(false);
              }}
              className="w-full px-2 py-1 bg-dark-700 border border-dark-500 rounded text-sm text-white focus:outline-none focus:border-primary-500"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <p className="text-sm text-white truncate">{item.name}</p>
          )}
          {!isFolder && item.sizeBytes && (
            <p className="text-xs text-dark-500">
              {formatSize(item.sizeBytes)}
            </p>
          )}
        </div>

        {/* Star indicator */}
        {item.isStarred && (
          <Star className="w-4 h-4 text-yellow-400 flex-shrink-0 fill-current" />
        )}

        {/* Actions menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 text-dark-400 hover:text-white transition-all"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-1 w-44 bg-dark-800 border border-dark-600 rounded-xl shadow-xl z-20 overflow-hidden animate-fade-in">
                {!isFolder && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-white/5 transition-colors"
                  >
                    <Download className="w-4 h-4 text-dark-400" />
                    Download
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowShare(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-white/5 transition-colors"
                >
                  <Share2 className="w-4 h-4 text-dark-400" />
                  Share
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    starMutation.mutate();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-white/5 transition-colors"
                >
                  <Star
                    className={`w-4 h-4 ${
                      item.isStarred
                        ? "text-yellow-400 fill-current"
                        : "text-dark-400"
                    }`}
                  />
                  {item.isStarred ? "Remove from starred" : "Add to starred"}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRename(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-white/5 transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-dark-400" />
                  Rename
                </button>
                <div className="border-t border-dark-700 my-1"></div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMutation.mutate();
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Move to trash
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Share modal */}
      {showShare && (
        <ShareModal item={item} onClose={() => setShowShare(false)} />
      )}
    </>
  );
}
