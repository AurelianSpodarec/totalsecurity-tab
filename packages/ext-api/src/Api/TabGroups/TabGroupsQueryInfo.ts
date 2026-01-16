import { TabGroupColor } from "./TabGroupColor";

export type TabGroupsQueryInfo = {
  collapsed?: boolean,
  color?: TabGroupColor,
  shared?: boolean,
  title?: string,
  windowId?: number
}
