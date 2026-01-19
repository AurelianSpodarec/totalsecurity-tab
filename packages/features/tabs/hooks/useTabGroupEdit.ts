import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TabGroupsApi, type TabGroupsUpdateInfo } from "@packages/ext-api";
import type { TabGroupColor } from "@packages/tab-manager";
import type { TabListItem } from "./useTabReorder";

export type EditingTabGroup = {
  groupId: number;
  anchorRect: DOMRect;
  draftTitle: string;
  draftColor: TabGroupColor;
};

type OpenEditorArgs = {
  groupId: number;
  anchorRect: DOMRect;
  initialTitle: string;
  initialColor: TabGroupColor;
};

export function useTabGroupEdit(items: TabListItem[]) {
  const [editingGroup, setEditingGroup] = useState<EditingTabGroup | null>(null);

  const titleDebounceRef = useRef<number | null>(null);
  const lastSentTitleRef = useRef<string>("");
  const lastSentColorRef = useRef<TabGroupColor>("grey");

  const activeEditingGroup = useMemo(() => {
    if (!editingGroup) return null;

    const exists = items.some((it) => it.type === "group" && it.groupId === editingGroup.groupId);
    return exists ? editingGroup : null;
  }, [editingGroup, items]);

  // If the group disappears from the list, just drop the editor.
  useEffect(() => {
    if (!editingGroup) return;
    if (activeEditingGroup) return;

    setEditingGroup(null);
  }, [editingGroup, activeEditingGroup]);

  // Debounced title sync while typing.
  useEffect(() => {
    if (!activeEditingGroup) return;

    const { groupId, draftTitle } = activeEditingGroup;
    if (draftTitle === lastSentTitleRef.current) return;

    if (titleDebounceRef.current != null) {
      globalThis.clearTimeout(titleDebounceRef.current);
      titleDebounceRef.current = null;
    }

    titleDebounceRef.current = globalThis.setTimeout(() => {
      const updates: TabGroupsUpdateInfo = { title: draftTitle };
      TabGroupsApi.update(groupId, updates).catch(console.error);
      lastSentTitleRef.current = draftTitle;
      titleDebounceRef.current = null;
    }, 200);

    return () => {
      if (titleDebounceRef.current != null) {
        globalThis.clearTimeout(titleDebounceRef.current);
        titleDebounceRef.current = null;
      }
    };
  }, [activeEditingGroup]);

  const closeEditor = useCallback(() => {
    if (titleDebounceRef.current != null) {
      globalThis.clearTimeout(titleDebounceRef.current);
      titleDebounceRef.current = null;
    }

    // Flush last title change (if any) so closing doesn't drop the final keystrokes.
    if (editingGroup && editingGroup.draftTitle !== lastSentTitleRef.current) {
      const updates: TabGroupsUpdateInfo = { title: editingGroup.draftTitle };
      TabGroupsApi.update(editingGroup.groupId, updates).catch(console.error);
      lastSentTitleRef.current = editingGroup.draftTitle;
    }

    setEditingGroup(null);
  }, [editingGroup]);

  const openEditor = useCallback(({ groupId, anchorRect, initialTitle, initialColor }: OpenEditorArgs) => {
    lastSentTitleRef.current = initialTitle;
    lastSentColorRef.current = initialColor;

    setEditingGroup({
      groupId,
      anchorRect,
      draftTitle: initialTitle,
      draftColor: initialColor,
    });
  }, []);

  const updateTitle = useCallback((nextTitle: string) => {
    setEditingGroup((prev) => (prev ? { ...prev, draftTitle: nextTitle } : prev));
  }, []);

  const updateColor = useCallback(
    (nextColor: TabGroupColor) => {
      setEditingGroup((prev) => (prev ? { ...prev, draftColor: nextColor } : prev));

      if (!activeEditingGroup) return;
      if (nextColor === lastSentColorRef.current) return;

      const updates: TabGroupsUpdateInfo = { color: nextColor };
      TabGroupsApi.update(activeEditingGroup.groupId, updates).catch(console.error);
      lastSentColorRef.current = nextColor;
    },
    [activeEditingGroup]
  );

  return {
    activeEditingGroup,
    openEditor,
    closeEditor,
    updateTitle,
    updateColor,
  };
}
