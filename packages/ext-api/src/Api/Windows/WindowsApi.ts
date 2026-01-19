import { AbstractApi } from "../../AbstractApi";
import { Promises } from "../../Utility/Promises";
import type {
  Window,
  WindowQueryOptions,
  WindowCreateInfo,
  WindowUpdateInfo,
} from "./types";

export class WindowsApi extends AbstractApi {
  public static create(createInfo: WindowCreateInfo): Promise<Window> {
    return this.isMv2() && this.useChromeApi()
      ? Promises.wrap((callback) => this.getBrowserApi().windows.create(createInfo, callback))
      : this.getBrowserApi().windows.create(createInfo) as Promise<Window>;
  }

  public static update(windowId: number, updateInfo: WindowUpdateInfo): Promise<Window> {
    return this.isMv2() && this.useChromeApi()
      ? Promises.wrap((callback) => this.getBrowserApi().windows.update(windowId, updateInfo, callback))
      : this.getBrowserApi().windows.update(windowId, updateInfo);
  }

  public static getCurrent(options?: WindowQueryOptions): Promise<Window> {
    return this.isMv2() && this.useChromeApi()
      ? Promises.wrap((callback) => this.getBrowserApi().windows.getCurrent(options, callback))
      : this.getBrowserApi().windows.getCurrent(options);
  }

  public static getAll(options?: WindowQueryOptions): Promise<Array<Window>> {
    return this.isMv2() && this.useChromeApi()
      ? Promises.wrap((callback) => this.getBrowserApi().windows.getAll(options, callback))
      : this.getBrowserApi().windows.getAll(options);
  }

  public static get(windowId: number, options?: WindowQueryOptions): Promise<Window> {
    return this.isMv2() && this.useChromeApi()
      ? Promises.wrap((callback) => this.getBrowserApi().windows.get(windowId, options, callback))
      : this.getBrowserApi().windows.get(windowId, options);
  }

  public static onCreated(callback: (window: Window) => void): () => void {
    const browserApi = this.getBrowserApi();
    (browserApi.windows.onCreated as any).addListener(callback);

    return () => {
      (browserApi.windows.onCreated as any).removeListener(callback);
    };
  }

  public static onRemoved(callback: (windowId: number) => void): () => void {
    const browserApi = this.getBrowserApi();
    (browserApi.windows.onRemoved as any).addListener(callback);

    return () => {
      (browserApi.windows.onRemoved as any).removeListener(callback);
    };
  }

  public static onFocusChanged(callback: (windowId: number) => void): void {
    (this.getBrowserApi().windows.onFocusChanged as any).addListener(callback);
  }

  public static offFocusChanged(callback: (windowId: number) => void): void {
    (this.getBrowserApi().windows.onFocusChanged as any).removeListener(callback);
  }
}
