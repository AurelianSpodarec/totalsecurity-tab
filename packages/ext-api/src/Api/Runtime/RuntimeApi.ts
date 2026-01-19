import { AbstractApi } from "../../AbstractApi";
import { Promises } from "../../Utility/Promises";
import type { MessageSender } from "./types";

export class RuntimeApi extends AbstractApi {
  /**
   * Actions
   */

  public static sendMessage(
    channel: string,
    payload?: any,
    extensionId?: string,
    options?: { includeTlsChannelId?: boolean }
  ): Promise<any> {
    const message = {
      channel: channel,
      payload: payload,
    };

    if (this.isMv2() && this.useChromeApi()) {
      if (extensionId) {
        return Promises.wrap((callback) => this.getBrowserApi().runtime.sendMessage(extensionId, message, options, callback));
      }
      return Promises.wrap((callback) => this.getBrowserApi().runtime.sendMessage(message, options, callback));
    }

    if (extensionId) {
      return this.getBrowserApi().runtime.sendMessage(extensionId, message, options);
    }
    return this.getBrowserApi().runtime.sendMessage(message, options);
  }

  /**
   * Getters & Setters
   */

  public static getManifest(): { [key: string]: any } {
    return this.getBrowserApi().runtime.getManifest();
  }

  /**
   * Events
   */

  public static onMessage(
    channel: string,
    callback: (payload: any, sender: MessageSender, channel: string) => any
  ): () => void {
    const browserApi = this.getBrowserApi();

    const listener = (message: any, sender: MessageSender, sendResponse: (response: any) => void) => {
      // Check if the message channel matches or if it's a wildcard
      if (message.channel === channel || channel === "*") {
        const response = callback(message.payload, sender, message.channel);

        // Handle promise responses
        if (response instanceof Promise) {
          response.then(sendResponse);
          return true;
        }

        sendResponse(response);
      }
    };

    browserApi.runtime.onMessage.addListener(listener);

    return () => {
      browserApi.runtime.onMessage.removeListener(listener);
    };
  }

  public static onInstalled(
    callback: (details: {
      id?: string;
      previousVersion?: string;
      reason: "install" | "update" | "browser_update" | "shared_module_update";
    }) => void
  ): () => void {
    const listener = (details: any) => {
      details.reason = details.reason === "chrome_update" ? "browser_update" : details.reason;
      callback(details);
    };

    const browserApi = this.getBrowserApi();
    browserApi.runtime.onInstalled.addListener(listener);

    return () => {
      browserApi.runtime.onInstalled.removeListener(listener);
    };
  }
}
