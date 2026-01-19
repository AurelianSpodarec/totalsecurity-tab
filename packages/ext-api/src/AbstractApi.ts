declare const browser: typeof chrome | undefined;

export class AbstractApi {
  private static injectedBrowserApi: typeof chrome | null = null;

  /**
   * Inject a mock browser API for testing purposes.
   * Call with null to reset to the real browser API.
   */
  public static setBrowserApi(api: typeof chrome | null): void {
    this.injectedBrowserApi = api;
  }

  protected static getBrowserApi(): typeof chrome {
    if (this.injectedBrowserApi) {
      return this.injectedBrowserApi;
    }

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
