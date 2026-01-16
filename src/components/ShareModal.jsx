import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  X,
  Copy,
  Link2,
  User,
  Loader2,
  Check,
  Lock,
  Calendar,
} from "lucide-react";
import { sharesAPI } from "../lib/api";
import toast from "react-hot-toast";

export default function ShareModal({ item, onClose }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [showLinkSettings, setShowLinkSettings] = useState(false);
  const [linkPassword, setLinkPassword] = useState("");
  const [linkExpiry, setLinkExpiry] = useState("");
  const queryClient = useQueryClient();

  // Get existing shares
  const { data: sharesData } = useQuery({
    queryKey: ["shares", item.type, item.id],
    queryFn: () =>
      sharesAPI.getShares(item.type, item.id).then((res) => res.data),
  });

  // Get existing link shares
  const { data: linkSharesData } = useQuery({
    queryKey: ["linkShares", item.type, item.id],
    queryFn: () =>
      sharesAPI.getLinkShares(item.type, item.id).then((res) => res.data),
  });

  // Create share mutation
  const createShareMutation = useMutation({
    mutationFn: () =>
      sharesAPI.create({
        resourceType: item.type,
        resourceId: item.id,
        granteeEmail: email,
        role,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["shares", item.type, item.id]);
      setEmail("");
      toast.success("Shared successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.error?.message || "Failed to share");
    },
  });

  // Delete share mutation
  const deleteShareMutation = useMutation({
    mutationFn: (shareId) => sharesAPI.deleteShare(shareId),
    onSuccess: () => {
      queryClient.invalidateQueries(["shares", item.type, item.id]);
      toast.success("Access revoked");
    },
  });

  // Create link share mutation
  const createLinkMutation = useMutation({
    mutationFn: () =>
      sharesAPI.createLinkShare({
        resourceType: item.type,
        resourceId: item.id,
        password: linkPassword || undefined,
        expiresAt: linkExpiry ? new Date(linkExpiry).toISOString() : undefined,
      }),
    onSuccess: (response) => {
      queryClient.invalidateQueries(["linkShares", item.type, item.id]);
      toast.success("Link created");
      // Copy to clipboard
      navigator.clipboard.writeText(response.data.linkShare.publicUrl);
      toast.success("Link copied to clipboard");
      setShowLinkSettings(false);
      setLinkPassword("");
      setLinkExpiry("");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error?.message || "Failed to create link"
      );
    },
  });

  // Delete link share mutation
  const deleteLinkMutation = useMutation({
    mutationFn: (linkId) => sharesAPI.deleteLinkShare(linkId),
    onSuccess: () => {
      queryClient.invalidateQueries(["linkShares", item.type, item.id]);
      toast.success("Link deleted");
    },
  });

  const handleShare = (e) => {
    e.preventDefault();
    if (email.trim()) {
      createShareMutation.mutate();
    }
  };

  const copyLink = (url) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-dark-800 border border-dark-600 rounded-xl w-full max-w-md animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-700">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Share "{item.name}"
            </h3>
            <p className="text-sm text-dark-400">
              {item.type === "folder" ? "Folder" : "File"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-dark-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Share with user */}
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Share with people
            </label>
            <form onSubmit={handleShare} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="flex-1 input py-2"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
              </select>
              <button
                type="submit"
                disabled={!email.trim() || createShareMutation.isPending}
                className="btn-primary px-4"
              >
                {createShareMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Share"
                )}
              </button>
            </form>
          </div>

          {/* Existing shares */}
          {sharesData?.shares?.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-dark-300 mb-2">
                People with access
              </h4>
              <div className="space-y-2">
                {sharesData.shares.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center gap-3 p-2 bg-dark-700/50 rounded-lg"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
                      {share.grantee?.name?.[0]?.toUpperCase() ||
                        share.grantee?.email?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">
                        {share.grantee?.name || share.grantee?.email}
                      </p>
                      <p className="text-xs text-dark-400 capitalize">
                        {share.role}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteShareMutation.mutate(share.id)}
                      className="text-xs text-dark-400 hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Public link section */}
          <div className="border-t border-dark-700 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-dark-300">Public link</h4>
              <button
                onClick={() => setShowLinkSettings(!showLinkSettings)}
                className="text-sm text-primary-400 hover:text-primary-300"
              >
                {showLinkSettings ? "Cancel" : "Create new link"}
              </button>
            </div>

            {showLinkSettings && (
              <div className="space-y-3 mb-4 p-3 bg-dark-700/50 rounded-lg">
                <div>
                  <label className="flex items-center gap-2 text-sm text-dark-300 mb-1">
                    <Lock className="w-4 h-4" />
                    Password (optional)
                  </label>
                  <input
                    type="password"
                    value={linkPassword}
                    onChange={(e) => setLinkPassword(e.target.value)}
                    placeholder="Set a password"
                    className="w-full input py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm text-dark-300 mb-1">
                    <Calendar className="w-4 h-4" />
                    Expiry date (optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={linkExpiry}
                    onChange={(e) => setLinkExpiry(e.target.value)}
                    className="w-full input py-2 text-sm"
                  />
                </div>
                <button
                  onClick={() => createLinkMutation.mutate()}
                  disabled={createLinkMutation.isPending}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {createLinkMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Link2 className="w-4 h-4" />
                      Create link
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Existing links */}
            {linkSharesData?.linkShares?.length > 0 && (
              <div className="space-y-2">
                {linkSharesData.linkShares.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center gap-3 p-2 bg-dark-700/50 rounded-lg"
                  >
                    <Link2 className="w-5 h-5 text-dark-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">
                        {link.publicUrl}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-dark-400 flex-wrap">
                        {link.hasPassword && (
                          <span className="flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Protected
                          </span>
                        )}
                        {link.createdAt && (
                          <span>
                            Created:{" "}
                            {new Date(link.createdAt).toLocaleString(
                              undefined,
                              {
                                dateStyle: "medium",
                                timeStyle: "short",
                              }
                            )}
                          </span>
                        )}
                        {link.expiresAt && (
                          <span>
                            Expires:{" "}
                            {new Date(link.expiresAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => copyLink(link.publicUrl)}
                      className="p-1.5 hover:bg-white/10 rounded-lg text-dark-400 hover:text-white"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteLinkMutation.mutate(link.id)}
                      className="text-xs text-dark-400 hover:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t border-dark-700">
          <button onClick={onClose} className="btn-ghost">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
