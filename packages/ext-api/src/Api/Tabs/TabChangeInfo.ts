import { TabStatusEnum } from "./TabStatusEnum";

export type TabChangeInfo = {
  audible?: boolean,
  autoDiscardable?: boolean,
  discarded?: boolean,
  favIconUrl?: string,
  groupId?: boolean,
  mutedInfo?: boolean,
  pinned?: boolean,
  status?: TabStatusEnum,
  title?: string,
  url?: string
};
