import { RuntimeApi, SidePanelApi } from "@packages/ext-api";
import { Redux } from "@packages/state";
import { TabManager } from "@packages/tab-manager";

// Bootstrap redux store
Redux.bootstrap();

// Bootstrap tab manager feature
TabManager.bootstrap();

// On installed event logic
RuntimeApi.onInstalled(async (details) => {
  if (details.reason !== "install") return;
  return SidePanelApi.setPanelBehaviour({ openPanelOnActionClick: true });
});
