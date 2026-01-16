import { StateFactoryOverrides } from "./Type/StateFactoryOverrides";
import { StateFactoryValue } from "./Type/StateFactoryValue";

export class StateFactory<Initialiser extends () => Promise<StateFactoryValue>>
{
  private readonly initFn: Initialiser;
  private readonly overrideFn?: (overrides: StateFactoryOverrides<Awaited<ReturnType<Initialiser>>> | null) => void | Promise<void>;
  private value?: Awaited<ReturnType<Initialiser>>;

  public constructor(
    initFn: Initialiser,
    overrideFn?: (overrides: StateFactoryOverrides<Awaited<ReturnType<Initialiser>>> | null) => void | Promise<void>
  )
  {
    this.initFn = initFn;
    this.overrideFn = overrideFn;
  }

  public async init(): Promise<Awaited<ReturnType<Initialiser>>>
  {
    if (!this.value) this.value = await this.initFn() as Awaited<ReturnType<Initialiser>>;
    return this.value!;
  }

  public get(): Awaited<ReturnType<Initialiser>>
  {
    if (!this.value) throw new Error("Value not initialised");
    return this.value;
  }

  public async setOverrides(overrides: StateFactoryOverrides<Awaited<ReturnType<Initialiser>>> | null): Promise<void>
  {
    if (!this.overrideFn) throw new Error("Override function not set");
    this.overrideFn(overrides);
  }
}
