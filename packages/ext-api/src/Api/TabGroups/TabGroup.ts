import { TabGroupColor } from "./TabGroupColor";

export interface TabGroup
{
  collapsed: boolean,
  color: TabGroupColor,
  id: number,
  shared: boolean,
  title?: string,
  windowId: number
}
