import { RuntimeApi } from "@packages/ext-api";

export class Context {
  public static isBackground(): boolean {
    if (this.isMv2()) {
      return window.location.pathname.endsWith(
        RuntimeApi.getManifest().background?.page || "/_generated_background_page.html"
      );
    }

    // If document not available, you're in a service worker
    return typeof document === "undefined";
  }

  public static isMv2(): boolean {
    return RuntimeApi.getManifest().manifest_version === 2;
  }
}
