/**
 * Firefox exposes the extension APIs under the `browser` global instead of `chrome`.
 * This declaration allows safe runtime detection and a unified API surface.
 */
declare const browser: typeof chrome | undefined;

export class Promises {
  public static wrap<T>(fn: (callback: (value?: T) => void) => void): Promise<T> {
    return new Promise((resolve: (value: T) => void, reject: (reason?: any) => void) => {
      fn((value?: T) => {
        const runtimeObject = typeof browser !== "undefined" ? browser : chrome;
        const error = (runtimeObject.runtime as any).lastError;
        if (error) {
          reject(error);
        } else {
          resolve(value as T);
        }
      });
    });
  }
}
