import { Html } from "@packages/utility";
import { useTheme } from "@packages/hooks";
import { THEMES } from "@packages/settings";

export function SectionThemes() {
  const { themeId, setTheme } = useTheme();

  return (
    <div className={Html.joinClasses("flex flex-col", "gap-2")}>
      <p className={Html.joinClasses("text-xs", "text-gray-500 dark:text-gray-400")}>
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
                  ? "border-blue-500"
                  : "border-gray-200 dark:border-gray-700",
                "px-3 py-2",
                "flex items-center gap-2",
                "text-left",
                "hover:bg-white/70 dark:hover:bg-gray-800/30",
                "transition-colors"
              )}
              aria-pressed={isSelected}
            >
              <span
                aria-hidden
                className={Html.joinClasses("size-4", "rounded", "border border-black/10")}
                style={{ backgroundColor: theme.previewBackground }}
              />

              <span className={Html.joinClasses("min-w-0", "flex-1")}
              >
                <span
                  className={Html.joinClasses(
                    "block",
                    "truncate",
                    "text-sm",
                    isSelected ? "text-gray-900 dark:text-white" : "text-gray-800 dark:text-gray-200"
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
