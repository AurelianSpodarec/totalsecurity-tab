export type Window = chrome.windows.Window;
export type WindowType = chrome.windows.WindowType;
export type WindowState = chrome.windows.WindowState;
export type CreateType = chrome.windows.CreateType;

export interface WindowQueryOptions {
  populate?: boolean;
  windowTypes?: WindowType[];
}

export interface WindowCreateInfo {
  url?: string | string[];
  tabId?: number;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  focused?: boolean;
  incognito?: boolean;
  type?: CreateType;
  state?: WindowState;
  setSelfAsOpener?: boolean;
}

export interface WindowUpdateInfo {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  focused?: boolean;
  drawAttention?: boolean;
  state?: WindowState;
}
