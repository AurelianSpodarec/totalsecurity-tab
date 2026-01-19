import type { TabGroupColor } from "@packages/ext-api";
import { SessionTab } from "../Data/TabManager/Type/SessionTab";

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

/**
 * Builds a flat list of items for rendering, inserting group headers
 * before the first tab of each group.
 */
export function buildListItems(tabs: SessionTab[]): TabListItem[] {
  const result: TabListItem[] = [];
  const seenGroups = new Set<number>();

  for (const tab of tabs) {
    const gid = tab.groupId;
    if (gid !== -1 && !seenGroups.has(gid)) {
      seenGroups.add(gid);
      result.push({
        type: "group",
        groupId: gid,
        groupTitle: tab.groupTitle,
        groupColor: tab.groupColor,
      });
    }
    result.push({ type: "tab", tab });
  }
  return result;
}

/**
 * Returns a unique key for a list item (for React rendering).
 */
export function getItemKey(item: TabListItem): string {
  return item.type === "tab" ? `tab-${item.tab.id}` : `group-${item.groupId}`;
}
