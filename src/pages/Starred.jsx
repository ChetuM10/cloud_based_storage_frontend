import { useQuery } from "@tanstack/react-query";
import { utilsAPI } from "../lib/api";
import { Star } from "lucide-react";
import FileItem from "../components/FileItem";

export default function Starred() {
  const { data, isLoading } = useQuery({
    queryKey: ["starred"],
    queryFn: () => utilsAPI.getStarred().then((res) => res.data),
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
      <h1 className="text-xl font-semibold text-white">Starred</h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <Star className="w-16 h-16 mx-auto text-dark-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            No starred items
          </h3>
          <p className="text-dark-400">
            Star files and folders to find them easily here
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
