import { Redux } from "@packages/state";
import { useEffect, useState } from "react";

export function useSession() {
  const [session, setSession] = useState(Redux.get().state.tab_manager.session.get());
  useEffect(() => Redux.get().state.tab_manager.session.subscribe(setSession), []);
  return { session };
}
