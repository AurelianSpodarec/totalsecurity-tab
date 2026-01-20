import { Html } from "@packages/utility";
import { useShortcut } from "@packages/keyboard";
import { useEffect, useRef, useState } from "react";
import { SettingsAccordionItem } from "./SettingsAccordionItem";
import { SettingsModalHeader } from "./SettingsModalHeader";
import { SETTINGS_SECTIONS } from "./sections/sections";
import type { SettingsTabId } from "./types";

type SettingsModalProps = {
  open: boolean;
  onClose: () => void;
};

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [expandedSections, setExpandedSections] = useState<Set<SettingsTabId>>(() => {
    const defaults = SETTINGS_SECTIONS.filter((s) => s.defaultExpanded).map((s) => s.id);
    return new Set<SettingsTabId>(defaults);
  });
  const firstSectionButtonRef = useRef<HTMLButtonElement>(null);

  useShortcut("Escape", onClose, { scope: "modal", enabled: open });

  useEffect(() => {
    if (!open) return;
    firstSectionButtonRef.current?.focus();
  }, [open]);

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
            {SETTINGS_SECTIONS.map((section, index) => (
              <SettingsAccordionItem
                key={section.id}
                id={section.id}
                title={section.label}
                icon={section.icon}
                isExpanded={expandedSections.has(section.id)}
                onToggle={() => toggleSection(section.id)}
                headerButtonRef={index === 0 ? firstSectionButtonRef : undefined}
              >
                <section.Content />
              </SettingsAccordionItem>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
