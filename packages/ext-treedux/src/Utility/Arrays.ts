import { Objects } from "./Objects";

export class Arrays {
  public static clone<T>(arr: Array<T>): Array<T> {
    if (!Array.isArray(arr)) throw new TypeError(`Input type "${typeof arr}" passed to Arrays.clone()`);
    return arr.map((item) => {
      if (Array.isArray(item)) return this.clone(item) as typeof item;
      else if (typeof item === "object" && item !== null) return Objects.clone(item) as typeof item;
      else return item;
    });
  }
}
