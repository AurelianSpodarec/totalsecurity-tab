import { Arrays } from "./Arrays";

export type MergeResult<T extends any[]> = T extends [ infer First, ...infer Rest ]
  ? First & MergeResult<Rest>
  : unknown;

export class Objects
{
  public static merge<T extends Array<Record<any, any>>>(...objects: T): MergeResult<T>
  {
    return objects.reduce((acc, source) => {
      
      for (const key in source)
      {
        const sourceValue = source[key];
        
        if (Array.isArray(sourceValue))
        {
          acc[key] = Arrays.clone(sourceValue);
        }
        else if (typeof sourceValue === "object" && sourceValue !== null)
        {
          acc[key] = this.merge(acc[key] || {}, Objects.clone(sourceValue));
        }
        else
        {
          acc[key] = sourceValue;
        }
      }
      
      return acc;
    }, {} as any);
  }
  
  public static clone<T extends Record<string | number, any>>(obj: T): T
  {
    if (!obj || typeof obj !== "object" || Array.isArray(obj))
    {
      throw new TypeError("Cannot clone object. Source object must be of type 'object'.");
    }
    
    return this.hydrate(Object.create(obj), obj);
  }
  
  public static hydrate<Dest extends Record<any, any>, Src extends Record<any, any>>(
    dest: Dest,
    source: Src
  ): Src & Dest
  {
    if (
      !source
      || !dest
      || typeof dest !== "object"
      || typeof source !== "object"
      || Array.isArray(dest)
      || Array.isArray(source)
    )
    {
      throw new TypeError(`Cannot hydrate object. Source and destination object must both be of type "object"`);
    }
    
    const properties: Array<keyof typeof source> = Object.keys(source) as Array<keyof typeof source>;
    
    for (const property of properties)
    {
      if (!source.hasOwnProperty(property)) continue;
      const sourceValue = source[property];
      if (Array.isArray(sourceValue))
      {
        dest[property] = Arrays.clone(sourceValue) as typeof sourceValue;
      }
      else if (typeof sourceValue === "object")
      {
        dest[property] = this.clone(sourceValue);
      }
      else
      {
        dest[property] = sourceValue;
      }
    }
    
    return dest as Src & Dest;
  }
}
