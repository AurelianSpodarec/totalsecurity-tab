import { AbstractApi } from "../../AbstractApi";
import { StorageChange } from "./StorageChange";
import { Promises } from "../../Utility/Promises";

export class AbstractStorageApi extends AbstractApi
{
  protected static storageType: "local" | "session" = "local";

  /**
   * Actions
   */

  /**
   * Getters & Setter
   */

  // storage.{type}.get
  public static get(...key: Array<string>): Promise<{ [key: string]: any }>
  {
    return this.isMv2() && this.useChromeApi()
      ? Promises.wrap(callback => this.getBrowserApi().storage[this.storageType].get(key, callback))
      : this.getBrowserApi().storage[this.storageType].get(key);
  };

  // storage.{type}.set
  public static set(items: { [key: string]: any }): Promise<void>
  {
    return this.isMv2() && this.useChromeApi()
      ? Promises.wrap(callback => this.getBrowserApi().storage[this.storageType].set(items, callback))
      : this.getBrowserApi().storage[this.storageType].set(items);
  };

  /**
   * Events
   */

  // storage.onChanged
  public static onChanged(callback: (changes: {
    [key: string]: StorageChange
  }) => void, ...keys: Array<string>): () => void
  {
    const browserApi = this.getBrowserApi();

    const listener = (changes: { [key: string]: StorageChange }, areaName: string) => {

      // Only fire callback for relevant storage changes
      if (areaName !== this.storageType) return;

      // If we only care about certain keys
      if (keys.length)
      {
        let hasRelevantChanges = false;

        // Get all relevant changes
        const relevantChanges = Object
          .keys(changes)
          .reduce((relevantChanges, key, index, allKeys) => {

            if (keys.includes(key))
            {
              hasRelevantChanges = true;
              relevantChanges[key] = changes[key];
            }

            return relevantChanges;
          }, {} as { [key: string]: StorageChange });

        if (!hasRelevantChanges) return;

        // Fire callback with relevant changes
        return callback(relevantChanges);
      }

      // Fire callback with all changes
      return callback(changes);
    };

    browserApi.storage.onChanged.addListener(listener);

    return () => {
      browserApi.storage.onChanged.removeListener(listener);
    };
  };
}
