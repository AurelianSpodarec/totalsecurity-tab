import { TabStatusEnum } from "./TabStatusEnum";

export type Tab = {
  active: boolean;
  audible?: boolean;
  autoDiscardable: boolean;
  discarded: boolean;
  favIconUrl?: string;
  groupId: number;
  height?: number;
  highlighted: boolean;
  id?: number;
  incognito: boolean;
  index: number;
  mutedInfo?: { extensionId?: string; muted: boolean; reason: "user" | "capture" | "extension" };
  openerTabId?: number;
  pendingUrl?: string;
  pinned: boolean;
  sessionId?: string;
  status?: TabStatusEnum;
  title?: string;
  url?: string;
  width?: number;
  windowId: number;
};
