import { AbstractApi } from "../../AbstractApi";
import { Promises } from "../../Utility/Promises";
import type {
  Tab,
  TabStatus,
  TabMoveProperties,
  TabUpdateProperties,
  TabCreateProperties,
} from "./types";

export class TabsApi extends AbstractApi {
  /**
   * Actions
   */

  public static create(createProperties: TabCreateProperties): Promise<Tab> {
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

    const tabIdList: number[] = Array.isArray(tabIds) ? tabIds : [tabIds];
    // Chrome types expect tuple type: number | [number, ...number[]]
    const tabIdsParam = tabIdList.length === 1 ? tabIdList[0] : (tabIdList as [number, ...number[]]);

    const groupOptions: { tabIds: number | [number, ...number[]]; groupId?: number } = {
      tabIds: tabIdsParam,
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

    const tabIdList: number[] = Array.isArray(tabIds) ? tabIds : [tabIds];
    // Chrome types expect tuple type: number | [number, ...number[]]
    const tabIdsParam = tabIdList.length === 1 ? tabIdList[0] : (tabIdList as [number, ...number[]]);

    return this.isMv2() && this.useChromeApi()
      ? Promises.wrap((callback) => browserApi.tabs.ungroup(tabIdsParam, callback))
      : browserApi.tabs.ungroup(tabIdsParam);
  }

  public static update(tabId: number, updateProperties: TabUpdateProperties): Promise<Tab> {
    return this.isMv2() && this.useChromeApi()
      ? Promises.wrap((callback) => this.getBrowserApi().tabs.update(tabId, updateProperties, callback))
      : this.getBrowserApi().tabs.update(tabId, updateProperties) as Promise<Tab>;
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

  public static onActivated(callback: (activeInfo: { tabId: number; windowId: number }) => void): () => void {
    const browserApi = this.getBrowserApi();
    browserApi.tabs.onActivated.addListener(callback as any);

    return () => {
      browserApi.tabs.onActivated.removeListener(callback as any);
    };
  }

  public static onAttached(callback: (tabId: number, attachInfo: { newWindowId: number; newPosition: number }) => void): () => void {
    const browserApi = this.getBrowserApi();
    browserApi.tabs.onAttached.addListener(callback as any);

    return () => {
      browserApi.tabs.onAttached.removeListener(callback as any);
    };
  }

  public static onDetached(callback: (tabId: number, detachInfo: { oldWindowId: number; oldPosition: number }) => void): () => void {
    const browserApi = this.getBrowserApi();
    browserApi.tabs.onDetached.addListener(callback as any);

    return () => {
      browserApi.tabs.onDetached.removeListener(callback as any);
    };
  }

  public static onRemoved(callback: (tabId: number, removeInfo: { windowId: number; isWindowClosing: boolean }) => void): () => void {
    const browserApi = this.getBrowserApi();
    browserApi.tabs.onRemoved.addListener(callback as any);

    return () => {
      browserApi.tabs.onRemoved.removeListener(callback as any);
    };
  }

  public static onCreated(callback: (tab: Tab) => void): () => void {
    const browserApi = this.getBrowserApi();
    browserApi.tabs.onCreated.addListener(callback as any);

    return () => {
      browserApi.tabs.onCreated.removeListener(callback as any);
    };
  }

  public static onUpdated(callback: (tabId: number, changeInfo: { status?: TabStatus; url?: string; groupId?: number; [key: string]: any }, tab: Tab) => void): () => void {
    const browserApi = this.getBrowserApi();
    browserApi.tabs.onUpdated.addListener(callback as any);

    return () => {
      browserApi.tabs.onUpdated.removeListener(callback as any);
    };
  }

  public static onMoved(callback: (tabId: number, moveInfo: { windowId: number; fromIndex: number; toIndex: number }) => void): () => void {
    const browserApi = this.getBrowserApi();
    browserApi.tabs.onMoved.addListener(callback as any);

    return () => {
      browserApi.tabs.onMoved.removeListener(callback as any);
    };
  }
}
