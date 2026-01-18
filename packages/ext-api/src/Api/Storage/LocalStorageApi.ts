import { AbstractStorageApi } from "./AbstractStorageApi";

export class LocalStorageApi extends AbstractStorageApi {
  protected static storageType: "local" = "local";
}
