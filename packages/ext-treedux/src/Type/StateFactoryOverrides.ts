import { RecursivePartial } from "./RecursivePartial";
import { StateFactoryValue } from "./StateFactoryValue";
import { TreeduxStateNode } from "./TreeduxStateNode";

type StateNodeOverride<StateNode extends TreeduxStateNode> = ReturnType<StateNode["get"]> extends Record<any, any>
  ? RecursivePartial<ReturnType<StateNode["get"]>>
  : ReturnType<StateNode["get"]>;

export type StateFactoryOverrides<State> = State extends StateFactoryValue
  ? State extends TreeduxStateNode
    ? StateNodeOverride<State>
    : {
      [K in keyof State]?: State[K] extends TreeduxStateNode ? StateNodeOverride<State[K]> : never;
    }
  : never
