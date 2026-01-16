import { StateNodeInterface, ReadOnlyStateNodeInterface } from "treeduxjs";

export type TreeduxStateNode = StateNodeInterface<any, any> | ReadOnlyStateNodeInterface<any>;
