import { Tab } from "../Tabs/Tab";
import { WindowStateEnum } from "./WindowStateEnum";
import { WindowTypeEnum } from "./WindowTypeEnum";

export interface Window {
  alwaysOnTop: boolean,
  focused: boolean,
  height?: number,
  id?: number,
  incognito: boolean,
  left?: number,
  sessionId?: string,
  state?: WindowStateEnum,
  tabs?: Array<Tab>,
  top?: number,
  type?: WindowTypeEnum,
  width?: number
}
