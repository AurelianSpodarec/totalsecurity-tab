export type TabGroup = chrome.tabGroups.TabGroup;
export type TabGroupColor = chrome.tabGroups.Color;

export interface TabGroupMoveProperties {
  windowId?: number;
  index: number;
}

export interface TabGroupsQueryInfo {
  collapsed?: boolean;
  color?: TabGroupColor;
  title?: string;
  windowId?: number;
}

export interface TabGroupsUpdateInfo {
  collapsed?: boolean;
  color?: TabGroupColor;
  title?: string;
}
