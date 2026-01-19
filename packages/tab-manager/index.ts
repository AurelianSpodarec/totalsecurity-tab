export type { Session } from "./src/types/Session";
export type { SessionTab } from "./src/types/SessionTab";
export type { SessionWindow } from "./src/types/SessionWindow";
export { TAB_GROUP_COLORS } from "./src/types/TabGroupColor";
export type { TabGroupColor } from "./src/types/TabGroupColor";

export { TabManagerStore } from "./src/store/TabManagerStore";
export type { TabManagerStoreInterface } from "./src/store/TabManagerStore";

export {
  buildListItems,
  getItemKey,
  type TabListItem,
  type TabItem,
  type GroupTitleItem,
} from "./src/utils/listItems";
export { clampTabIndexForPinned, getPinnedTabCount } from "./src/utils/pinning";
