import { Html } from "@packages/utility";
import { RefObject } from "react";
import { SettingsTab, SettingsTabId } from "./types";

type SettingsModalNavProps = {
  tabs: Array<SettingsTab>;
  activeTab: SettingsTabId;
  onChange: (tab: SettingsTabId) => void;
  firstTabButtonRef: RefObject<HTMLButtonElement | null>;
};

export function SettingsModalNav({
  tabs,
  activeTab,
  onChange,
  firstTabButtonRef,
}: SettingsModalNavProps) {
  return (
    <nav
      className={Html.joinClasses(
        "h-full",
        "w-14",
        "border-r border-gray-200 dark:border-gray-700",
        "bg-white/70 dark:bg-gray-800/70",
        "backdrop-blur",
        "py-3",
        "flex flex-col",
        "items-center",
        "gap-2"
      )}
      aria-label="Settings sections"
      role="tablist"
    >
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeTab;
        const tabId = `settings-tab-${tab.id}`;
        const panelId = `settings-panel-${tab.id}`;

        return (
          <button
            key={tab.id}
            ref={index === 0 ? firstTabButtonRef : undefined}
            type="button"
            className={Html.joinClasses(
              "h-10 w-10",
              "rounded",
              "grid place-items-center",
              "text-gray-700 dark:text-gray-200",
              "hover:bg-gray-100 dark:hover:bg-gray-700",
              "transition-colors",
              isActive && "bg-gray-100 dark:bg-gray-700"
            )}
            id={tabId}
            aria-label={tab.label}
            aria-selected={isActive}
            aria-controls={panelId}
            role="tab"
            title={tab.label}
            onClick={() => onChange(tab.id)}
          >
            {tab.icon}
          </button>
        );
      })}
    </nav>
  );
}
