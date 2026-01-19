import { AbstractMutator, Action } from "treeduxjs";
import { TabManagerStore, TabManagerStoreInterface } from "../TabManagerStore";

type RemoveTabPayload = {
  windowId: number;
  tabId: number;
};

export class RemoveTabMutator extends AbstractMutator<TabManagerStoreInterface> {
  public getType(): string {
    return `${TabManagerStore.KEY}/remove_tab`;
  }

  public getAction(windowId: number, tabId: number): Action<RemoveTabPayload> {
    return Action.create(
      {
        type: this.getType(),
        payload: { windowId, tabId },
      },
      this.treedux
    );
  }

  public reduce(
    state: TabManagerStoreInterface,
    action: Action<RemoveTabPayload>
  ): void {
    const { windowId, tabId } = action.payload;
    const window = state.session.windows[windowId];
    if (!window) return;

    const tabIndex = window.tabs.findIndex((t) => t.id === tabId);
    if (tabIndex === -1) return;

    window.tabs.splice(tabIndex, 1);

    for (let i = tabIndex; i < window.tabs.length; i++) {
      window.tabs[i].index = i;
    }

    if (window.tabs.length === 0) {
      delete state.session.windows[windowId];
    }
  }
}
