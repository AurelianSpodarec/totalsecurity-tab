import { DataStore, Treedux } from "treeduxjs";
import { SetThemeMutator } from "./mutators/SetThemeMutator";
import type { ThemeId } from "../themes";

export interface SettingsStoreInterface {
  theme: ThemeId;
}

export class SettingsStore {
  public static KEY = "settings" as const;

  public static mutators = {
    theme: {
      set: (treedux: Treedux) => new SetThemeMutator(treedux),
    },
  };

  public static create() {
    return DataStore.create<SettingsStoreInterface, typeof this.mutators>(this.KEY, {
      initialState: this.getInitialState(),
      mutators: this.mutators,
    });
  }

  public static getInitialState(): SettingsStoreInterface {
    return {
      theme: "total-security",
    };
  }
}
