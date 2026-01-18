import { Html } from "@packages/utility";
import { MouseEventHandler, useEffect, useRef, useState } from "react";
import { SessionTab, SessionWindow } from "@packages/tab-manager";
import { Reorder } from "motion/react";
import { TabCard } from "./TabCard";
import { TabsApi } from "@packages/ext-api";
import { useTabMoveQueue } from "@packages/hooks";
import { clampTabIndexForPinned } from "@packages/tab-manager";

type WindowCardProps = {
  className?: string;
  window: SessionWindow;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onClick?: MouseEventHandler<HTMLDivElement>;
};

export function WindowCard({
  window,
  onClick,
  onMouseEnter,
  className,
}: WindowCardProps) {
  const [tabs, setTabs] = useState(window.tabs);
  const tabsRef = useRef<Array<SessionTab>>(tabs);

  const isDragging = useRef(false);
  const draggingTabId = useRef<number | null>(null);
  const lastRequestedIndex = useRef<number | null>(null);

  const moveQueue = useTabMoveQueue({
    throttleMs: 75,
    onError: (err) => {
      console.error(err);
      // If Chrome rejects a move, fall back to the canonical tab order.
      setTabs(window.tabs);
      tabsRef.current = window.tabs;
      lastRequestedIndex.current = null;
    },
  });

  useEffect(() => {
    tabsRef.current = tabs;
  }, [tabs]);

  useEffect(() => {
    // Avoid clobbering the local reorder state while a drag is in progress.
    if (isDragging.current) return;
    setTabs(window.tabs);
  }, [window.tabs]);

  const enqueueChromeTabMove = (tabId: number, targetIndex: number, immediate = false) => {
    const clampedIndex = clampTabIndexForPinned(tabsRef.current, tabId, targetIndex);
    if (clampedIndex == null) return;

    if (!immediate && lastRequestedIndex.current === clampedIndex) return;
    lastRequestedIndex.current = clampedIndex;

    moveQueue.requestMove({
      tabId,
      windowId: window.id,
      index: clampedIndex,
      immediate,
    });
  };

  const handleTabsReorder = (nextTabs: Array<SessionTab>) => {
    tabsRef.current = nextTabs;
    setTabs(nextTabs);

    if (!isDragging.current) return;

    const tabId = draggingTabId.current;
    if (!tabId) return;

    const nextIndex = nextTabs.findIndex((t) => t.id === tabId);
    if (nextIndex < 0) return;

    enqueueChromeTabMove(tabId, nextIndex);
  };

  return (
    <div
      className={Html.joinClasses("p-3", "cursor-pointer", className)}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <Reorder.Group
        values={tabs}
        onReorder={handleTabsReorder}
        as={"div"}
      >
        <ul className={"flex flex-col gap-3 grow overflow-y-auto"}>
          {tabs.map((tab) => {
            return (
              <Reorder.Item
                key={tab.id}
                value={tab}
                onDragStart={() => {
                  isDragging.current = true;
                  draggingTabId.current = tab.id;
                  lastRequestedIndex.current = null;
                  moveQueue.reset();
                }}
                onDragEnd={() => {
                  const tabId = draggingTabId.current;
                  isDragging.current = false;
                  draggingTabId.current = null;

                  if (!tabId) return;

                  const nextTabs = tabsRef.current;
                  const nextIndex = nextTabs.findIndex((t) => t.id === tabId);
                  if (nextIndex < 0) return;

                  enqueueChromeTabMove(tabId, nextIndex, true);

                  const movedTab = nextTabs[nextIndex];
                  const leftNeighbor = nextTabs[nextIndex - 1];
                  const rightNeighbor = nextTabs[nextIndex + 1];

                  const leftGroupId = leftNeighbor?.groupId ?? -1;
                  const rightGroupId = rightNeighbor?.groupId ?? -1;

                  // Heuristic: if you drop next to tabs in a group, join that group.
                  // If you drop between two different groups, do nothing (avoid picking the wrong one).
                  let desiredGroupId = -1;

                  if (leftGroupId !== -1 && rightGroupId !== -1 && leftGroupId !== rightGroupId) {
                    desiredGroupId = -1;
                  } else if (leftGroupId !== -1) {
                    desiredGroupId = leftGroupId;
                  } else if (rightGroupId !== -1) {
                    desiredGroupId = rightGroupId;
                  }

                  if (desiredGroupId !== movedTab.groupId) {
                    if (desiredGroupId === -1) {
                      TabsApi.ungroup(tabId).catch(console.error);
                    } else {
                      TabsApi.group(tabId, desiredGroupId).catch(console.error);
                    }
                  }
                }}
              >
                <TabCard
                  tab={tab}
                  onClick={() => {
                    if (isDragging.current) return;
                    return TabsApi.update(tab.id, { active: true });
                  }}
                />
              </Reorder.Item>
            );
          })}
        </ul>
      </Reorder.Group>
    </div>
  );
}
