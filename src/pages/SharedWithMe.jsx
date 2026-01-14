import { useQuery } from "@tanstack/react-query";
import { sharesAPI } from "../lib/api";
import { Users } from "lucide-react";
import FileItem from "../components/FileItem";

export default function SharedWithMe() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["sharedWithMe"],
    queryFn: () => sharesAPI.getSharedWithMe().then((res) => res.data),
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-dark-700 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-dark-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const items = data?.items || [];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-white">Shared with me</h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-16 h-16 mx-auto text-dark-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            Nothing shared yet
          </h3>
          <p className="text-dark-400">
            Files and folders shared with you will appear here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {items.map((item) => (
            <FileItem key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
