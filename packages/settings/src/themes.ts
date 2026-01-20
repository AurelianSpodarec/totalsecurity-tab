export const THEMES = [
  {
    id: "total-security",
    name: "Total Security",
    previewBackground: "#1f2937", // roughly tailwind gray-800
    isDark: true,
  },
  {
    id: "mocha",
    name: "Mocha",
    previewBackground: "#1e1e2e",
    isDark: true,
  },
  {
    id: "midnight",
    name: "Midnight",
    previewBackground: "#15202b",
    isDark: true,
  },
  {
    id: "light",
    name: "Light",
    previewBackground: "#ffffff",
    isDark: false,
  },
] as const;

export type ThemeDefinition = (typeof THEMES)[number];
export type ThemeId = ThemeDefinition["id"];
