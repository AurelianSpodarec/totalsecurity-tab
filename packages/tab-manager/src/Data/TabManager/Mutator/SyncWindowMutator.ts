import { AbstractMutator, Action } from "treeduxjs";
import { TabManagerStore, TabManagerStoreInterface } from "../TabManagerStore";
import { SessionWindow } from "../Type/SessionWindow";

export class SyncWindowMutator extends AbstractMutator<TabManagerStoreInterface> {
  public getType(): string {
    return `${TabManagerStore.KEY}/sync_window`;
  }

  public getAction(window: SessionWindow): Action<{ window: SessionWindow }> {
    return Action.create(
      {
        type: this.getType(),
        payload: { window },
      },
      this.treedux
    );
  }

  public reduce(state: TabManagerStoreInterface, action: Action<{ window: SessionWindow }>): void {
    const { window } = action.payload;
    if (window.tabs.length > 0) {
      state.session.windows[window.id] = window;
    } else {
      delete state.session.windows[window.id];
    }
  }
}
