import { Html } from "@packages/utility";
import { MouseEventHandler, useMemo, useState } from "react";
import { SessionWindow, SessionTab } from "@packages/tab-manager";
import { Reorder, AnimatePresence, motion } from "motion/react";
import { TabGroupColor } from "@packages/ext-api";
import { TabCard } from "./TabCard";
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

  return (
    <div
      className={Html.joinClasses("p-3", "cursor-pointer", className)}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <Reorder.Group values={items} onReorder={handleReorder} as="div">
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
                    title={groupedItem.groupTitle}
                    groupColor={groupedItem.groupColor}
                    isExpanded={isExpanded}
                    onToggle={() => toggleGroup(groupIdStr)}
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
                              tab={tab}
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
