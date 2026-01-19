import { useCallback, useEffect, useMemo, useState } from "react";
import { getItemKey, type TabListItem } from "./useTabReorder";

type UseVisibleReorderArgs = {
  items: TabListItem[];
  collapsedGroups: Set<string>;
  isDragging: boolean;
  onReorder: (items: TabListItem[]) => void;
};

export function useVisibleReorder({
  items,
  collapsedGroups,
  isDragging,
  onReorder,
}: UseVisibleReorderArgs) {
  // Exclude tabs that are inside collapsed groups (but keep the group header itself).
  const visibleItems = useMemo(() => {
    return items.filter((item) => {
      if (item.type === "group") return true;
      const groupId = item.tab.groupId;
      if (groupId === -1) return true;
      return !collapsedGroups.has(String(groupId));
    });
  }, [items, collapsedGroups]);

  const itemsByKey = useMemo(() => {
    return new Map(items.map((it) => [getItemKey(it), it] as const));
  }, [items]);

  const visibleKeys = useMemo(() => {
    return visibleItems.map(getItemKey);
  }, [visibleItems]);

  const [reorderKeys, setReorderKeys] = useState<string[]>([]);

  // Keep Framer Motion Reorder stable while dragging:
  // - During drag, Reorder continuously emits the next key order.
  // - Outside drag, we sync to the derived keys from the current data model.
  useEffect(() => {
    if (isDragging) return;
    setReorderKeys(visibleKeys);
  }, [visibleKeys, isDragging]);

  const handleVisibleReorder = useCallback(
    (newVisibleKeys: string[]) => {
      setReorderKeys(newVisibleKeys);

      const newVisibleItems = newVisibleKeys
        .map((key) => itemsByKey.get(key))
        .filter((it): it is TabListItem => Boolean(it));

      const result: TabListItem[] = [];
      for (const item of newVisibleItems) {
        result.push(item);

        // After a collapsed group header, insert its tabs.
        if (item.type === "group" && collapsedGroups.has(String(item.groupId))) {
          const groupTabs = items.filter(
            (i) => i.type === "tab" && i.tab.groupId === item.groupId
          );
          result.push(...groupTabs);
        }
      }

      onReorder(result);
    },
    [collapsedGroups, items, itemsByKey, onReorder]
  );

  return {
    reorderKeys,
    itemsByKey,
    handleVisibleReorder,
  };
}
