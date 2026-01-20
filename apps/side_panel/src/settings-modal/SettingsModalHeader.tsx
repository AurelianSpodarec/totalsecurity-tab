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
        "border-b border-[color:var(--tmit-settings-header-border)]"
      )}
    >
      <div className="min-w-0">
        <h2
          id="settings-title"
          className={Html.joinClasses(
            "text-lg font-semibold",
            "text-[color:var(--tmit-settings-header-title-text)]"
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
          "bg-[var(--tmit-settings-header-close-bg)]",
          "text-[color:var(--tmit-settings-header-close-text)]",
          "hover:bg-[var(--tmit-settings-header-close-bg-hover)]",
          "transition-colors"
        )}
        onClick={onClose}
      >
        X
      </button>
    </header>
  );
}
