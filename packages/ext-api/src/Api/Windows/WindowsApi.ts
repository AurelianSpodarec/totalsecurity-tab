import { AbstractApi } from "../../AbstractApi";
import { Window } from "./Window";
import { Promises } from "../../Utility/Promises";
import { WindowQueryOptions } from "./WindowQueryOptions";
import { WindowCreateInfo } from "./WindowCreateInfo";
import { WindowUpdateInfo } from "./WindowUpdateInfo";

export class WindowsApi extends AbstractApi
{
  // windows.create
  public static create(createInfo: WindowCreateInfo): Promise<Window>
  {
    return this.isMv2() && this.useChromeApi()
      ? Promises.wrap(callback => this.getBrowserApi().windows.create(createInfo, callback))
      : this.getBrowserApi().windows.create(createInfo);
  }
  
  // windows.update
  public static update(windowId: number, updateInfo: WindowUpdateInfo): Promise<Window>
  {
    return this.isMv2() && this.useChromeApi()
      ? Promises.wrap(callback => this.getBrowserApi().windows.update(windowId, updateInfo, callback))
      : this.getBrowserApi().windows.update(windowId, updateInfo);
  }
  
  public static getCurrent(options?: WindowQueryOptions): Promise<Window>
  {
    return this.isMv2() && this.useChromeApi()
      ? Promises.wrap(callback => this.getBrowserApi().windows.getCurrent(options, callback))
      : this.getBrowserApi().windows.getCurrent(options);
  }
  
  public static getAll(options?: WindowQueryOptions): Promise<Array<Window>>
  {
    return this.isMv2() && this.useChromeApi()
      ? Promises.wrap(callback => this.getBrowserApi().windows.getAll(options, callback))
      : this.getBrowserApi().windows.getAll(options);
  }
  
  public static get(windowId: number, options?: WindowQueryOptions): Promise<Window>
  {
    return this.isMv2() && this.useChromeApi()
      ? Promises.wrap(callback => this.getBrowserApi().windows.get(windowId, options, callback))
      : this.getBrowserApi().windows.get(windowId, options);
  }
  
  public static onCreated(callback: (window: Window) => void): () => void
  {
    const browserApi = this.getBrowserApi();
    browserApi.windows.onCreated.addListener(callback);
    
    return () => {
      browserApi.windows.onCreated.removeListener(callback);
    };
  };
  
  public static onRemoved(callback: (windowId: number) => void): () => void
  {
    const browserApi = this.getBrowserApi();
    browserApi.windows.onRemoved.addListener(callback);
    
    return () => {
      browserApi.windows.onRemoved.removeListener(callback);
    };
  };
  
}
