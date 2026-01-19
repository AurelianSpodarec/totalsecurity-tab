import { Html } from "@packages/utility";
import { MouseEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SessionWindow } from "@packages/tab-manager";
import { AnimatePresence, Reorder } from "motion/react";
import { TabGroupColor, TabGroupsApi, TabGroupsUpdateInfo } from "@packages/ext-api";
import { TabItem } from "./TabItem";
import { TabGroupEditPopup, TabGroupHeader } from "./TabGroup";
import { useTabReorder, getItemKey, TabListItem } from "../hooks/useTabReorder";

type TabListProps = {
  className?: string;
  window: SessionWindow;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onClick?: MouseEventHandler<HTMLDivElement>;
};

export function TabList({
  window,
  onClick,
  onMouseEnter,
  className,
}: TabListProps) {
  const {
    items,
    handleReorder,
    handleDragStart,
    handleDragEnd,
    handleTabClick,
    handleTabPin,
    handleTabClose,
  } = useTabReorder({ window });

  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [reorderKeys, setReorderKeys] = useState<string[]>([]);

  const [editingGroup, setEditingGroup] = useState<
    | {
        groupId: number;
        anchorRect: DOMRect;
        draftTitle: string;
        draftColor: TabGroupColor;
      }
    | null
  >(null);

  const titleDebounceRef = useRef<number | null>(null);
  const lastSentTitleRef = useRef<string>("");
  const lastSentColorRef = useRef<TabGroupColor>("grey");

  const activeEditingGroup = useMemo(() => {
    if (!editingGroup) return null;

    // Groups are represented as explicit list items (inserted by `buildListItems`).
    // Keep the edit popup anchored only while the group still exists.
    const exists = items.some(
      (it) => it.type === "group" && it.groupId === editingGroup.groupId
    );

    return exists ? editingGroup : null;
  }, [editingGroup, items]);

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

  const closeEditingGroup = useCallback(() => {
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

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  // Filter items for Reorder.Group - exclude tabs in collapsed groups
  const visibleItems = useMemo(() => {
    return items.filter((item) => {
      if (item.type === "group") return true;
      const groupId = item.tab.groupId;
      if (groupId === -1) return true;
      return !collapsedGroups.has(String(groupId));
    });
  }, [items, collapsedGroups]);

  const handleItemDragStart = useCallback(
    (item: TabListItem) => {
      setIsDragging(true);
      handleDragStart(item);
    },
    [handleDragStart]
  );

  const handleItemDragEnd = useCallback(() => {
    handleDragEnd();
    setIsDragging(false);
  }, [handleDragEnd]);

  const itemsByKey = useMemo(() => {
    return new Map(items.map((it) => [getItemKey(it), it] as const));
  }, [items]);

  const visibleKeys = useMemo(() => {
    return visibleItems.map(getItemKey);
  }, [visibleItems]);

  // Keep Framer Motion Reorder stable while dragging:
  // - During drag, Reorder continuously emits the next key order.
  // - Outside drag, we sync to the derived keys from the current data model.
  useEffect(() => {
    if (isDragging) return;
    setReorderKeys(visibleKeys);
  }, [visibleKeys, isDragging]);

  // When reordering visible items, reconstruct full item list with collapsed tabs.
  // Note: Reorder is driven by stable string keys so dragging doesn't get cancelled
  // when tab objects are cloned/updated mid-drag.
  const handleVisibleReorder = (newVisibleKeys: string[]) => {
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

    handleReorder(result);
  };

  return (
    <div
      className={Html.joinClasses("p-3", "cursor-pointer", className)}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      {activeEditingGroup && (
        <TabGroupEditPopup
          key={activeEditingGroup.groupId}
          groupId={activeEditingGroup.groupId}
          title={activeEditingGroup.draftTitle}
          color={activeEditingGroup.draftColor}
          anchorRect={activeEditingGroup.anchorRect}
          onClose={closeEditingGroup}
          onTitleChange={(nextTitle) => {
            setEditingGroup((prev) => (prev ? { ...prev, draftTitle: nextTitle } : prev));
          }}
          onColorChange={(nextColor) => {
            setEditingGroup((prev) => (prev ? { ...prev, draftColor: nextColor } : prev));

            if (!activeEditingGroup) return;
            if (nextColor === lastSentColorRef.current) return;

            const updates: TabGroupsUpdateInfo = { color: nextColor };
            TabGroupsApi.update(activeEditingGroup.groupId, updates).catch(console.error);
            lastSentColorRef.current = nextColor;
          }}
        />
      )}
      <Reorder.Group values={reorderKeys} onReorder={handleVisibleReorder} as="div">
        <div className="flex flex-col overflow-x-hidden">
          <AnimatePresence initial={false}>
            {reorderKeys.map((key, idx) => {
              const item = itemsByKey.get(key);
              if (!item) return null;

              // Replace `gap-3` with a per-item margin. This keeps spacing consistent,
              // and (critically) lets exiting items animate their spacing to 0 so we don't
              // temporarily overflow the scroll container and flash an extra scrollbar.
              const isLast = idx === reorderKeys.length - 1;
              const itemSpacing = isLast ? 0 : 12;

              if (item.type === "group") {
                const groupIdStr = String(item.groupId);
                const isExpanded = !collapsedGroups.has(groupIdStr);

                return (
                  <Reorder.Item
                    key={key}
                    value={key}
                    as="div"
                    style={{ marginBottom: itemSpacing }}
                    onDragStart={() => handleItemDragStart(item)}
                    onDragEnd={() => handleItemDragEnd()}
                  >
                    <TabGroupHeader
                      title={
                        activeEditingGroup?.groupId === item.groupId
                          ? activeEditingGroup.draftTitle
                          : item.groupTitle
                      }
                      groupColor={
                        activeEditingGroup?.groupId === item.groupId
                          ? activeEditingGroup.draftColor
                          : item.groupColor
                      }
                      isExpanded={isExpanded}
                      onToggle={() => toggleGroup(groupIdStr)}
                      onEdit={(anchorRect) => {
                        const initialTitle = item.groupTitle ?? "";
                        const initialColor = item.groupColor ?? "grey";
                        lastSentTitleRef.current = initialTitle;
                        lastSentColorRef.current = initialColor;
                        setEditingGroup({
                          groupId: item.groupId,
                          anchorRect,
                          draftTitle: initialTitle,
                          draftColor: initialColor,
                        });
                      }}
                    />
                  </Reorder.Item>
                );
              }

              const tab = item.tab;
              const displayTab =
                activeEditingGroup?.groupId === tab.groupId
                  ? {
                      ...tab,
                      groupTitle: activeEditingGroup.draftTitle,
                      groupColor: activeEditingGroup.draftColor,
                    }
                  : tab;

              return (
                <Reorder.Item
                  key={key}
                  value={key}
                  as="div"
                  style={{ overflow: "hidden", willChange: "height, opacity", marginBottom: itemSpacing }}
                  initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                  animate={{ height: "auto", opacity: 1, marginBottom: itemSpacing }}
                  exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                  transition={{
                    type: "tween",
                    ease: "easeInOut",
                    height: { duration: 0.12 },
                    opacity: { duration: 0.08 },
                    marginBottom: { duration: 0.08 },
                  }}
                  onDragStart={() => handleItemDragStart(item)}
                  onDragEnd={() => handleItemDragEnd()}
                >
                  <TabItem
                    tab={displayTab}
                    onClick={() => handleTabClick(tab)}
                    onPin={() => handleTabPin(tab)}
                    onClose={() => handleTabClose(tab)}
                  />
                </Reorder.Item>
              );
            })}
          </AnimatePresence>
        </div>
      </Reorder.Group>
    </div>
  );
}
