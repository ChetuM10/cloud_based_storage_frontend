import { Cloud } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-primary-500 to-primary-700 p-4 rounded-2xl">
            <Cloud className="w-12 h-12 text-white animate-pulse" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Cloud Drive</h2>
        <p className="text-dark-400">Loading...</p>
      </div>
    </div>
  );
}
