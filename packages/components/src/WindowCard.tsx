import { Html } from "@packages/utility";
import { MouseEventHandler, useEffect, useRef, useState } from "react";
import { SessionTab, SessionWindow } from "@packages/tab-manager";
import { Reorder } from "motion/react";
import { TabCard } from "./TabCard";
import { TabsApi } from "@packages/ext-api";

type TabCardProps = {
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
}: TabCardProps) {
  const [tabs, setTabs] = useState(window.tabs);
  const tabsRef = useRef<Array<SessionTab>>(tabs);

  const dragging = useRef(false);
  const draggingTabId = useRef<number | null>(null);

  const moveTabId = useRef<number | null>(null);
  const pendingIndex = useRef<number | null>(null);
  const lastEnqueuedIndex = useRef<number | null>(null);
  const lastCommittedIndex = useRef<number | null>(null);
  const moveInFlight = useRef(false);
  const moveTimeout = useRef<number | null>(null);

  useEffect(() => {
    tabsRef.current = tabs;
  }, [tabs]);

  useEffect(() => {
    if (dragging.current) return;
    setTabs(window.tabs);
  }, [window.tabs]);

  useEffect(() => {
    return () => {
      if (moveTimeout.current) {
        clearTimeout(moveTimeout.current);
        moveTimeout.current = null;
      }
    };
  }, []);

  const clampTargetIndex = (nextTabs: Array<SessionTab>, tabId: number, targetIndex: number) => {
    const movedTab = nextTabs.find((t) => t.id === tabId);
    if (!movedTab) return null;

    const pinnedCount = nextTabs.filter((t) => t.pinned).length;
    const lastIndex = Math.max(nextTabs.length - 1, 0);

    return movedTab.pinned
      ? Math.min(Math.max(targetIndex, 0), Math.max(pinnedCount - 1, 0))
      : Math.min(Math.max(targetIndex, pinnedCount), Math.max(lastIndex, pinnedCount));
  };

  const flushMove = () => {
    if (moveInFlight.current) return;

    const tabId = moveTabId.current;
    const index = pendingIndex.current;
    if (!tabId || index == null) return;

    pendingIndex.current = null;

    if (lastCommittedIndex.current === index) return;

    moveInFlight.current = true;

    TabsApi.move(tabId, { index, windowId: window.id })
      .then(() => {
        lastCommittedIndex.current = index;
      })
      .catch((err) => {
        console.error(err);

        setTabs(window.tabs);
        tabsRef.current = window.tabs;

        pendingIndex.current = null;
        lastEnqueuedIndex.current = null;
        lastCommittedIndex.current = null;
      })
      .finally(() => {
        moveInFlight.current = false;

        if (pendingIndex.current != null) {
          flushMove();
        }
      });
  };

  const requestMove = (tabId: number, index: number, immediate = false) => {
    moveTabId.current = tabId;
    pendingIndex.current = index;

    if (immediate) {
      if (moveTimeout.current) {
        clearTimeout(moveTimeout.current);
        moveTimeout.current = null;
      }
      flushMove();
      return;
    }

    if (moveTimeout.current) return;
    moveTimeout.current = setTimeout(() => {
      moveTimeout.current = null;
      flushMove();
    }, 75) as unknown as number;
  };

  const onReorderTabs = (nextTabs: Array<SessionTab>) => {
    tabsRef.current = nextTabs;
    setTabs(nextTabs);

    if (!dragging.current) return;

    const tabId = draggingTabId.current;
    if (!tabId) return;

    const nextIndex = nextTabs.findIndex((t) => t.id === tabId);
    if (nextIndex < 0) return;

    const clampedIndex = clampTargetIndex(nextTabs, tabId, nextIndex);
    if (clampedIndex == null) return;

    if (lastEnqueuedIndex.current === clampedIndex) return;
    lastEnqueuedIndex.current = clampedIndex;

    requestMove(tabId, clampedIndex);
  };

  return (
    <div
      className={Html.joinClasses("p-3", "cursor-pointer", className)}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <Reorder.Group
        values={tabs}
        onReorder={onReorderTabs}
        as={"div"}
      >
        <ul className={"flex flex-col gap-3 grow overflow-y-auto"}>
          {tabs.map((tab) => {
            return (
              <Reorder.Item
                key={tab.id}
                value={tab}
                onDragStart={() => {
                  dragging.current = true;
                  draggingTabId.current = tab.id;

                  moveTabId.current = tab.id;
                  pendingIndex.current = null;
                  lastEnqueuedIndex.current = null;
                  lastCommittedIndex.current = null;

                  if (moveTimeout.current) {
                    clearTimeout(moveTimeout.current);
                    moveTimeout.current = null;
                  }
                }}
                onDragEnd={() => {
                  const tabId = draggingTabId.current;
                  dragging.current = false;
                  draggingTabId.current = null;

                  if (!tabId) return;

                  const nextTabs = tabsRef.current;
                  const nextIndex = nextTabs.findIndex((t) => t.id === tabId);
                  if (nextIndex < 0) return;

                  const clampedIndex = clampTargetIndex(nextTabs, tabId, nextIndex);
                  if (clampedIndex == null) return;

                  requestMove(tabId, clampedIndex, true);
                }}
              >
                <TabCard
                  tab={tab}
                  onClick={() => {
                    if (dragging.current) return;
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
