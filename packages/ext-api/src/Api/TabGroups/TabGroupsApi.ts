import { AbstractApi } from "../../AbstractApi";
import { TabGroup } from "./TabGroup";
import { Promises } from "../../Utility/Promises";
import { TabGroupMoveProperties } from "./TabGroupMoveProperties";
import { TabGroupsQueryInfo } from "./TabGroupsQueryInfo";
import { TabGroupsUpdateInfo } from "./TabGroupsUpdateInfo";

export class TabGroupsApi extends AbstractApi {
  public static get(groupId: number): Promise<TabGroup> {
    return this.isMv2() && this.useChromeApi()
      ? Promises.wrap((callback) => this.getBrowserApi().tabGroups.get(groupId, callback))
      : this.getBrowserApi().tabGroups.get(groupId);
  }

  public static update(updateOptions: TabGroupsUpdateInfo): Promise<TabGroup> {
    return this.isMv2() && this.useChromeApi()
      ? Promises.wrap((callback) => this.getBrowserApi().tabGroups.update(updateOptions, callback))
      : this.getBrowserApi().tabGroups.update(updateOptions);
  }

  public static onCreated(callback: (tabGroup: TabGroup) => void): () => void {
    const browserApi = this.getBrowserApi();
    browserApi.tabGroups.onCreated.addListener(callback);

    return () => {
      browserApi.tabGroups.onCreated.removeListener(callback);
    };
  }

  public static onMoved(callback: (tabGroup: TabGroup) => void): () => void {
    const browserApi = this.getBrowserApi();
    browserApi.tabGroups.onMoved.addListener(callback);

    return () => {
      browserApi.tabGroups.onMoved.removeListener(callback);
    };
  }

  public static onRemoved(callback: (tabGroup: TabGroup) => void): () => void {
    const browserApi = this.getBrowserApi();
    browserApi.tabGroups.onRemoved.addListener(callback);

    return () => {
      browserApi.tabGroups.onRemoved.removeListener(callback);
    };
  }

  public static onUpdated(callback: (tabGroup: TabGroup) => void): () => void {
    const browserApi = this.getBrowserApi();
    browserApi.tabGroups.onUpdated.addListener(callback);

    return () => {
      browserApi.tabGroups.onUpdated.removeListener(callback);
    };
  }
}
