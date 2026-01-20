import { Html } from "@packages/utility";

export function ThemesSettingsSection() {
  return (
    <div>
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
    </div>
  );
}

export function AnalyticsSettingsSection() {
  return (
    <div>
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
    </div>
  );
}
