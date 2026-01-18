export class Scopes {
  private static GLOBAL_SCOPE: string = "treedux";

  public static getLocalStorageKey(key: string, scope: string): string {
    return `${this.GLOBAL_SCOPE}:${scope}:${key}`;
  }

  public static getMessageChannel(channel: string, scope: string): string {
    return `${this.GLOBAL_SCOPE}:${scope}:${channel}`;
  }
}
