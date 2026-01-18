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
