import { AbstractApi } from "../../AbstractApi";
import { Tab } from "./Tab";
import { Promises } from "../../Utility/Promises";
import { TabChangeInfo } from "./TabChangeInfo";
import { TabRemoveInfo } from "./TabRemoveInfo";
import { TabDetachInfo } from "./TabDetachInfo";
import { TabActiveInfo } from "./TabActiveInfo";
import { TabAttachInfo } from "./TabAttachInfo";
import { TabMoveInfo } from "./TabMoveInfo";
import { TabMoveProperties } from "./TabMoveProperties";

export class TabsApi extends AbstractApi {
  /**
   * Actions
   */

  public static create(createProperties: { url?: string; active?: boolean; index?: number }): Promise<Tab> {
    return this.isMv2() && this.useChromeApi()
      ? Promises.wrap((callback) => this.getBrowserApi().tabs.create(createProperties, callback))
      : this.getBrowserApi().tabs.create(createProperties);
  }

  public static remove(...tabId: Array<number>): Promise<void> {
    return this.isMv2() && this.useChromeApi()
      ? Promises.wrap((callback) => this.getBrowserApi().tabs.remove(tabId, callback))
      : this.getBrowserApi().tabs.remove(tabId);
  }

  public static move(tabIds: number | Array<number>, moveProperties: TabMoveProperties): Promise<Tab | Array<Tab>> {
    return this.isMv2() && this.useChromeApi()
      ? Promises.wrap((callback) => this.getBrowserApi().tabs.move(tabIds, moveProperties, callback))
      : this.getBrowserApi().tabs.move(tabIds, moveProperties);
  }

  /**
   * Adds tab(s) to an existing group (groupId) or creates a new group (groupId omitted).
   * Not supported in all browsers.
   */
  public static group(tabIds: number | Array<number>, groupId?: number): Promise<number> {
    const browserApi = this.getBrowserApi();
    if (!browserApi.tabs?.group) return Promise.reject(new Error("tabs.group API not supported"));

    const groupOptions: { tabIds: Array<number>; groupId?: number } = {
      tabIds: Array.isArray(tabIds) ? tabIds : [tabIds],
    };

    if (typeof groupId === "number" && groupId !== -1) {
      groupOptions.groupId = groupId;
    }

    return this.isMv2() && this.useChromeApi()
      ? Promises.wrap((callback) => browserApi.tabs.group(groupOptions, callback))
      : browserApi.tabs.group(groupOptions);
  }

  /**
   * Removes tab(s) from their current group.
   * Not supported in all browsers.
   */
  public static ungroup(tabIds: number | Array<number>): Promise<void> {
    const browserApi = this.getBrowserApi();
    if (!browserApi.tabs?.ungroup) return Promise.reject(new Error("tabs.ungroup API not supported"));

    const tabIdList = Array.isArray(tabIds) ? tabIds : [tabIds];

    return this.isMv2() && this.useChromeApi()
      ? Promises.wrap((callback) => browserApi.tabs.ungroup(tabIdList, callback))
      : browserApi.tabs.ungroup(tabIdList);
  }

  public static update(
    tabId: number,
    updateProperties: {
      active?: boolean;
      autoDiscardable?: boolean;
      highlighted?: boolean;
      muted?: boolean;
      openerTabId?: boolean;
      pinned?: boolean;
      url?: string;
    }
  ): Promise<Tab> {
    return this.isMv2() && this.useChromeApi()
      ? Promises.wrap((callback) => this.getBrowserApi().tabs.update(tabId, updateProperties, callback))
      : this.getBrowserApi().tabs.update(tabId, updateProperties);
  }

  /**
   * Getters & Setters
   */

  public static get(tabId: number): Promise<Tab> {
    return this.isMv2() && this.useChromeApi()
      ? Promises.wrap((callback) => this.getBrowserApi().tabs.get(tabId, callback))
      : this.getBrowserApi().tabs.get(tabId);
  }

  /**
   * Events
   */

  public static onActivated(callback: (activeInfo: TabActiveInfo) => void): () => void {
    const browserApi = this.getBrowserApi();
    browserApi.tabs.onActivated.addListener(callback);

    return () => {
      browserApi.tabs.onActivated.removeListener(callback);
    };
  }

  public static onAttached(callback: (tabId: number, attachInfo: TabAttachInfo) => void): () => void {
    const browserApi = this.getBrowserApi();
    browserApi.tabs.onAttached.addListener(callback);

    return () => {
      browserApi.tabs.onAttached.removeListener(callback);
    };
  }

  public static onDetached(callback: (tabId: number, detachInfo: TabDetachInfo) => void): () => void {
    const browserApi = this.getBrowserApi();
    browserApi.tabs.onDetached.addListener(callback);

    return () => {
      browserApi.tabs.onDetached.removeListener(callback);
    };
  }

  public static onRemoved(callback: (tabId: number, removeInfo: TabRemoveInfo) => void): () => void {
    const browserApi = this.getBrowserApi();
    browserApi.tabs.onRemoved.addListener(callback);

    return () => {
      browserApi.tabs.onRemoved.removeListener(callback);
    };
  }

  public static onCreated(callback: (tab: Tab) => void): () => void {
    const browserApi = this.getBrowserApi();
    browserApi.tabs.onCreated.addListener(callback);

    return () => {
      browserApi.tabs.onCreated.removeListener(callback);
    };
  }

  public static onUpdated(callback: (tabId: number, changeInfo: TabChangeInfo, tab: Tab) => void): () => void {
    const browserApi = this.getBrowserApi();
    browserApi.tabs.onUpdated.addListener(callback);

    return () => {
      browserApi.tabs.onUpdated.removeListener(callback);
    };
  }

  public static onMoved(callback: (tabId: number, moveInfo: TabMoveInfo) => void): () => void {
    const browserApi = this.getBrowserApi();
    browserApi.tabs.onMoved.addListener(callback);

    return () => {
      browserApi.tabs.onMoved.removeListener(callback);
    };
  }
}
