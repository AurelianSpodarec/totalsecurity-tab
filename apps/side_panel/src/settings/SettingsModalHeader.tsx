import { Html } from "@packages/utility";

type SettingsModalHeaderProps = {
  onClose: () => void;
};

export function SettingsModalHeader({ onClose }: SettingsModalHeaderProps) {
  return (
    <header
      className={Html.joinClasses(
        "flex items-center justify-between",
        "gap-3",
        "p-2",
        "border-b border-gray-200 dark:border-gray-700"
      )}
    >
      <div className="min-w-0">
        <h2
          id="settings-title"
          className={Html.joinClasses(
            "text-lg font-semibold",
            "text-gray-900 dark:text-white"
          )}
        >
          Settings
        </h2>
      </div>

      <button
        type="button"
        className={Html.joinClasses(
          "shrink-0",
          "rounded",
          "px-3 py-2",
          "text-sm font-medium",
          "bg-gray-200 dark:bg-gray-700",
          "text-gray-900 dark:text-white",
          "hover:bg-gray-300 dark:hover:bg-gray-600",
          "transition-colors"
        )}
        onClick={onClose}
      >
        X
      </button>
    </header>
  );
}
