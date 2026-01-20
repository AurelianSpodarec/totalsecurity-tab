import { Treedux } from "@packages/ext-treedux";
import { TabManagerStore } from "@packages/tab-manager";
import { SettingsStore } from "@packages/settings";

export const Redux = new Treedux("total_tabs", {
  [TabManagerStore.KEY]: TabManagerStore.create(),
  [SettingsStore.KEY]: SettingsStore.create(),
});
