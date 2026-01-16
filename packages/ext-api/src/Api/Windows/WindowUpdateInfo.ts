import { WindowStateEnum } from "./WindowStateEnum";

export type WindowUpdateInfo = {
  drawAttention?: boolean,
  focused?: boolean
  height?: number
  left?: number,
  state?: WindowStateEnum,
  top?: number,
  width?: number
};
