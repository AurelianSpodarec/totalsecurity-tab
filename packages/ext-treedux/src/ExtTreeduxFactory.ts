import { ExtTreedux } from "./ExtTreedux";
import { LocalStorageApi, RuntimeApi } from "@packages/ext-api";
import { Scopes } from "./Utility/Scopes";
import { StorageKeyEnum } from "./Enum/StorageKeyEnum";
import { DefaultDataStoreMap, Action } from "treeduxjs";
import { MessageChannelEnum } from "./Enum/MessageChannelEnum";
import { Context } from "./Utility/Context";
import { StateOverrides } from "./Type/StateOverrides";
import { ContextProxy } from "./Utility/ContextProxy";

export class ExtTreeduxFactory<DataStoreMap extends DefaultDataStoreMap = DefaultDataStoreMap>
{
  private instance: ExtTreedux<DataStoreMap> | null = null;
  private readonly name: string;
  private readonly dataStores: DataStoreMap;
  private initialisingStore: boolean = false;
  private onInitialisedCallbacks: Array<(instance: ExtTreedux<DataStoreMap>) => void> = [];
  private bootstrapComplete: boolean = false;

  public constructor(name: string, dataStores: DataStoreMap)
  {
    this.name = name;
    this.dataStores = dataStores;
  }

  public get(): ExtTreedux<DataStoreMap>
  {
    if (!this.instance) throw new Error(`Cannot get Treedux store "${this.name}". Store has not been initialised.`);
    return this.instance;
  }

  public init(): Promise<ExtTreedux<DataStoreMap>>
  {
    return new Promise((resolve, reject) => {

      if (this.instance) return resolve(this.instance);

      if (this.initialisingStore)
      {
        this.onInitialisedCallbacks.push((instance: ExtTreedux<DataStoreMap>) => resolve(instance));
        return;
      }

      this.initialisingStore = true;

      this
        .initStore()
        .then((instance) => {
          this.onInitialisedCallbacks.forEach((onInitialised) => {
            return onInitialised(instance);
          });

          this.onInitialisedCallbacks = [];
          this.initialisingStore = false;

          return resolve(instance);
        })
        .catch(reject);
    });
  }

  public bootstrap(): void
  {
    if (!Context.isBackground()) throw new Error(`bootstrap() method has been called from a non-background context for Treedux store "${this.name}"`);
    if (this.bootstrapComplete) return;
    this.registerBackgroundMessageListeners();
    this.bootstrapComplete = true;
  }

  private async initStore(): Promise<ExtTreedux<DataStoreMap>>
  {
    if (!this.instance)
    {
      const stateStorageKey = Scopes.getLocalStorageKey(StorageKeyEnum.STATE, this.name);
      const overridesStorageKey = Scopes.getLocalStorageKey(StorageKeyEnum.OVERRIDES, this.name);
      const { [stateStorageKey]: state, [overridesStorageKey]: overrides } = await LocalStorageApi.get(stateStorageKey, overridesStorageKey);
      this.instance = ExtTreedux.init(
        this.name,
        this.dataStores,
        { initialState: state, overrides }
      );
    }


    return this.instance;
  }

  private registerBackgroundMessageListeners(): void
  {
    RuntimeApi.onMessage(
      Scopes.getMessageChannel(MessageChannelEnum.DISPATCH, this.name),
      async ({ actions }: { actions: Array<Action<any>> }) => {
        return ContextProxy.withErrorProxy(async () => {
          const instance = await this.init();
          return instance.dispatch(...actions.map(action => Action.create(action, instance)));
        })
      }
    );

    RuntimeApi.onMessage(
      Scopes.getMessageChannel(MessageChannelEnum.SET_OVERRIDES, this.name),
      ({ overrides }: { overrides: StateOverrides<DataStoreMap> }) => {
        return ContextProxy.withErrorProxy(async () => {
          const instance = await this.init();
          return instance.setOverrides(overrides);
        });
      }
    );
  }
}
