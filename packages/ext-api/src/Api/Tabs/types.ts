export type Tab = chrome.tabs.Tab;
export type TabStatus = chrome.tabs.TabStatus;
export type MutedInfo = chrome.tabs.MutedInfo;

export interface TabMoveProperties {
  windowId?: number;
  index: number;
}

export interface TabUpdateProperties {
  active?: boolean;
  autoDiscardable?: boolean;
  highlighted?: boolean;
  muted?: boolean;
  openerTabId?: number;
  pinned?: boolean;
  url?: string;
}

export interface TabCreateProperties {
  url?: string;
  active?: boolean;
  index?: number;
}
