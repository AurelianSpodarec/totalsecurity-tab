import { DataStore } from "treeduxjs";
import { Treedux } from "treeduxjs";
import { SyncWindowMutator } from "./Mutator/SyncWindowMutator";
import { AddTabMutator } from "./Mutator/AddTabMutator";
import { UpdateTabMutator } from "./Mutator/UpdateTabMutator";
import { RemoveTabMutator } from "./Mutator/RemoveTabMutator";
import { Session } from "./Type/Session";

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
      windows: {}, // Here to satisfy types
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
