import { StateNodeInterface } from "treeduxjs";

type StateNodeValue<StateNode extends StateNodeInterface<any, any>> = ReturnType<StateNode["get"]>;

type ReadOnlyValue<StateNode extends StateNodeInterface<any, any> | {
  [key: string]: StateNodeInterface<any, any>
}> = StateNode extends StateNodeInterface<any, any>
  ? StateNodeValue<StateNode>
  : { [K in keyof StateNode]: StateNode[K] extends StateNodeInterface<any, any> ? StateNodeValue<StateNode[K]> : never };

/**
 * @deprecated
 *
 * treeduxjs now natively supports read-only state nodes. Just call `.toReadOnly()` on any state node.
 * The native implementation provides additional benefits like subtree traversal and dynamic traversal using the `byKey()` method.
 */
export class ReadOnlyStateNode<StateNode extends StateNodeInterface<any, any> | { [key: string]: StateNodeInterface<any, any> }> {
  private readonly stateNode: StateNode;

  public constructor(stateNode: StateNode) {
    this.stateNode = stateNode;
  }

  public get(): ReadOnlyValue<StateNode> {
    if (typeof this.stateNode["get"] === "function") return this.stateNode.get();
    return Object.fromEntries(Object.entries(this.stateNode).map(([key, value]) => [key, value.get()])) as ReadOnlyValue<StateNode>;
  }

  public subscribe(callback: (data: ReadOnlyValue<StateNode>) => void): () => void {
    if (typeof this.stateNode["subscribe"] === "function") return this.stateNode.subscribe(callback);

    let currentValue = this.get();

    const unsubscribers = Object.entries(this.stateNode).map(([key, value]: [string, StateNodeInterface<any, any>]) =>
      value.subscribe((newValue) => {
        currentValue = { ...currentValue, [key]: newValue };
        callback(currentValue);
      })
    );

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }
}
