import { useMemo, useEffect, useRef, useState } from "react";
import { SessionTab, SessionWindow, clampTabIndexForPinned, getPinnedTabCount } from "@packages/tab-manager";
import { TabGroupsApi, TabsApi, TabGroupColor } from "@packages/ext-api";

export type TabItem = {
  type: "tab";
  tab: SessionTab;
};

export type GroupTitleItem = {
  type: "group";
  groupId: number;
  groupTitle?: string;
  groupColor?: TabGroupColor;
};

export type TabListItem = TabItem | GroupTitleItem;

export function buildListItems(tabs: SessionTab[]): TabListItem[] {
  const result: TabListItem[] = [];
  const seenGroups = new Set<number>();

  for (const tab of tabs) {
    const gid = tab.groupId;
    if (gid !== -1 && !seenGroups.has(gid)) {
      seenGroups.add(gid);
      result.push({ type: "group", groupId: gid, groupTitle: tab.groupTitle, groupColor: tab.groupColor });
    }
    result.push({ type: "tab", tab });
  }
  return result;
}

export function getItemKey(item: TabListItem): string {
  return item.type === "tab" ? `tab-${item.tab.id}` : `group-${item.groupId}`;
}

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

  type DraggingInfo = { type: "tab"; tabId: number } | { type: "group"; groupId: number } | null;
  const dragging = useRef<DraggingInfo>(null);

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
    if (dragging.current) return;
    setTabs(window.tabs);
  }, [window.tabs]);

  const items = useMemo(() => buildListItems(tabs), [tabs]);
  const itemsRef = useRef<TabListItem[]>(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

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

  const computeGroupFromItemNeighbors = (nextItems: TabListItem[], itemIndex: number): { groupId: number; groupColor?: TabGroupColor; groupTitle?: string } => {
    const left = nextItems[itemIndex - 1];
    const right = nextItems[itemIndex + 1];

    if (left && left.type === "group") {
      return { groupId: left.groupId, groupColor: left.groupColor, groupTitle: left.groupTitle };
    }

    const leftGroupId = left && left.type === "tab" ? (getOriginalTab(left.tab.id)?.groupId ?? -1) : -1;
    const rightGroupId = right && right.type === "tab" ? (getOriginalTab(right.tab.id)?.groupId ?? -1) : -1;

    if (leftGroupId !== -1 && leftGroupId === rightGroupId) {
      const leftOriginal = left && left.type === "tab" ? getOriginalTab(left.tab.id) : undefined;
      return { groupId: leftGroupId, groupColor: leftOriginal?.groupColor, groupTitle: leftOriginal?.groupTitle };
    }
    return { groupId: -1, groupColor: undefined, groupTitle: undefined };
  };

  const handleReorder = (nextItems: TabListItem[]) => {
    if (!dragging.current) {
      const nextTabs = nextItems.filter((it): it is TabItem => it.type === "tab").map((it) => it.tab);
      tabsRef.current = nextTabs;
      setTabs(nextTabs);
      return;
    }

    if (dragging.current.type === "tab") {
      const tabId = dragging.current.tabId;
      const draggedTab = originalDraggedTab.current;
      if (!draggedTab) return;

      let nextTabs = nextItems.filter((it): it is TabItem => it.type === "tab").map((it) => it.tab);
      const draggedIdx = nextTabs.findIndex((t) => t.id === tabId);
      if (draggedIdx < 0) {
        tabsRef.current = nextTabs;
        setTabs(nextTabs);
        return;
      }

      const pinnedCount = getPinnedTabCount(tabsRef.current);
      const isPinned = draggedTab.pinned;

      if (isPinned && draggedIdx >= pinnedCount) {
        const removed = nextTabs.splice(draggedIdx, 1)[0];
        const clampedIdx = Math.max(0, pinnedCount - 1);
        nextTabs.splice(clampedIdx, 0, removed);
      } else if (!isPinned && draggedIdx < pinnedCount) {
        const removed = nextTabs.splice(draggedIdx, 1)[0];
        nextTabs.splice(pinnedCount, 0, removed);
      }

      const finalIdx = nextTabs.findIndex((t) => t.id === tabId);
      const itemIdx = nextItems.findIndex((it) => it.type === "tab" && it.tab.id === tabId);
      const { groupId, groupColor, groupTitle } = computeGroupFromItemNeighbors(nextItems, itemIdx >= 0 ? itemIdx : finalIdx);
      nextTabs = nextTabs.map((t) =>
        t.id === tabId ? { ...t, groupId, groupColor, groupTitle } : t
      );

      tabsRef.current = nextTabs;
      setTabs(nextTabs);

      if (finalIdx >= 0) enqueueChromeTabMove(tabId, finalIdx);
      return;
    }

    if (dragging.current.type === "group") {
      const gid = dragging.current.groupId;
      const titleIdx = nextItems.findIndex((it) => it.type === "group" && it.groupId === gid);
      if (titleIdx < 0) {
        return;
      }

      const pinnedCount = getPinnedTabCount(tabs);

      const groupedTabs = new Map<number, SessionTab[]>();
      for (const t of tabs) {
        if (t.groupId !== -1) {
          if (!groupedTabs.has(t.groupId)) groupedTabs.set(t.groupId, []);
          groupedTabs.get(t.groupId)!.push(t);
        }
      }

      const pinnedTabs = tabs.filter((t) => t.pinned);
      const reordered: SessionTab[] = [...pinnedTabs];

      for (let i = 0; i < nextItems.length; i++) {
        const item = nextItems[i];
        if (item.type === "group") {
          const gTabs = groupedTabs.get(item.groupId) || [];
          reordered.push(...gTabs);
        } else if (item.type === "tab" && item.tab.groupId === -1 && !item.tab.pinned) {
          reordered.push(item.tab);
        }
      }

      tabsRef.current = reordered;
      setTabs(reordered);
    }
  };

  const handleDragStart = (item: TabListItem) => {
    if (item.type === "tab") {
      dragging.current = { type: "tab", tabId: item.tab.id };
      originalDraggedTab.current = item.tab;
    } else {
      dragging.current = { type: "group", groupId: item.groupId };
    }
    lastRequestedIndex.current = null;
    moveQueue.reset();
  };

  const handleDragEnd = () => {
    const d = dragging.current;
    dragging.current = null;
    originalDraggedTab.current = null;

    if (!d) return;

    if (d.type === "tab") {
      const tabId = d.tabId;
      const nextTabs = tabsRef.current;
      const nextIndex = nextTabs.findIndex((t) => t.id === tabId);
      if (nextIndex < 0) return;

      enqueueChromeTabMove(tabId, nextIndex, true);

      const originalMovedTab = getOriginalTab(tabId);
      const itms = itemsRef.current;
      const itemIdx = itms.findIndex((it) => it.type === "tab" && it.tab.id === tabId);
      const { groupId: desiredGroupId, groupColor: desiredGroupColor, groupTitle: desiredGroupTitle } = computeGroupFromItemNeighbors(itms, itemIdx);
      const originalGroupId = originalMovedTab?.groupId ?? -1;

      if (desiredGroupId !== originalGroupId) {
        const updatedTabs = nextTabs.map((t) =>
          t.id === tabId ? { ...t, groupId: desiredGroupId, groupColor: desiredGroupColor, groupTitle: desiredGroupTitle } : t
        );
        tabsRef.current = updatedTabs;
        setTabs(updatedTabs);

        if (desiredGroupId === -1) {
          TabsApi.ungroup(tabId).catch(console.error);
        } else {
          TabsApi.group(tabId, desiredGroupId).catch(console.error);
        }
      }
      return;
    }

    if (d.type === "group") {
      const gid = d.groupId;
      const nextTabs = tabsRef.current;
      const pinnedCount = getPinnedTabCount(nextTabs);
      const groupTabs = nextTabs.filter((t) => t.groupId === gid);
      if (groupTabs.length === 0) return;

      const firstTabIndex = nextTabs.findIndex((t) => t.groupId === gid);
      if (firstTabIndex < 0) return;

      const clampedIndex = Math.max(firstTabIndex, pinnedCount);

      TabGroupsApi.move(gid, { windowId: window.id, index: clampedIndex }).catch((err) => {
        console.error("tabGroups.move not supported or failed, falling back to tab moves", err);
        const sortedTabIds = groupTabs.map((t) => t.id);
        sortedTabIds.forEach((tid, i) => {
          TabsApi.move(tid, { index: clampedIndex + i, windowId: window.id }).catch(console.error);
        });
      });
    }
  };

  const handleTabClick = (tab: SessionTab) => {
    if (dragging.current) return;
    return TabsApi.update(tab.id, { active: true });
  };

  const handleTabPin = (tab: SessionTab) => {
    return TabsApi.update(tab.id, { pinned: !tab.pinned });
  };

  const handleTabClose = (tab: SessionTab) => {
    return TabsApi.remove(tab.id);
  };

  return {
    items,
    handleReorder,
    handleDragStart,
    handleDragEnd,
    handleTabClick,
    handleTabPin,
    handleTabClose,
  };
}
