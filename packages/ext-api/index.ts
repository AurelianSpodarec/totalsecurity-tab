// Runtime API
export { RuntimeApi } from "./src/Api/Runtime/RuntimeApi";
export type { MessageSender, OnInstalledReason } from "./src/Api/Runtime/types";

// SidePanel API
export { SidePanelApi } from "./src/Api/SidePanel/SidePanelApi";
export type { PanelBehaviour } from "./src/Api/SidePanel/types";

// Storage API
export { LocalStorageApi } from "./src/Api/Storage/LocalStorageApi";
export type { StorageChange } from "./src/Api/Storage/types";

// TabGroups API
export { TabGroupsApi } from "./src/Api/TabGroups/TabGroupsApi";
export type {
  TabGroup,
  TabGroupColor,
  TabGroupMoveProperties,
  TabGroupsQueryInfo,
  TabGroupsUpdateInfo,
} from "./src/Api/TabGroups/types";

// Tabs API
export { TabsApi } from "./src/Api/Tabs/TabsApi";
export type {
  Tab,
  TabStatus,
  MutedInfo,
  TabMoveProperties,
  TabUpdateProperties,
  TabCreateProperties,
} from "./src/Api/Tabs/types";

// Windows API
export { WindowsApi } from "./src/Api/Windows/WindowsApi";
export type {
  Window,
  WindowType,
  WindowState,
  CreateType,
  WindowQueryOptions,
  WindowCreateInfo,
  WindowUpdateInfo,
} from "./src/Api/Windows/types";
