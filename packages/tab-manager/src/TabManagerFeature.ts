import { Tab, TabGroupsApi, TabsApi, WindowsApi } from "@packages/ext-api";
import { Redux } from "@packages/state";
import { SessionTab, SessionWindow } from "@packages/tab-manager";
import { tryCatch } from "@packages/utility";

export class TabManagerFeature {
  public bootstrap() {
    this.setupEventListeners();
    this.syncAllWindows().catch(console.error);
  }

  private async syncWindow(windowId: number) {
    return tryCatch(async () => {
      const window = await this.createSessionWindow(windowId);
      const redux = await Redux.init();
      redux.state.tab_manager.session.syncWindow(window).dispatch();
    });
  }

  private async createSessionWindow(windowId: number): Promise<SessionWindow> {
    const window = await WindowsApi.get(windowId, { populate: true });
    const tabs = window.tabs || ([] as Array<Tab>);

    const sessionTabs: Array<SessionTab> = await Promise.all(
      tabs.map(async (tab: Tab) => {
        const groupId = tab.groupId ?? -1;
        let groupColor;

        let groupTitle;
        if (groupId !== -1) {
          try {
            const group = await TabGroupsApi.get(groupId);
            groupColor = group.color;
            groupTitle = group.title;
          } catch {
            // Group may have been deleted; leave colour undefined.
          }
        }

        return {
          id: tab.id!,
          url: tab.url || tab.pendingUrl,
          title: tab.title,
          faviconUrl: tab.favIconUrl,
          pinned: tab.pinned,
          index: tab.index,
          active: tab.active,
          groupId,
          groupColor,
          groupTitle,
        };
      })
    );

    return {
      id: windowId,
      tabs: sessionTabs,
    };
  }

  private async syncAllWindows(): Promise<void> {
    const windows = await WindowsApi.getAll({ populate: true });
    await Promise.all(windows.map((w) => this.syncWindow(w.id!)));
  }

  private setupEventListeners() {
    WindowsApi.onCreated((window) => {
      if (!window.id) return;
      return this.syncWindow(window.id);
    });

    WindowsApi.onRemoved(async (windowId) => {
      console.log("Window removed", windowId);
      const redux = await Redux.init();
      redux.state.tab_manager.session.windows.byKey(windowId).delete().dispatch();
    });

    TabsApi.onCreated((tab) => {
      console.log("Tab created", tab);
      return this.syncWindow(tab.windowId);
    });

    TabsApi.onRemoved((tabId, removeInfo) => {
      console.log("Tab removed", tabId);
      return this.syncWindow(removeInfo.windowId);
    });

    TabsApi.onUpdated((tabId, changeInfo, tab) => {
      console.log("Tab updated", tabId, changeInfo);

      const hasRelevantChange =
        !!changeInfo.url ||
        !!changeInfo.favIconUrl ||
        !!changeInfo.title ||
        typeof changeInfo.pinned === "boolean" ||
        // Some Chrome versions report groupId changes with groupId present but null-ish.
        Object.prototype.hasOwnProperty.call(changeInfo, "groupId");

      if (!hasRelevantChange) return;

      return this.syncWindow(tab.windowId);
    });

    TabsApi.onAttached((tabId, attachInfo) => {
      console.log("Tab attached", tabId, attachInfo);
      return this.syncWindow(attachInfo.newWindowId);
    });

    TabsApi.onDetached((tabId, detachInfo) => {
      console.log("Tab detached", tabId, detachInfo);
      return this.syncWindow(detachInfo.oldWindowId);
    });

    TabsApi.onActivated((activeInfo) => {
      console.log(`Tab activated`, activeInfo);
      return this.syncWindow(activeInfo.windowId);
    });

    TabsApi.onMoved((tabId, moveInfo) => {
      console.log(`Tab moved`, moveInfo);
      return this.syncWindow(moveInfo.windowId);
    });

    TabGroupsApi.onCreated((group) => {
      console.log("Tab group created", group);
      return this.syncWindow(group.windowId);
    });

    TabGroupsApi.onRemoved((group) => {
      console.log("Tab group removed", group);
      return this.syncWindow(group.windowId);
    });

    TabGroupsApi.onUpdated((group) => {
      console.log("Tab group updated", group);
      return this.syncWindow(group.windowId);
    });
  }
}

export const TabManager = new TabManagerFeature();
