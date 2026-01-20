import { useEffect, useMemo, useState } from "react";
import { Redux } from "@packages/state";
import {
  applyThemeToDocument,
  getThemeById,
  type ThemeId,
} from "@packages/settings";

export function useTheme() {
  const [themeId, setThemeId] = useState<ThemeId>(() => Redux.get().state.settings.theme.get());

  useEffect(() => Redux.get().state.settings.theme.subscribe(setThemeId), []);

  useEffect(() => {
    applyThemeToDocument(themeId);
  }, [themeId]);

  const theme = useMemo(() => getThemeById(themeId), [themeId]);

  const setTheme = (nextThemeId: ThemeId) => {
    if (nextThemeId === themeId) return;
    Redux.get().state.settings.theme.set(nextThemeId).dispatch();
  };

  return { themeId, theme, setTheme };
}
