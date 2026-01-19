import { Html } from "@packages/utility";
import { SettingsTabId } from "./types";

type SettingsModalContentProps = {
  activeTab: SettingsTabId;
};

export function SettingsModalContent({ activeTab }: SettingsModalContentProps) {
  return (
    <>
      {activeTab === "themes" ? (
        <section id="settings-panel-themes" role="tabpanel" aria-labelledby="settings-tab-themes">
          <h3 className={Html.joinClasses("text-base font-semibold", "text-gray-900 dark:text-white")}>
            Themes
          </h3>
          <div
            className={Html.joinClasses(
              "mt-3",
              "rounded",
              "bg-gray-50 dark:bg-gray-900/30",
              "p-3",
              "text-sm",
              "text-gray-700 dark:text-gray-200"
            )}
          >
            Theme controls will go here.
          </div>
        </section>
      ) : null}

      {activeTab === "analytics" ? (
        <section
          id="settings-panel-analytics"
          role="tabpanel"
          aria-labelledby="settings-tab-analytics"
        >
          <h3 className={Html.joinClasses("text-base font-semibold", "text-gray-900 dark:text-white")}>
            Analytics
          </h3>
          <div
            className={Html.joinClasses(
              "mt-3",
              "rounded",
              "bg-gray-50 dark:bg-gray-900/30",
              "p-3",
              "text-sm",
              "text-gray-700 dark:text-gray-200"
            )}
          >
            Analytics UI will go here.
          </div>
        </section>
      ) : null}
    </>
  );
}
