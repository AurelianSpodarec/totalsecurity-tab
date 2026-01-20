import { useLayoutEffect, useState, type ReactNode } from "react";
import { Redux } from "@packages/state";
import { applyThemeToDocument, type ThemeId } from "@packages/settings";

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeId, setThemeId] = useState<ThemeId>(() => Redux.get().state.settings.theme.get());

  useLayoutEffect(() => Redux.get().state.settings.theme.subscribe(setThemeId), []);

  // useLayoutEffect avoids a flash of the wrong theme on initial paint.
  useLayoutEffect(() => {
    applyThemeToDocument(themeId);
  }, [themeId]);

  return children;
}
