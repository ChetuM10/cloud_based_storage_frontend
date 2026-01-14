import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Upload,
  X,
  File,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { filesAPI } from "../lib/api";
import toast from "react-hot-toast";
import axios from "axios";

export default function UploadModal({ onClose, folderId = null }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const queryClient = useQueryClient();

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: "pending", // pending, uploading, success, error
      error: null,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (fileData, index) => {
    try {
      // Update status to uploading
      setFiles((prev) =>
        prev.map((f, i) => (i === index ? { ...f, status: "uploading" } : f))
      );

      // Initialize upload
      const initResponse = await filesAPI.initUpload({
        name: fileData.name,
        mimeType: fileData.type || "application/octet-stream",
        sizeBytes: fileData.size,
        folderId,
      });

      const { fileId, uploadUrl } = initResponse.data;

      // Upload to storage
      await axios.put(uploadUrl, fileData.file, {
        headers: {
          "Content-Type": fileData.type || "application/octet-stream",
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setFiles((prev) =>
            prev.map((f, i) => (i === index ? { ...f, progress } : f))
          );
        },
      });

      // Complete upload
      await filesAPI.completeUpload({ fileId });

      // Update status to success
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index ? { ...f, status: "success", progress: 100 } : f
        )
      );

      return true;
    } catch (error) {
      console.error("Upload error:", error);
      setFiles((prev) =>
        prev.map((f, i) =>
          i === index
            ? {
                ...f,
                status: "error",
                error: error.response?.data?.error?.message || "Upload failed",
              }
            : f
        )
      );
      return false;
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      if (files[i].status === "pending") {
        const success = await uploadFile(files[i], i);
        if (success) successCount++;
      }
    }

    setUploading(false);
    queryClient.invalidateQueries(["folder"]);

    if (successCount === files.length) {
      toast.success(`${successCount} file(s) uploaded successfully`);
      onClose();
    } else if (successCount > 0) {
      toast.success(`${successCount} of ${files.length} files uploaded`);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const allDone =
    files.length > 0 &&
    files.every((f) => f.status === "success" || f.status === "error");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-dark-800 border border-dark-600 rounded-xl w-full max-w-lg animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-700">
          <h3 className="text-lg font-semibold text-white">Upload files</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-dark-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragActive
                ? "border-primary-500 bg-primary-500/10"
                : "border-dark-600 hover:border-dark-500 hover:bg-white/5"
            }`}
          >
            <input {...getInputProps()} />
            <Upload
              className={`w-10 h-10 mx-auto mb-3 ${
                isDragActive ? "text-primary-400" : "text-dark-400"
              }`}
            />
            <p className="text-dark-300 mb-1">
              {isDragActive ? "Drop files here" : "Drag and drop files here"}
            </p>
            <p className="text-dark-500 text-sm">or click to browse</p>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="mt-4 max-h-60 overflow-y-auto space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-dark-700/50 rounded-lg"
                >
                  <File className="w-5 h-5 text-dark-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white truncate">
                        {file.name}
                      </span>
                      <span className="text-xs text-dark-500">
                        {formatSize(file.size)}
                      </span>
                    </div>
                    {file.status === "uploading" && (
                      <div className="mt-1 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    )}
                    {file.status === "error" && (
                      <p className="text-xs text-red-400 mt-1">{file.error}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {file.status === "pending" && (
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 text-dark-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    {file.status === "uploading" && (
                      <Loader2 className="w-4 h-4 text-primary-400 animate-spin" />
                    )}
                    {file.status === "success" && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {file.status === "error" && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-dark-700">
          <span className="text-sm text-dark-400">
            {pendingCount > 0 && `${pendingCount} file(s) ready`}
          </span>
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-ghost">
              {allDone ? "Close" : "Cancel"}
            </button>
            {!allDone && pendingCount > 0 && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="btn-primary flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
