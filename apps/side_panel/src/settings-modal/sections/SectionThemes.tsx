import { Html } from "@packages/utility";
import { useTheme } from "@packages/hooks";
import { THEMES } from "@packages/settings";

export function SectionThemes() {
  const { themeId, setTheme } = useTheme();

  return (
    <div className={Html.joinClasses("flex flex-col", "gap-2")}>
      <p className={Html.joinClasses("text-xs", "text-[color:var(--tmit-theme-picker-desc-text)]")}>
        Pick a theme. This preference is saved locally.
      </p>

      <div className={Html.joinClasses("grid", "grid-cols-2", "gap-2")}>
        {THEMES.map((theme) => {
          const isSelected = theme.id === themeId;

          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => setTheme(theme.id)}
              className={Html.joinClasses(
                "rounded",
                "border",
                isSelected
                  ? "border-[color:var(--tmit-theme-picker-item-border-selected)]"
                  : "border-[color:var(--tmit-theme-picker-item-border)]",
                "px-3 py-2",
                "flex items-center gap-2",
                "text-left",
                "hover:bg-[var(--tmit-theme-picker-item-bg-hover)]",
                "transition-colors"
              )}
              aria-pressed={isSelected}
            >
              <span
                aria-hidden
                className={Html.joinClasses(
                  "size-4",
                  "rounded",
                  "border border-[color:var(--tmit-theme-picker-swatch-border)]"
                )}
                style={{ backgroundColor: theme.previewBackground }}
              />

              <span className={Html.joinClasses("min-w-0", "flex-1")}
              >
                <span
                  className={Html.joinClasses(
                    "block",
                    "truncate",
                    "text-sm",
                    isSelected
                      ? "text-[color:var(--tmit-theme-picker-item-text-selected)]"
                      : "text-[color:var(--tmit-theme-picker-item-text)]"
                  )}
                >
                  {theme.name}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
