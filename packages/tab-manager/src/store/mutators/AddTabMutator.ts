import { AbstractMutator, Action } from "treeduxjs";
import { TabManagerStore, TabManagerStoreInterface } from "../TabManagerStore";
import type { SessionTab } from "../../types/SessionTab";

type AddTabPayload = {
  windowId: number;
  tab: SessionTab;
};

export class AddTabMutator extends AbstractMutator<TabManagerStoreInterface> {
  public getType(): string {
    return `${TabManagerStore.KEY}/add_tab`;
  }

  public getAction(windowId: number, tab: SessionTab): Action<AddTabPayload> {
    return Action.create(
      {
        type: this.getType(),
        payload: { windowId, tab },
      },
      this.treedux
    );
  }

  public reduce(
    state: TabManagerStoreInterface,
    action: Action<AddTabPayload>
  ): void {
    const { windowId, tab } = action.payload;

    if (!state.session.windows[windowId]) {
      state.session.windows[windowId] = { id: windowId, tabs: [] };
    }

    const window = state.session.windows[windowId];
    const insertIndex = tab.index;

    window.tabs.splice(insertIndex, 0, tab);

    for (let i = insertIndex + 1; i < window.tabs.length; i++) {
      window.tabs[i].index = i;
    }
  }
}
