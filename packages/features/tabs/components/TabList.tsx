import { Html } from "@packages/utility";
import { MouseEventHandler, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SessionWindow, SessionTab } from "@packages/tab-manager";
import { Reorder, AnimatePresence, motion } from "motion/react";
import { TabGroupColor, TabGroupsApi, TabGroupsUpdateInfo } from "@packages/ext-api";
import { TabCard } from "./TabCard";
import { GroupEditPopup } from "./GroupEditPopup";
import { GroupTitleCard } from "./GroupTitleCard";
import { useTabReorder, getItemKey, TabListItem } from "../hooks/useTabReorder";

type TabGroup = {
  type: "grouped";
  groupId: number;
  groupTitle?: string;
  groupColor?: TabGroupColor;
  tabs: SessionTab[];
};

type UngroupedTab = {
  type: "ungrouped";
  tab: SessionTab;
};

type GroupedListItem = TabGroup | UngroupedTab;

function buildGroupedItems(items: TabListItem[]): GroupedListItem[] {
  const result: GroupedListItem[] = [];
  let currentGroup: TabGroup | null = null;

  for (const item of items) {
    if (item.type === "group") {
      if (currentGroup) {
        result.push(currentGroup);
      }
      currentGroup = {
        type: "grouped",
        groupId: item.groupId,
        groupTitle: item.groupTitle,
        groupColor: item.groupColor,
        tabs: [],
      };
    } else {
      const tab = item.tab;
      if (tab.groupId !== -1 && currentGroup && tab.groupId === currentGroup.groupId) {
        currentGroup.tabs.push(tab);
      } else {
        if (currentGroup) {
          result.push(currentGroup);
          currentGroup = null;
        }
        result.push({ type: "ungrouped", tab });
      }
    }
  }

  if (currentGroup) {
    result.push(currentGroup);
  }

  return result;
}

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

  const groupedItems = useMemo(() => buildGroupedItems(items), [items]);

  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

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
    const exists = groupedItems.some(
      (it) => it.type === "grouped" && it.groupId === editingGroup.groupId
    );
    return exists ? editingGroup : null;
  }, [editingGroup, groupedItems]);

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

  // When reordering visible items, reconstruct full item list with collapsed tabs
  const handleVisibleReorder = (newVisibleItems: TabListItem[]) => {
    const result: TabListItem[] = [];
    for (const item of newVisibleItems) {
      result.push(item);
      // After a collapsed group header, insert its tabs
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
        <GroupEditPopup
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
      <Reorder.Group values={visibleItems} onReorder={handleVisibleReorder} as="div">
        <div className="flex flex-col gap-3 grow overflow-y-auto">
          {groupedItems.map((groupedItem) => {
            if (groupedItem.type === "ungrouped") {
              const item = items.find(
                (i) => i.type === "tab" && i.tab.id === groupedItem.tab.id
              );
              if (!item) return null;

              return (
                <Reorder.Item
                  key={getItemKey(item)}
                  value={item}
                  as="div"
                  onDragStart={() => handleDragStart(item)}
                  onDragEnd={handleDragEnd}
                >
                  <TabCard
                    tab={groupedItem.tab}
                    onClick={() => handleTabClick(groupedItem.tab)}
                    onPin={() => handleTabPin(groupedItem.tab)}
                    onClose={() => handleTabClose(groupedItem.tab)}
                  />
                </Reorder.Item>
              );
            }

            const groupItem = items.find(
              (i) => i.type === "group" && i.groupId === groupedItem.groupId
            );
            if (!groupItem) return null;

            const groupIdStr = String(groupedItem.groupId);
            const isExpanded = !collapsedGroups.has(groupIdStr);

            return (
              <div key={`group-${groupedItem.groupId}`} className="flex flex-col gap-3">
                <Reorder.Item
                  value={groupItem}
                  as="div"
                  onDragStart={() => handleDragStart(groupItem)}
                  onDragEnd={handleDragEnd}
                >
                  <GroupTitleCard
                    title={
                      activeEditingGroup?.groupId === groupedItem.groupId
                        ? activeEditingGroup.draftTitle
                        : groupedItem.groupTitle
                    }
                    groupColor={
                      activeEditingGroup?.groupId === groupedItem.groupId
                        ? activeEditingGroup.draftColor
                        : groupedItem.groupColor
                    }
                    isExpanded={isExpanded}
                    onToggle={() => toggleGroup(groupIdStr)}
                    onEdit={(anchorRect) => {
                      const initialTitle = groupedItem.groupTitle ?? "";
                      const initialColor = groupedItem.groupColor ?? "grey";
                      lastSentTitleRef.current = initialTitle;
                      lastSentColorRef.current = initialColor;
                      setEditingGroup({
                        groupId: groupedItem.groupId,
                        anchorRect,
                        draftTitle: initialTitle,
                        draftColor: initialColor,
                      });
                    }}
                  />
                </Reorder.Item>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="flex flex-col gap-3 overflow-hidden"
                    >
                      {groupedItem.tabs.map((tab) => {
                        const tabItem = items.find(
                          (i) => i.type === "tab" && i.tab.id === tab.id
                        );
                        if (!tabItem) return null;

                        return (
                          <Reorder.Item
                            key={`tab-${tab.id}`}
                            value={tabItem}
                            as="div"
                            onDragStart={() => handleDragStart(tabItem)}
                            onDragEnd={handleDragEnd}
                          >
                            <TabCard
                              tab={
                                activeEditingGroup?.groupId === groupedItem.groupId
                                  ? {
                                      ...tab,
                                      groupTitle: activeEditingGroup.draftTitle,
                                      groupColor: activeEditingGroup.draftColor,
                                    }
                                  : tab
                              }
                              onClick={() => handleTabClick(tab)}
                              onPin={() => handleTabPin(tab)}
                              onClose={() => handleTabClose(tab)}
                            />
                          </Reorder.Item>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </Reorder.Group>
    </div>
  );
}
