
export function tryCatch<Fn extends () => Promise<any>>(fn: Fn): Promise<[ Resolved<ReturnType<Fn>>, null ] | [ null, Error ]>
export function tryCatch<Fn extends () => any>(fn: Fn): [ ReturnType<Fn>, null ] | [ null, Error ]
export function tryCatch<P extends Promise<any>>(promise: P): Promise<[ Resolved<P>, null ] | [ null, Error ]>
export function tryCatch(catchable: any): any
{
  if (catchable instanceof Promise)
  {
    return tryCatchAsync(catchable);
  }
  
  const [ result, error ] = tryCatchSync(catchable);
  
  if (result instanceof Promise)
  {
    return tryCatchAsync(result);
  }
  
  return [ result, error ];
}

function tryCatchSync<Fn extends () => any>(fn: Fn): [ ReturnType<Fn>, null ] | [ null, Error ]
{
  try
  {
    return [ fn(), null ];
  }
  catch (error)
  {
    return [ null, error instanceof Error ? error : new Error(error as any) ];
  }
}

type Resolved<T extends Promise<any>> = T extends Promise<infer R> ? R : never;

function tryCatchAsync<P extends Promise<any>>(promise: P): Promise<[ Resolved<P>, null ] | [ null, Error ]>
{
  return new Promise(resolve => {
    promise
      .then(value => resolve([ value, null ]))
      .catch(error => resolve([ null, error instanceof Error ? error : new Error(error as any) ]));
  });
}
