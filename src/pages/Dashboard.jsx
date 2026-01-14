import { useParams, useSearchParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { foldersAPI, utilsAPI } from "../lib/api";
import {
  ChevronRight,
  Folder,
  FileIcon,
  MoreVertical,
  Star,
  Download,
  Trash2,
  Share2,
  Edit2,
} from "lucide-react";
import { useState } from "react";
import FileItem from "../components/FileItem";
import toast from "react-hot-toast";

export default function Dashboard() {
  const { folderId } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q");
  const currentFolderId = folderId || "root";

  // Fetch folder contents or search results
  const { data, isLoading, error } = useQuery({
    queryKey: searchQuery
      ? ["search", searchQuery]
      : ["folder", currentFolderId],
    queryFn: () =>
      searchQuery
        ? utilsAPI.search({ q: searchQuery }).then((res) => ({
            folder: { name: `Search: "${searchQuery}"` },
            contents: res.data.results,
          }))
        : foldersAPI.getFolder(currentFolderId).then((res) => res.data),
  });

  // Fetch breadcrumb path
  const { data: pathData } = useQuery({
    queryKey: ["folderPath", currentFolderId],
    queryFn: () =>
      foldersAPI.getFolderPath(currentFolderId).then((res) => res.data),
    enabled: !searchQuery && currentFolderId !== "root",
  });

  const breadcrumbs = pathData?.path || [{ id: "root", name: "My Drive" }];

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-dark-700 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-16 bg-dark-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400">Failed to load files</p>
      </div>
    );
  }

  const folders =
    data?.contents?.filter((item) => item.type === "folder") || [];
  const files = data?.contents?.filter((item) => item.type === "file") || [];

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      {!searchQuery && (
        <nav className="flex items-center gap-1 text-sm">
          {breadcrumbs.map((item, index) => (
            <div key={item.id} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-dark-500 mx-1" />
              )}
              <Link
                to={item.id === "root" ? "/drive" : `/folder/${item.id}`}
                className={`px-2 py-1 rounded-lg hover:bg-white/5 transition-colors ${
                  index === breadcrumbs.length - 1
                    ? "text-white font-medium"
                    : "text-dark-400"
                }`}
              >
                {item.name}
              </Link>
            </div>
          ))}
        </nav>
      )}

      {/* Search title */}
      {searchQuery && (
        <h1 className="text-xl font-semibold text-white">
          {data?.folder?.name}
        </h1>
      )}

      {/* Empty state */}
      {folders.length === 0 && files.length === 0 && (
        <div className="text-center py-16">
          <Folder className="w-16 h-16 mx-auto text-dark-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            {searchQuery ? "No results found" : "This folder is empty"}
          </h3>
          <p className="text-dark-400">
            {searchQuery
              ? "Try a different search term"
              : "Upload files or create folders to get started"}
          </p>
        </div>
      )}

      {/* Folders section */}
      {folders.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-dark-400 mb-3">Folders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {folders.map((folder) => (
              <FileItem
                key={folder.id}
                item={folder}
                currentFolderId={currentFolderId}
              />
            ))}
          </div>
        </section>
      )}

      {/* Files section */}
      {files.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-dark-400 mb-3">Files</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {files.map((file) => (
              <FileItem
                key={file.id}
                item={file}
                currentFolderId={currentFolderId}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
