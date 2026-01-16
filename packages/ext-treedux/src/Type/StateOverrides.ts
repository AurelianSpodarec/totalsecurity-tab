import { DefaultDataStoreMap } from "treeduxjs";
import { RecursivePartial } from "./RecursivePartial";

export type StateOverrides<DataStoreMap extends DefaultDataStoreMap> = {
  // Data store keys (optional)
  [K in keyof DataStoreMap]?: {
    // Data store state keys (optional)
    [P in keyof ReturnType<DataStoreMap[K]["state"]["get"]>]?: ReturnType<DataStoreMap[K]["state"]["get"]>[P] extends Record<any, any>
      // If the state property is a record, make it recursive
      ? RecursivePartial<ReturnType<DataStoreMap[K]["state"]["get"]>[P]>
      // Otherwise, just use the type of the state property
      : ReturnType<DataStoreMap[K]["state"]["get"]>[P]
  }
}
