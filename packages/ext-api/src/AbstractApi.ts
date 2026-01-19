declare const browser: typeof chrome | undefined;

export class AbstractApi {
  protected static getBrowserApi(): typeof chrome {
    if (typeof browser !== "undefined") {
      return browser as typeof chrome;
    }

    return chrome;
  }

  protected static useChromeApi(): boolean {
    return this.isChromium();
  }

  protected static isChromium(): boolean {
    return !this.isFirefox();
  }

  protected static isFirefox(): boolean {
    return /Firefox/.test(navigator.userAgent);
  }

  protected static isMv2(): boolean {
    return this.getBrowserApi().runtime.getManifest().manifest_version === 2;
  }
}
