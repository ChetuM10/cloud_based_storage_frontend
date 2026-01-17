import { X, Keyboard } from "lucide-react";

const shortcuts = [
  { key: "N", description: "New folder" },
  { key: "U", description: "Upload file" },
  { key: "Delete", description: "Move to trash" },
  { key: "Enter", description: "Open selected item" },
  { key: "Esc", description: "Clear selection" },
  { key: "/", description: "Focus search" },
  { key: "Ctrl + A", description: "Select all" },
  { key: "Shift + Click", description: "Range selection" },
  { key: "Ctrl + Click", description: "Multi-select" },
];

const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="glass-card rounded-2xl w-full max-w-md overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-primary-400" />
            <h2 className="text-lg font-semibold text-white">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <div className="p-4 space-y-2">
          {shortcuts.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5"
            >
              <span className="text-white/80">{shortcut.description}</span>
              <kbd className="px-2 py-1 text-sm font-mono bg-white/10 rounded text-white/60 border border-white/20">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-white/10">
          <p className="text-sm text-white/40 text-center">
            Press{" "}
            <kbd className="px-1 py-0.5 text-xs bg-white/10 rounded">?</kbd> to
            show this dialog
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;
