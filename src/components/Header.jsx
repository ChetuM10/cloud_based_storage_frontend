import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, Plus, Upload, FolderPlus, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { foldersAPI } from "../lib/api";
import toast from "react-hot-toast";
import UploadModal from "./UploadModal";

export default function Header({ onMenuClick }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createFolderMutation = useMutation({
    mutationFn: (name) => foldersAPI.create({ name }),
    onSuccess: () => {
      toast.success("Folder created");
      queryClient.invalidateQueries(["folder"]);
      setShowNewFolderInput(false);
      setNewFolderName("");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error?.message || "Failed to create folder"
      );
    },
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/drive?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolderMutation.mutate(newFolderName);
    }
  };

  return (
    <>
      <header className="flex items-center gap-4 px-4 py-3 bg-dark-900/50 backdrop-blur-lg border-b border-dark-700">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-dark-400 hover:text-white transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files and folders..."
              className="w-full pl-10 pr-4 py-2.5 bg-dark-800 border border-dark-600 rounded-xl text-white placeholder-dark-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        {/* New button */}
        <div className="relative">
          <button
            onClick={() => setShowNewMenu(!showNewMenu)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">New</span>
          </button>

          {showNewMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowNewMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-dark-800 border border-dark-600 rounded-xl shadow-xl z-20 overflow-hidden animate-fade-in">
                <button
                  onClick={() => {
                    setShowUploadModal(true);
                    setShowNewMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
                >
                  <Upload className="w-5 h-5 text-primary-400" />
                  <span>Upload file</span>
                </button>
                <button
                  onClick={() => {
                    setShowNewFolderInput(true);
                    setShowNewMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
                >
                  <FolderPlus className="w-5 h-5 text-yellow-400" />
                  <span>New folder</span>
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* New folder input modal */}
      {showNewFolderInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-dark-800 border border-dark-600 rounded-xl p-6 w-full max-w-md animate-slide-up">
            <h3 className="text-lg font-semibold text-white mb-4">
              Create new folder
            </h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="input mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFolder();
                if (e.key === "Escape") setShowNewFolderInput(false);
              }}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowNewFolderInput(false)}
                className="btn-ghost"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={
                  !newFolderName.trim() || createFolderMutation.isPending
                }
                className="btn-primary"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload modal */}
      {showUploadModal && (
        <UploadModal onClose={() => setShowUploadModal(false)} />
      )}
    </>
  );
}
