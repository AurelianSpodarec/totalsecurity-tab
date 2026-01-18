import { DefaultActionEnum, Treedux } from "treeduxjs";
import { Action } from "treeduxjs";
import { DefaultDataStoreMap } from "treeduxjs";
import { LocalStorageApi, RuntimeApi } from "@packages/ext-api";
import { MessageChannelEnum } from "./Enum/MessageChannelEnum";
import { Scopes } from "./Utility/Scopes";
import { StorageKeyEnum } from "./Enum/StorageKeyEnum";
import { Context } from "./Utility/Context";
import { StateOverrides } from "./Type/StateOverrides";
import { Objects } from "./Utility/Objects";
import { ContextProxy } from "./Utility/ContextProxy";

export class ExtTreedux<DataStoreMap extends DefaultDataStoreMap = DefaultDataStoreMap> extends Treedux<DataStoreMap> {
  private readonly name: string;
  private overrides: StateOverrides<DataStoreMap> | null = null;

  protected constructor(
    name: string,
    dataStores: DataStoreMap,
    options?: {
      initialState?: any;
      overrides?: StateOverrides<DataStoreMap>;
    }
  ) {
    super(dataStores, options);
    this.name = name;
    this.overrides = options?.overrides || null;

    if (Context.isBackground()) {
      this.persistStateToLocalStorageOnChange();
    } else {
      this.hydrateStateFromLocalStorageOnChange();
      this.hydrateOverridesFromLocalStorageOnChange();
    }
  }

  public static init<DataStoreMap extends DefaultDataStoreMap>(
    dataStores: DataStoreMap,
    options?: { initialState?: any }
  ): ExtTreedux<DataStoreMap>;
  public static init<DataStoreMap extends DefaultDataStoreMap>(
    name: string,
    dataStores: DataStoreMap,
    options?: { initialState?: any; overrides?: StateOverrides<DataStoreMap> | null }
  ): ExtTreedux<DataStoreMap>;
  public static init<DataStoreMap extends DefaultDataStoreMap>(...args: Array<any>): ExtTreedux<DataStoreMap> {
    const [name, dataStores, options] = args;

    if (typeof name !== "string") {
      throw new Error(`ExtTreedux.init() must be called with a unique name as the first argument.`);
    }

    return new ExtTreedux(name, dataStores, options);
  }

  public getState(): any {
    if (!this.overrides) return super.getState();
    return Objects.merge(super.getState(), this.overrides);
  }

  public async setOverrides(overrides: StateOverrides<DataStoreMap> | null): Promise<void> {
    if (!Context.isBackground()) {
      return ContextProxy.throwOrReturn(
        await RuntimeApi.sendMessage(Scopes.getMessageChannel(MessageChannelEnum.SET_OVERRIDES, this.name), {
          overrides,
        })
      );
    }

    this.overrides = overrides;
    this.notifySubscribers();
    LocalStorageApi.set({ [this.getStateOverridesLocalStorageKey()]: overrides });
  }

  public async dispatch(...actions: Array<Action<any>>): Promise<void> {
    if (!Context.isBackground()) {
      return ContextProxy.throwOrReturn(
        await RuntimeApi.sendMessage(Scopes.getMessageChannel(MessageChannelEnum.DISPATCH, this.name), {
          actions: actions.map((action) => action.serialize()),
        })
      );
    }

    return super.dispatch(...actions);
  }

  private hydrateStateFromLocalStorageOnChange(): void {
    const localStorageKey = this.getStateLocalStorageKey();
    LocalStorageApi.onChanged(async (changes) => {
      const state =
        typeof changes[localStorageKey].newValue === "object" && changes[localStorageKey].newValue !== null
          ? changes[localStorageKey].newValue
          : Object.fromEntries(Object.keys(super.getState()).map((key) => [key, null]));
      const actions = Object.entries(state).map(([key, value]) => {
        return Action.create(
          {
            type: DefaultActionEnum.SET_BY_KEY_PATH,
            payload: { keyPath: [key], value: value },
          },
          this
        );
      });
      super.dispatch(...actions);
    }, localStorageKey);
  }

  private hydrateOverridesFromLocalStorageOnChange(): void {
    const localStorageKey = this.getStateOverridesLocalStorageKey();
    LocalStorageApi.onChanged(async (changes) => {
      this.overrides = changes[localStorageKey].newValue || null;
      this.notifySubscribers();
    }, localStorageKey);
  }

  private persistStateToLocalStorageOnChange(): void {
    super.subscribe(() => LocalStorageApi.set({ [this.getStateLocalStorageKey()]: super.getState() }));
  }

  private getStateLocalStorageKey(): string {
    return Scopes.getLocalStorageKey(StorageKeyEnum.STATE, this.name);
  }

  private getStateOverridesLocalStorageKey(): string {
    return Scopes.getLocalStorageKey(StorageKeyEnum.OVERRIDES, this.name);
  }
}
