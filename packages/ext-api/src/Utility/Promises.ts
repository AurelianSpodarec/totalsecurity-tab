declare const browser: any;
declare const chrome: any;

export class Promises
{
  public static wrap(fn: (callback: (value: any ) => any) => any): Promise<any | void>
  {
    return new Promise((resolve: (value: any) => any, reject: (reason?: any) => any) => {
      return fn(
        (value: any) => {
          const runtimeObject = typeof browser !== "undefined" ? browser : chrome;
          const error = runtimeObject?.runtime?.lastError;
          return error ? reject(error) : resolve(value);
        }
      );
    });
  };
}
