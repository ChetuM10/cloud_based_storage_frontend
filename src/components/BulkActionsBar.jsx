import { Trash2, Download, Move, Star, X } from "lucide-react";

const BulkActionsBar = ({
  selectedCount,
  onDelete,
  onDownload,
  onMove,
  onStar,
  onClearSelection,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
      <div className="glass-card px-4 py-3 flex items-center gap-4 rounded-xl shadow-2xl border border-white/20">
        <span className="text-sm font-medium text-white/80">
          {selectedCount} item{selectedCount > 1 ? "s" : ""} selected
        </span>

        <div className="h-4 w-px bg-white/20" />

        <div className="flex items-center gap-2">
          <button
            onClick={onDownload}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={onStar}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
            title="Star"
          >
            <Star className="w-4 h-4" />
          </button>

          <button
            onClick={onMove}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
            title="Move"
          >
            <Move className="w-4 h-4" />
          </button>

          <button
            onClick={onDelete}
            className="p-2 rounded-lg hover:bg-red-500/20 transition-colors text-red-400 hover:text-red-300"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="h-4 w-px bg-white/20" />

        <button
          onClick={onClearSelection}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
          title="Clear selection (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default BulkActionsBar;
