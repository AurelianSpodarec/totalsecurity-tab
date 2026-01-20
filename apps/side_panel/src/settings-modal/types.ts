import type { ComponentType, ReactNode } from "react";

export type SettingsTabId = "themes" | "analytics";

export type SettingsSectionDefinition = {
  id: SettingsTabId;
  label: string;
  icon: ReactNode;
  defaultExpanded?: boolean;
  Content: ComponentType;
};
