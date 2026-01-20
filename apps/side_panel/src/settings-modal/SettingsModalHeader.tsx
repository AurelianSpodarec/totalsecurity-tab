import { Cross2Icon } from "@radix-ui/react-icons";
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
        aria-label="Close settings"
        title="Close"
        className={Html.joinClasses(
          "shrink-0",
          "flex items-center justify-center",
          "rounded",
          "p-2",
          "bg-[var(--tmit-settings-header-close-bg)]",
          "text-[color:var(--tmit-settings-header-close-text)]",
          "hover:bg-[var(--tmit-settings-header-close-bg-hover)]",
          "transition-colors"
        )}
        onClick={onClose}
      >
        <Cross2Icon className="h-5 w-5" />
      </button>
    </header>
  );
}
