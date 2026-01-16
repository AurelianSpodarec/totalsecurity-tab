declare const chrome: any;
declare const browser: any;

export class AbstractApi
{
  protected static getBrowserApi(): any
  {
    if (typeof browser !== "undefined")
    {
      return browser;
    }
    
    return chrome;
  }
  
  protected static useChromeApi(): boolean
  {
    return this.isChromium();
  }
  
  protected static isChromium(): boolean
  {
    return !this.isFirefox();
  }
  
  protected static isFirefox(): boolean
  {
    return /Firefox/.test(navigator.userAgent);
  }
  
  protected static isMv2(): boolean
  {
    return this.getBrowserApi().runtime.getManifest().manifest_version === 2;
  }
}
