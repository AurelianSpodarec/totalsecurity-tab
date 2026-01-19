import { Html } from "@packages/utility";
import { BarChartIcon, GearIcon } from "@radix-ui/react-icons";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";

type SettingsModalProps = {
  open: boolean;
  onClose: () => void;
};

type SettingsTabId = "themes" | "analytics";

type SettingsTab = {
  id: SettingsTabId;
  label: string;
  icon: ReactNode;
};

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTabId>("themes");
  const firstTabButtonRef = useRef<HTMLButtonElement>(null);

  const tabs = useMemo<Array<SettingsTab>>(
    () => [
      { id: "themes", label: "Themes", icon: <GearIcon /> },
      { id: "analytics", label: "Analytics", icon: <BarChartIcon /> },
    ],
    []
  );

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    firstTabButtonRef.current?.focus();

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={Html.joinClasses("fixed inset-0 z-50", "h-full w-full")}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div
        className={Html.joinClasses(
          "relative",
          "h-full w-full",
          "bg-white dark:bg-gray-800",
          "flex flex-col"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onClick={(e) => e.stopPropagation()}
      >
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

        <div className={Html.joinClasses("flex-1", "min-h-0", "flex")}
        >
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
                  aria-label={tab.label}
                  aria-selected={isActive}
                  role="tab"
                  title={tab.label}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.icon}
                </button>
              );
            })}
          </nav>

          <main className={Html.joinClasses("flex-1", "min-w-0", "overflow-y-auto", "p-4")}>
            {activeTab === "themes" ? (
              <section aria-label="Themes">
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
              <section aria-label="Analytics">
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
          </main>
        </div>
      </div>
    </div>
  );
}
