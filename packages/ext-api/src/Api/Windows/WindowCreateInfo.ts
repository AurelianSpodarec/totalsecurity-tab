import { WindowStateEnum } from "./WindowStateEnum";

export type WindowCreateInfo = {
  focused?: boolean;
  height?: number;
  incognito?: boolean;
  left?: number;
  state?: WindowStateEnum;
  tabId?: number;
  top?: number;
  type?: "normal" | "popup";
  url?: string | Array<string>;
  width?: number;
};
