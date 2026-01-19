import { DataStore, Treedux } from "treeduxjs";
import { SyncWindowMutator } from "./mutators/SyncWindowMutator";
import { AddTabMutator } from "./mutators/AddTabMutator";
import { UpdateTabMutator } from "./mutators/UpdateTabMutator";
import { RemoveTabMutator } from "./mutators/RemoveTabMutator";
import type { Session } from "../types/Session";

export interface TabManagerStoreInterface {
  session: Session;
}

export class TabManagerStore {
  public static KEY: "tab_manager" = "tab_manager";
  public static mutators = {
    session: {
      syncWindow: (treedux: Treedux) => new SyncWindowMutator(treedux),
      addTab: (treedux: Treedux) => new AddTabMutator(treedux),
      updateTab: (treedux: Treedux) => new UpdateTabMutator(treedux),
      removeTab: (treedux: Treedux) => new RemoveTabMutator(treedux),
      windows: {},
    },
  };

  public static create() {
    return DataStore.create<TabManagerStoreInterface, typeof this.mutators>(this.KEY, {
      initialState: this.getInitialState(),
      mutators: this.mutators,
    });
  }

  public static getInitialState(): TabManagerStoreInterface {
    return {
      session: {
        windows: {},
      },
    };
  }
}
