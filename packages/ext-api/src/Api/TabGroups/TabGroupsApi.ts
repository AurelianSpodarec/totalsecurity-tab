import { AbstractApi } from "../../AbstractApi";
import { Promises } from "../../Utility/Promises";
import type {
  TabGroup,
  TabGroupsUpdateInfo,
} from "./types";

export class TabGroupsApi extends AbstractApi {
  /**
 * Runtime feature check for the Tab Groups API.
 * Not supported in all browsers (e.g. Firefox).
 */
  public static isSupported(): boolean {
    return !!this.getBrowserApi().tabGroups;
  }

  public static get(groupId: number): Promise<TabGroup> {
    if (!this.isSupported()) return Promise.reject(new Error("tabGroups API not supported"));

    return this.isMv2() && this.useChromeApi()
      ? Promises.wrap((callback) => this.getBrowserApi().tabGroups.get(groupId, callback))
      : this.getBrowserApi().tabGroups.get(groupId);
  }

  public static update(groupId: number, updateProperties: TabGroupsUpdateInfo): Promise<TabGroup> {
    if (!this.isSupported()) return Promise.reject(new Error("tabGroups API not supported"));

    return this.isMv2() && this.useChromeApi()
      ? Promises.wrap((callback) => this.getBrowserApi().tabGroups.update(groupId, updateProperties, callback))
      : this.getBrowserApi().tabGroups.update(groupId, updateProperties) as Promise<TabGroup>;
  }

  public static onCreated(callback: (tabGroup: TabGroup) => void): () => void {
    if (!this.isSupported()) return () => { };

    const browserApi = this.getBrowserApi();
    browserApi.tabGroups.onCreated.addListener(callback);

    return () => {
      browserApi.tabGroups.onCreated.removeListener(callback);
    };
  }

  public static onMoved(callback: (tabGroup: TabGroup) => void): () => void {
    if (!this.isSupported()) return () => { };

    const browserApi = this.getBrowserApi();
    browserApi.tabGroups.onMoved.addListener(callback);

    return () => {
      browserApi.tabGroups.onMoved.removeListener(callback);
    };
  }

  public static onRemoved(callback: (tabGroup: TabGroup) => void): () => void {
    if (!this.isSupported()) return () => { };

    const browserApi = this.getBrowserApi();
    browserApi.tabGroups.onRemoved.addListener(callback);

    return () => {
      browserApi.tabGroups.onRemoved.removeListener(callback);
    };
  }

  public static onUpdated(callback: (tabGroup: TabGroup) => void): () => void {
    if (!this.isSupported()) return () => { };

    const browserApi = this.getBrowserApi();
    browserApi.tabGroups.onUpdated.addListener(callback);

    return () => {
      browserApi.tabGroups.onUpdated.removeListener(callback);
    };
  }
}
