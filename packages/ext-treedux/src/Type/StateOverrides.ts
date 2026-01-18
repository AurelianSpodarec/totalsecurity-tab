import { DefaultDataStoreMap } from "treeduxjs";
import { RecursivePartial } from "./RecursivePartial";

export type StateOverrides<DataStoreMap extends DefaultDataStoreMap> = {
  [K in keyof DataStoreMap]?: {
    [P in keyof ReturnType<DataStoreMap[K]["state"]["get"]>]?: ReturnType<
      DataStoreMap[K]["state"]["get"]
    >[P] extends Record<any, any>
      ? RecursivePartial<ReturnType<DataStoreMap[K]["state"]["get"]>[P]>
      : ReturnType<DataStoreMap[K]["state"]["get"]>[P];
  };
};
