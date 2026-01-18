import { TabManagerFeature } from "./src/TabManagerFeature";

export { TabManagerStore } from "./src/Data/TabManager/TabManagerStore";
export { SessionTab } from "./src/Data/TabManager/Type/SessionTab";
export { SessionWindow } from "./src/Data/TabManager/Type/SessionWindow";
export { clampTabIndexForPinned, getPinnedTabCount, tabGroupColorToHex } from "./src/TabReorder";

export const TabManager = new TabManagerFeature();
