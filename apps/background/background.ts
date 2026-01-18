import { RuntimeApi, SidePanelApi } from "@packages/ext-api";
import { Redux } from "@packages/state";
import { TabManager } from "@packages/tab-manager";

Redux.bootstrap();
TabManager.bootstrap();
RuntimeApi.onInstalled(async (details) => {
  if (details.reason !== "install") return;
  return SidePanelApi.setPanelBehaviour({ openPanelOnActionClick: true });
});
