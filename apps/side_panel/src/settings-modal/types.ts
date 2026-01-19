import { ReactNode } from "react";

export type SettingsTabId = "themes" | "analytics";

export type SettingsTab = {
  id: SettingsTabId;
  label: string;
  icon: ReactNode;
};
