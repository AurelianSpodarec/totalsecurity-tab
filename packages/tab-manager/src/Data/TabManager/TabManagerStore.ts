import { DataStore } from "treeduxjs";
import { Treedux } from "treeduxjs";
import { SyncWindowMutator } from "./Mutator/SyncWindowMutator";
import { Session } from "./Type/Session";

export interface TabManagerStoreInterface
{
  session: Session
}

export class TabManagerStore
{
  public static KEY: "tab_manager" = "tab_manager";
  public static mutators = {
    session: {
      syncWindow: (treedux: Treedux) => new SyncWindowMutator(treedux),
      windows: {} // Here to satisfy types
    }
  }
  
  public static create()
  {
    return DataStore.create<TabManagerStoreInterface, typeof this.mutators>(
      this.KEY,
      {
        initialState: this.getInitialState(),
        mutators: this.mutators
      }
    );
  }
  
  public static getInitialState(): TabManagerStoreInterface
  {
    return {
      session: {
        windows: {}
      }
    };
  }
}
