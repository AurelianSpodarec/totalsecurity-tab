import { AbstractApi } from "../../AbstractApi";
import { Promises } from "../../Utility/Promises";
import type { StorageChange } from "./types";

export class AbstractStorageApi extends AbstractApi {
  protected static storageType: "local" | "session" = "local";

  /**
   * Actions
   */

  /**
   * Getters & Setter
   */

  public static get(...key: Array<string>): Promise<{ [key: string]: any }> {
    return this.isMv2() && this.useChromeApi()
      ? Promises.wrap((callback) => this.getBrowserApi().storage[this.storageType].get(key, callback))
      : this.getBrowserApi().storage[this.storageType].get(key);
  }

  public static set(items: { [key: string]: any }): Promise<void> {
    return this.isMv2() && this.useChromeApi()
      ? Promises.wrap((callback) => this.getBrowserApi().storage[this.storageType].set(items, callback))
      : this.getBrowserApi().storage[this.storageType].set(items);
  }

  /**
   * Events
   */

  public static onChanged(
    callback: (changes: { [key: string]: StorageChange }) => void,
    ...keys: Array<string>
  ): () => void {
    const browserApi = this.getBrowserApi();

    const listener = (changes: { [key: string]: StorageChange }, areaName: string) => {
      if (areaName !== this.storageType) return;

      if (keys.length) {
        let hasRelevantChanges = false;

        const relevantChanges = Object.keys(changes).reduce(
          (relevantChanges, key, index, allKeys) => {
            if (keys.includes(key)) {
              hasRelevantChanges = true;
              relevantChanges[key] = changes[key];
            }

            return relevantChanges;
          },
          {} as { [key: string]: StorageChange }
        );

        if (!hasRelevantChanges) return;

        callback(relevantChanges);
        return;
      }

      callback(changes);
    };

    browserApi.storage.onChanged.addListener(listener);

    return () => {
      browserApi.storage.onChanged.removeListener(listener);
    };
  }
}
