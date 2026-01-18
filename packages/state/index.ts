import { Treedux } from "@packages/ext-treedux";
import { TabManagerStore } from "@packages/tab-manager";

export const Redux = new Treedux("total_tabs", {
  [TabManagerStore.KEY]: TabManagerStore.create(),
});
