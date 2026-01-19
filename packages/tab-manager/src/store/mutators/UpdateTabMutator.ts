import { AbstractMutator, Action } from "treeduxjs";
import { TabManagerStore, TabManagerStoreInterface } from "../TabManagerStore";
import type { SessionTab } from "../../types/SessionTab";

type UpdateTabPayload = {
  windowId: number;
  tabId: number;
  updates: Partial<Omit<SessionTab, "id">>;
};

export class UpdateTabMutator extends AbstractMutator<TabManagerStoreInterface> {
  public getType(): string {
    return `${TabManagerStore.KEY}/update_tab`;
  }

  public getAction(
    windowId: number,
    tabId: number,
    updates: Partial<Omit<SessionTab, "id">>
  ): Action<UpdateTabPayload> {
    return Action.create(
      {
        type: this.getType(),
        payload: { windowId, tabId, updates },
      },
      this.treedux
    );
  }

  public reduce(
    state: TabManagerStoreInterface,
    action: Action<UpdateTabPayload>
  ): void {
    const { windowId, tabId, updates } = action.payload;
    const window = state.session.windows[windowId];
    if (!window) return;

    const tabIndex = window.tabs.findIndex((t) => t.id === tabId);
    if (tabIndex === -1) return;

    window.tabs[tabIndex] = { ...window.tabs[tabIndex], ...updates };
  }
}
