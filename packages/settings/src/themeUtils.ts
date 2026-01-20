import { THEMES, type ThemeDefinition, type ThemeId } from "./themes";

export function getThemeById(themeId: string): ThemeDefinition {
  const theme = THEMES.find((t) => t.id === themeId);
  return theme ?? THEMES[0];
}

/**
 * Applies the theme in the simplest way possible (a single attribute on <html>).
 *
 * CSS tokens should be scoped under `[data-theme="..."]`.
 */
export function applyThemeToDocument(themeId: ThemeId): void {
  document.documentElement.setAttribute("data-theme", themeId);
}
