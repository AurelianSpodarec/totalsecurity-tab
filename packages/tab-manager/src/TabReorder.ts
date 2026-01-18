import { TabGroupColor } from "@packages/ext-api";
import { SessionTab } from "@packages/tab-manager";

const TAB_GROUP_COLOR_HEX: Record<TabGroupColor, string> = {
  [TabGroupColor.GREY]: "#9ca3af",
  [TabGroupColor.BLUE]: "#3b82f6",
  [TabGroupColor.RED]: "#ef4444",
  [TabGroupColor.YELLOW]: "#eab308",
  [TabGroupColor.GREEN]: "#22c55e",
  [TabGroupColor.PINK]: "#ec4899",
  [TabGroupColor.PURPLE]: "#a855f7",
  [TabGroupColor.CYAN]: "#06b6d4",
  [TabGroupColor.ORANGE]: "#f97316",
};

export const tabGroupColorToHex = (color?: TabGroupColor): string | undefined => {
  if (!color) return undefined;
  return TAB_GROUP_COLOR_HEX[color];
};

export const getPinnedTabCount = (tabs: Array<SessionTab>): number => {
  return tabs.filter((t) => t.pinned).length;
};

/**
 * Clamps a target index to respect Chrome's pinned tab constraints.
 * Pinned tabs must stay at the start of the tab strip (indices [0, pinnedCount - 1]).
 * Unpinned tabs must stay after pinned tabs (indices [pinnedCount, lastIndex]).
 */
export const clampTabIndexForPinned = (
  tabs: Array<SessionTab>,
  tabId: number,
  targetIndex: number
): number | null => {
  const tab = tabs.find((t) => t.id === tabId);
  if (!tab) return null;

  const pinnedCount = getPinnedTabCount(tabs);
  const lastIndex = Math.max(tabs.length - 1, 0);

  if (tab.pinned) {
    return Math.min(Math.max(targetIndex, 0), Math.max(pinnedCount - 1, 0));
  }

  return Math.min(Math.max(targetIndex, pinnedCount), Math.max(lastIndex, pinnedCount));
};
