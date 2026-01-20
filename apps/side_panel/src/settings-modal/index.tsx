import { Html } from "@packages/utility";
import { BarChartIcon, GearIcon } from "@radix-ui/react-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { SettingsAccordionItem } from "./SettingsAccordionItem";
import { AnalyticsSettingsSection, ThemesSettingsSection } from "./SettingsModalContent";
import { SettingsModalHeader } from "./SettingsModalHeader";
import type { SettingsTab, SettingsTabId } from "./types";

const SETTINGS_TABS = [
  { id: "themes", label: "Themes", icon: <GearIcon /> },
  { id: "analytics", label: "Analytics", icon: <BarChartIcon /> },
] satisfies Array<SettingsTab>;

type SettingsModalProps = {
  open: boolean;
  onClose: () => void;
};

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  // Expand "Themes" by default so the modal isn't empty on first open.
  const [expandedSections, setExpandedSections] = useState<Set<SettingsTabId>>(
    () => new Set<SettingsTabId>(["themes"])
  );
  const firstSectionButtonRef = useRef<HTMLButtonElement>(null);

  const tabs = useMemo(() => SETTINGS_TABS, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    firstSectionButtonRef.current?.focus();

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const toggleSection = (tabId: SettingsTabId) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(tabId)) next.delete(tabId);
      else next.add(tabId);
      return next;
    });
  };

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

        <main className={Html.joinClasses("flex-1", "min-h-0", "overflow-y-auto")}>
          <div className={Html.joinClasses("flex flex-col")}>
            {tabs.map((tab, index) => (
              <SettingsAccordionItem
                key={tab.id}
                id={tab.id}
                title={tab.label}
                icon={tab.icon}
                isExpanded={expandedSections.has(tab.id)}
                onToggle={() => toggleSection(tab.id)}
                headerButtonRef={index === 0 ? firstSectionButtonRef : undefined}
              >
                {tab.id === "themes" ? <ThemesSettingsSection /> : null}
                {tab.id === "analytics" ? <AnalyticsSettingsSection /> : null}
              </SettingsAccordionItem>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
