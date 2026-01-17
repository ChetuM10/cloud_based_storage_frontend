import { useState, useCallback } from "react";

/**
 * Hook for managing multi-selection and bulk actions
 */
export const useSelection = () => {
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null);

  const toggleSelect = useCallback(
    (itemId, index, shiftKey = false, items = []) => {
      setSelectedItems((prev) => {
        const next = new Set(prev);

        if (shiftKey && lastSelectedIndex !== null && items.length > 0) {
          // Range selection with shift
          const start = Math.min(lastSelectedIndex, index);
          const end = Math.max(lastSelectedIndex, index);
          for (let i = start; i <= end; i++) {
            if (items[i]) {
              next.add(items[i].id);
            }
          }
        } else {
          // Toggle single item
          if (next.has(itemId)) {
            next.delete(itemId);
          } else {
            next.add(itemId);
          }
        }

        return next;
      });
      setLastSelectedIndex(index);
    },
    [lastSelectedIndex]
  );

  const selectAll = useCallback((items) => {
    setSelectedItems(new Set(items.map((item) => item.id)));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
    setLastSelectedIndex(null);
  }, []);

  const isSelected = useCallback(
    (itemId) => {
      return selectedItems.has(itemId);
    },
    [selectedItems]
  );

  return {
    selectedItems,
    selectedCount: selectedItems.size,
    toggleSelect,
    selectAll,
    clearSelection,
    isSelected,
  };
};

export default useSelection;
