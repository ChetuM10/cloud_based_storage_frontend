import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { sharesAPI } from "../lib/api";
import { Cloud, Lock, Download, FileText, Folder, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function PublicLink() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [resourceData, setResourceData] = useState(null);
  const [error, setError] = useState(null);

  const accessMutation = useMutation({
    mutationFn: () => sharesAPI.accessLink(token, password || undefined),
    onSuccess: (response) => {
      setResourceData(response.data);
      setRequiresPassword(false);
    },
    onError: (error) => {
      if (error.response?.data?.requiresPassword) {
        setRequiresPassword(true);
      } else {
        setError(
          error.response?.data?.error?.message || "Failed to access link"
        );
      }
    },
  });

  // Initial access attempt
  useState(() => {
    accessMutation.mutate();
  }, []);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password.trim()) {
      accessMutation.mutate();
    }
  };

  const handleDownload = () => {
    if (resourceData?.resource?.downloadUrl) {
      const link = document.createElement("a");
      link.href = resourceData.resource.downloadUrl;
      link.download = resourceData.resource.name;
      link.click();
    }
  };

  // Loading state
  if (accessMutation.isPending && !requiresPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary-400 mx-auto mb-4" />
          <p className="text-dark-400">Loading shared content...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 px-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center p-3 bg-red-500/20 rounded-2xl mb-4">
            <Cloud className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">
            Link unavailable
          </h1>
          <p className="text-dark-400">{error}</p>
        </div>
      </div>
    );
  }

  // Password required state
  if (requiresPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mb-4 shadow-lg shadow-primary-500/25">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Password protected
            </h1>
            <p className="text-dark-400">
              Enter the password to access this content
            </p>
          </div>

          <div className="card">
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="input"
                autoFocus
              />
              <button
                type="submit"
                disabled={!password.trim() || accessMutation.isPending}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3"
              >
                {accessMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Access content"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Content loaded state
  if (resourceData) {
    const { resourceType, resource } = resourceData;
    const isFolder = resourceType === "folder";

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mb-4 shadow-lg shadow-primary-500/25">
              <Cloud className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Shared with you
            </h1>
            <p className="text-dark-400">via Cloud Drive</p>
          </div>

          <div className="card">
            <div className="flex items-center gap-4 mb-6">
              <div
                className={`flex-shrink-0 ${
                  isFolder ? "text-yellow-400" : "text-primary-400"
                }`}
              >
                {isFolder ? (
                  <Folder className="w-12 h-12" fill="currentColor" />
                ) : (
                  <FileText className="w-12 h-12" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-white truncate">
                  {resource.name}
                </h2>
                {resource.sizeBytes && (
                  <p className="text-sm text-dark-400">
                    {(resource.sizeBytes / (1024 * 1024)).toFixed(2)} MB
                  </p>
                )}
              </div>
            </div>

            {!isFolder && resource.downloadUrl && (
              <button
                onClick={handleDownload}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3"
              >
                <Download className="w-5 h-5" />
                Download
              </button>
            )}

            {isFolder && (
              <p className="text-center text-dark-400 text-sm">
                Folder viewing is not available via public links
              </p>
            )}
          </div>

          <p className="mt-6 text-center text-dark-500 text-sm">
            Powered by Cloud Drive
          </p>
        </div>
      </div>
    );
  }

  return null;
}
