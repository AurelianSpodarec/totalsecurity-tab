import { Html } from "@packages/utility";
import { BarChartIcon, GearIcon } from "@radix-ui/react-icons";
import { useEffect, useRef, useState } from "react";
import { SettingsModalContent } from "./settings/SettingsModalContent";
import { SettingsModalHeader } from "./settings/SettingsModalHeader";
import { SettingsModalNav } from "./settings/SettingsModalNav";
import { SettingsTab, SettingsTabId } from "./settings/types";

const SETTINGS_TABS = [
  { id: "themes", label: "Themes", icon: <GearIcon /> },
  { id: "analytics", label: "Analytics", icon: <BarChartIcon /> },
] satisfies Array<SettingsTab>;

type SettingsModalProps = {
  open: boolean;
  onClose: () => void;
};

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTabId>("themes");
  const firstTabButtonRef = useRef<HTMLButtonElement>(null);

  const tabs = SETTINGS_TABS;

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
        <SettingsModalHeader onClose={onClose} />

        <div className={Html.joinClasses("flex-1", "min-h-0", "flex")}>
          <SettingsModalNav
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            firstTabButtonRef={firstTabButtonRef}
          />

          <main className={Html.joinClasses("flex-1", "min-w-0", "overflow-y-auto", "p-4")}>
            <SettingsModalContent activeTab={activeTab} />
          </main>
        </div>
      </div>
    </div>
  );
}
