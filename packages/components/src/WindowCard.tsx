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
  const originalDraggedTab = useRef<SessionTab | null>(null);

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
    if (!isDragging.current) {
      tabsRef.current = nextTabs;
      setTabs(nextTabs);
      return;
    }

    const tabId = draggingTabId.current;
    if (!tabId) {
      tabsRef.current = nextTabs;
      setTabs(nextTabs);
      return;
    }

    const nextIndex = nextTabs.findIndex((t) => t.id === tabId);
    if (nextIndex < 0) {
      tabsRef.current = nextTabs;
      setTabs(nextTabs);
      return;
    }

    // Use original window.tabs for group lookup (local state may have modified groupIds)
    const getOriginalTab = (id: number) => window.tabs.find((t) => t.id === id);

    const leftNeighbor = nextTabs[nextIndex - 1];
    const rightNeighbor = nextTabs[nextIndex + 1];

    const leftOriginal = leftNeighbor ? getOriginalTab(leftNeighbor.id) : undefined;
    const rightOriginal = rightNeighbor ? getOriginalTab(rightNeighbor.id) : undefined;
    const leftGroupId = leftOriginal?.groupId ?? -1;
    const rightGroupId = rightOriginal?.groupId ?? -1;
    const leftGroupColor = leftOriginal?.groupColor;
    const rightGroupColor = rightOriginal?.groupColor;

    const originalTab = originalDraggedTab.current;
    const originalGroupId = originalTab?.groupId ?? -1;
    const originalGroupColor = originalTab?.groupColor;

    let previewGroupId = -1;
    let previewGroupColor: SessionTab["groupColor"] = undefined;

    if (leftGroupId !== -1 && leftGroupId === rightGroupId) {
      // Dropping between two tabs in the same group -> join that group
      previewGroupId = leftGroupId;
      previewGroupColor = leftGroupColor;
    }
    // Otherwise -> no group (must drop between grouped tabs to join)

    const updatedTabs = nextTabs.map((t) =>
      t.id === tabId
        ? { ...t, groupId: previewGroupId, groupColor: previewGroupColor }
        : t
    );

    tabsRef.current = updatedTabs;
    setTabs(updatedTabs);

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
                as="li"
                onDragStart={() => {
                  isDragging.current = true;
                  draggingTabId.current = tab.id;
                  originalDraggedTab.current = tab;
                  lastRequestedIndex.current = null;
                  moveQueue.reset();
                }}
                onDragEnd={() => {
                  const tabId = draggingTabId.current;
                  isDragging.current = false;
                  draggingTabId.current = null;
                  originalDraggedTab.current = null;

                  if (!tabId) return;

                  const nextTabs = tabsRef.current;
                  const nextIndex = nextTabs.findIndex((t) => t.id === tabId);
                  if (nextIndex < 0) return;

                  enqueueChromeTabMove(tabId, nextIndex, true);

                  const getOriginalTab = (id: number) => window.tabs.find((t) => t.id === id);
                  const originalMovedTab = getOriginalTab(tabId);

                  const leftNeighbor = nextTabs[nextIndex - 1];
                  const rightNeighbor = nextTabs[nextIndex + 1];
                  const leftOriginal = leftNeighbor ? getOriginalTab(leftNeighbor.id) : undefined;
                  const rightOriginal = rightNeighbor ? getOriginalTab(rightNeighbor.id) : undefined;

                  const leftGroupId = leftOriginal?.groupId ?? -1;
                  const rightGroupId = rightOriginal?.groupId ?? -1;

                  let desiredGroupId = -1;
                  let desiredGroupColor: SessionTab["groupColor"] = undefined;

                  if (leftGroupId !== -1 && leftGroupId === rightGroupId) {
                    // Dropping between two tabs in the same group -> join that group
                    desiredGroupId = leftGroupId;
                    desiredGroupColor = leftOriginal?.groupColor;
                  }
                  // Otherwise -> no group (must drop between grouped tabs to join)

                  const originalGroupId = originalMovedTab?.groupId ?? -1;
                  if (desiredGroupId !== originalGroupId) {
                    const updatedTabs = nextTabs.map((t) =>
                      t.id === tabId
                        ? { ...t, groupId: desiredGroupId, groupColor: desiredGroupColor }
                        : t
                    );
                    tabsRef.current = updatedTabs;
                    setTabs(updatedTabs);

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
