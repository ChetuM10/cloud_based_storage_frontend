import { useEffect, useCallback } from "react";

/**
 * Hook for handling keyboard shortcuts
 * @param {Object} shortcuts - Map of key combinations to handlers
 * @param {Array} deps - Dependencies for the handlers
 */
export const useKeyboardShortcuts = (shortcuts, deps = []) => {
  const handleKeyDown = useCallback(
    (e) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      const shift = e.shiftKey;
      const alt = e.altKey;

      // Build key combination string
      let combo = "";
      if (ctrl) combo += "ctrl+";
      if (shift) combo += "shift+";
      if (alt) combo += "alt+";
      combo += key;

      // Check for matching shortcut
      if (shortcuts[combo]) {
        e.preventDefault();
        shortcuts[combo](e);
      }
    },
    [shortcuts, ...deps]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
};

/**
 * Default shortcuts configuration
 */
export const defaultShortcuts = {
  n: "New folder",
  u: "Upload file",
  delete: "Move to trash",
  enter: "Open selected",
  escape: "Clear selection",
  "/": "Focus search",
  "ctrl+a": "Select all",
  "ctrl+shift+n": "New folder",
};

export default useKeyboardShortcuts;
