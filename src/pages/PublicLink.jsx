import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { sharesAPI } from "../lib/api";
import {
  Cloud,
  Lock,
  Download,
  FileText,
  Folder,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

const MAX_ATTEMPTS = 5;

export default function PublicLink() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [resourceData, setResourceData] = useState(null);
  const [error, setError] = useState(null);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [passwordError, setPasswordError] = useState(null);

  const accessMutation = useMutation({
    mutationFn: (pwd) => sharesAPI.accessLink(token, pwd || undefined),
    onSuccess: (response) => {
      setResourceData(response.data);
      setRequiresPassword(false);
      setError(null);
      setPasswordError(null);
    },
    onError: (err) => {
      const errorCode = err.response?.data?.error?.code;
      const errorMessage =
        err.response?.data?.error?.message || "Failed to access link";

      if (err.response?.data?.requiresPassword) {
        setRequiresPassword(true);
        setError(null);
        setPasswordError(null);
      } else if (errorCode === "INVALID_PASSWORD") {
        // Wrong password - increment attempts
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts >= MAX_ATTEMPTS) {
          setPasswordError(null);
          setError("max_attempts");
        } else {
          setPasswordError(
            `Invalid password. ${
              MAX_ATTEMPTS - newAttempts
            } attempts remaining.`
          );
        }
        setPassword("");
      } else {
        setError(errorMessage);
      }
    },
  });

  // Initial access attempt - only run once
  useEffect(() => {
    if (!hasAttempted) {
      setHasAttempted(true);
      accessMutation.mutate(null);
    }
  }, [hasAttempted]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password.trim() && attempts < MAX_ATTEMPTS) {
      setPasswordError(null);
      accessMutation.mutate(password);
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

  // Max attempts reached
  if (error === "max_attempts") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 px-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center p-3 bg-red-500/20 rounded-2xl mb-4">
            <AlertTriangle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">
            Maximum attempts reached
          </h1>
          <p className="text-dark-400 mb-4">
            You've exceeded the maximum number of password attempts.
          </p>
          <p className="text-dark-500 text-sm">
            Please ask the owner to share a new link with you.
          </p>
        </div>
      </div>
    );
  }

  // Other error state
  if (error && error !== "max_attempts") {
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
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className={`input ${passwordError ? "border-red-500" : ""}`}
                  autoFocus
                />
                {passwordError && (
                  <p className="mt-2 text-sm text-red-400">{passwordError}</p>
                )}
              </div>
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
            {attempts > 0 && (
              <p className="mt-3 text-center text-xs text-dark-500">
                Attempt {attempts} of {MAX_ATTEMPTS}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Content loaded state
  if (resourceData) {
    const { resourceType, resource } = resourceData;
    const isFolder = resourceType === "folder";
    const mimeType = resource.mimeType || "";
    const isImage = mimeType.startsWith("image/");
    const isPdf = mimeType === "application/pdf";
    const isVideo = mimeType.startsWith("video/");
    const isAudio = mimeType.startsWith("audio/");
    const hasPreview = isImage || isPdf || isVideo || isAudio;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 px-4 py-8">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mb-4 shadow-lg shadow-primary-500/25">
              <Cloud className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white mb-1">
              Shared with you
            </h1>
            <p className="text-dark-400 text-sm">via Cloud Drive</p>
          </div>

          <div className="card overflow-hidden">
            {/* File Preview Section */}
            {!isFolder && hasPreview && resource.downloadUrl && (
              <div className="bg-dark-900/50 border-b border-dark-700">
                {isImage && (
                  <div className="flex items-center justify-center p-4 max-h-96 overflow-hidden">
                    <img
                      src={resource.downloadUrl}
                      alt={resource.name}
                      className="max-w-full max-h-80 object-contain rounded-lg"
                    />
                  </div>
                )}

                {isPdf && (
                  <div className="h-96">
                    <iframe
                      src={`${resource.downloadUrl}#toolbar=0&navpanes=0`}
                      title={resource.name}
                      className="w-full h-full"
                    />
                  </div>
                )}

                {isVideo && (
                  <div className="flex items-center justify-center p-4">
                    <video
                      src={resource.downloadUrl}
                      controls
                      className="max-w-full max-h-80 rounded-lg"
                    >
                      Your browser does not support video playback.
                    </video>
                  </div>
                )}

                {isAudio && (
                  <div className="flex items-center justify-center p-6">
                    <audio
                      src={resource.downloadUrl}
                      controls
                      className="w-full max-w-md"
                    >
                      Your browser does not support audio playback.
                    </audio>
                  </div>
                )}
              </div>
            )}

            {/* File Info Section */}
            <div className="p-4">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`flex-shrink-0 ${
                    isFolder ? "text-yellow-400" : "text-primary-400"
                  }`}
                >
                  {isFolder ? (
                    <Folder className="w-10 h-10" fill="currentColor" />
                  ) : (
                    <FileText className="w-10 h-10" />
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
