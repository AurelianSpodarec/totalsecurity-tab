import type { TabGroupColor } from "./TabGroupColor";

export type SessionTab = {
  id: number;
  title?: string;
  faviconUrl?: string;
  url?: string;
  pinned: boolean;
  index: number;
  active: boolean;
  groupId: number;
  groupColor?: TabGroupColor;
  groupTitle?: string;
};
