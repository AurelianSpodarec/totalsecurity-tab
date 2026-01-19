import { Html } from "@packages/utility";
import { MouseEventHandler, useCallback, useEffect, useMemo, useState } from "react";
import { SessionWindow } from "@packages/tab-manager";
import { AnimatePresence, Reorder } from "motion/react";
import { TabItem } from "./TabItem";
import { TabGroupEditPopup, TabGroupHeader } from "./TabGroup";
import { useTabReorder, getItemKey, TabListItem } from "../hooks/useTabReorder";
import { useTabGroupEdit } from "../hooks/useTabGroupEdit";

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

  const {
    activeEditingGroup,
    openEditor,
    closeEditor: closeEditingGroup,
    updateTitle,
    updateColor,
  } = useTabGroupEdit(items);

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
          onTitleChange={updateTitle}
          onColorChange={updateColor}
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
                        openEditor({
                          groupId: item.groupId,
                          anchorRect,
                          initialTitle: item.groupTitle ?? "",
                          initialColor: item.groupColor ?? "grey",
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
