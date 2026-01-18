import { useEffect, useRef, useState } from "react";
import { SessionTab, SessionWindow, clampTabIndexForPinned } from "@packages/tab-manager";
import { TabsApi } from "@packages/ext-api";

type UseTabReorderArgs = {
  window: SessionWindow;
};

type MoveRequest = {
  tabId: number;
  windowId: number;
  index: number;
  immediate?: boolean;
};

function useTabMoveQueue(onError?: (err: unknown) => void) {
  const throttleMs = 75;
  const moveTimeout = useRef<number | null>(null);
  const moveInFlight = useRef(false);
  const moveTabId = useRef<number | null>(null);
  const moveWindowId = useRef<number | null>(null);
  const pendingIndex = useRef<number | null>(null);
  const lastCommittedIndex = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (moveTimeout.current) clearTimeout(moveTimeout.current);
    };
  }, []);

  const flush = () => {
    if (moveInFlight.current) return;
    const tabId = moveTabId.current;
    const windowId = moveWindowId.current;
    const index = pendingIndex.current;
    if (!tabId || !windowId || index == null) return;

    pendingIndex.current = null;
    if (lastCommittedIndex.current === index) return;

    moveInFlight.current = true;
    TabsApi.move(tabId, { index, windowId })
      .then(() => { lastCommittedIndex.current = index; })
      .catch((err) => { onError?.(err); })
      .finally(() => {
        moveInFlight.current = false;
        if (pendingIndex.current != null) flush();
      });
  };

  const reset = () => {
    if (moveTimeout.current) clearTimeout(moveTimeout.current);
    moveTimeout.current = null;
    moveInFlight.current = false;
    moveTabId.current = null;
    moveWindowId.current = null;
    pendingIndex.current = null;
    lastCommittedIndex.current = null;
  };

  const requestMove = ({ tabId, windowId, index, immediate }: MoveRequest) => {
    moveTabId.current = tabId;
    moveWindowId.current = windowId;
    pendingIndex.current = index;

    if (immediate) {
      if (moveTimeout.current) clearTimeout(moveTimeout.current);
      moveTimeout.current = null;
      flush();
      return;
    }

    if (moveTimeout.current) return;
    moveTimeout.current = setTimeout(() => {
      moveTimeout.current = null;
      flush();
    }, throttleMs) as unknown as number;
  };

  return { requestMove, reset };
}

export function useTabReorder({ window }: UseTabReorderArgs) {
  const [tabs, setTabs] = useState(window.tabs);
  const tabsRef = useRef<Array<SessionTab>>(tabs);

  const isDragging = useRef(false);
  const draggingTabId = useRef<number | null>(null);
  const lastRequestedIndex = useRef<number | null>(null);
  const originalDraggedTab = useRef<SessionTab | null>(null);

  const moveQueue = useTabMoveQueue((err) => {
    console.error(err);
    setTabs(window.tabs);
    tabsRef.current = window.tabs;
    lastRequestedIndex.current = null;
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

  const handleTabPin = (tab: SessionTab) => {
    return TabsApi.update(tab.id, { pinned: !tab.pinned });
  };

  const handleTabClose = (tab: SessionTab) => {
    return TabsApi.remove(tab.id);
  };

  return {
    tabs,
    handleReorder,
    handleDragStart,
    handleDragEnd,
    handleTabClick,
    handleTabPin,
    handleTabClose,
  };
}
