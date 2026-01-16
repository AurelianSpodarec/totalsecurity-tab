import { ClassValue, clsx } from "clsx";

export class Html
{
  public static joinClasses(...inputs: Array<ClassValue>): string
  {
    return clsx(...inputs);
  }
}
