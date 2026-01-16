export type RecursivePartial<T extends Record<any, any>> = {
  [K in keyof T]?: T[K] extends Record<any, any> ? RecursivePartial<T[K]> : T[K];
}
