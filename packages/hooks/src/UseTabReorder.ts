import { useEffect, useRef, useState } from "react";
import { SessionTab, SessionWindow, clampTabIndexForPinned } from "@packages/tab-manager";
import { TabsApi } from "@packages/ext-api";
import { useTabMoveQueue } from "./UseTabMoveQueue";

type UseTabReorderArgs = {
  window: SessionWindow;
};

export function useTabReorder({ window }: UseTabReorderArgs) {
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
      setTabs(window.tabs);
      tabsRef.current = window.tabs;
      lastRequestedIndex.current = null;
    },
  });

  useEffect(() => {
    tabsRef.current = tabs;
  }, [tabs]);

  useEffect(() => {
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

  const getOriginalTab = (id: number) => window.tabs.find((t) => t.id === id);

  const computeGroupFromNeighbors = (nextTabs: SessionTab[], targetIndex: number) => {
    const leftNeighbor = nextTabs[targetIndex - 1];
    const rightNeighbor = nextTabs[targetIndex + 1];

    const leftOriginal = leftNeighbor ? getOriginalTab(leftNeighbor.id) : undefined;
    const rightOriginal = rightNeighbor ? getOriginalTab(rightNeighbor.id) : undefined;

    const leftGroupId = leftOriginal?.groupId ?? -1;
    const rightGroupId = rightOriginal?.groupId ?? -1;

    if (leftGroupId !== -1 && leftGroupId === rightGroupId) {
      return { groupId: leftGroupId, groupColor: leftOriginal?.groupColor };
    }
    return { groupId: -1, groupColor: undefined };
  };

  const handleReorder = (nextTabs: Array<SessionTab>) => {
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

    const { groupId, groupColor } = computeGroupFromNeighbors(nextTabs, nextIndex);

    const updatedTabs = nextTabs.map((t) =>
      t.id === tabId ? { ...t, groupId, groupColor } : t
    );

    tabsRef.current = updatedTabs;
    setTabs(updatedTabs);
    enqueueChromeTabMove(tabId, nextIndex);
  };

  const handleDragStart = (tab: SessionTab) => {
    isDragging.current = true;
    draggingTabId.current = tab.id;
    originalDraggedTab.current = tab;
    lastRequestedIndex.current = null;
    moveQueue.reset();
  };

  const handleDragEnd = () => {
    const tabId = draggingTabId.current;
    isDragging.current = false;
    draggingTabId.current = null;
    originalDraggedTab.current = null;

    if (!tabId) return;

    const nextTabs = tabsRef.current;
    const nextIndex = nextTabs.findIndex((t) => t.id === tabId);
    if (nextIndex < 0) return;

    enqueueChromeTabMove(tabId, nextIndex, true);

    const originalMovedTab = getOriginalTab(tabId);
    const { groupId: desiredGroupId, groupColor: desiredGroupColor } = computeGroupFromNeighbors(nextTabs, nextIndex);
    const originalGroupId = originalMovedTab?.groupId ?? -1;

    if (desiredGroupId !== originalGroupId) {
      const updatedTabs = nextTabs.map((t) =>
        t.id === tabId ? { ...t, groupId: desiredGroupId, groupColor: desiredGroupColor } : t
      );
      tabsRef.current = updatedTabs;
      setTabs(updatedTabs);

      if (desiredGroupId === -1) {
        TabsApi.ungroup(tabId).catch(console.error);
      } else {
        TabsApi.group(tabId, desiredGroupId).catch(console.error);
      }
    }
  };

  const handleTabClick = (tab: SessionTab) => {
    if (isDragging.current) return;
    return TabsApi.update(tab.id, { active: true });
  };

  return {
    tabs,
    handleReorder,
    handleDragStart,
    handleDragEnd,
    handleTabClick,
  };
}
