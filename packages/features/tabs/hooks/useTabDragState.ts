import { useRef, useCallback } from "react";
import { SessionTab, TabListItem } from "@packages/tab-manager";

type DraggingInfo =
  | { type: "tab"; tabId: number }
  | { type: "group"; groupId: number }
  | null;

type UseTabDragStateOptions = {
  onDragStart?: () => void;
  onDragEnd?: (dragging: DraggingInfo) => void;
};

/**
 * Manages drag state for tab/group reordering.
 */
export function useTabDragState(options: UseTabDragStateOptions = {}) {
  const { onDragStart, onDragEnd } = options;

  const dragging = useRef<DraggingInfo>(null);
  const originalDraggedTab = useRef<SessionTab | null>(null);

  const isDragging = useCallback(() => dragging.current !== null, []);

  const getDragging = useCallback(() => dragging.current, []);

  const getOriginalDraggedTab = useCallback(
    () => originalDraggedTab.current,
    []
  );

  const handleDragStart = useCallback(
    (item: TabListItem) => {
      if (item.type === "tab") {
        dragging.current = { type: "tab", tabId: item.tab.id };
        originalDraggedTab.current = item.tab;
      } else {
        dragging.current = { type: "group", groupId: item.groupId };
        originalDraggedTab.current = null;
      }
      onDragStart?.();
    },
    [onDragStart]
  );

  const handleDragEnd = useCallback(() => {
    const d = dragging.current;
    dragging.current = null;
    originalDraggedTab.current = null;
    onDragEnd?.(d);
  }, [onDragEnd]);

  return {
    isDragging,
    getDragging,
    getOriginalDraggedTab,
    handleDragStart,
    handleDragEnd,
  };
}

export type { DraggingInfo };
