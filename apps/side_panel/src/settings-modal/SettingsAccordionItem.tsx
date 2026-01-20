import { Html } from "@packages/utility";
import type { ReactNode, RefObject } from "react";
import { AnimatePresence, motion } from "motion/react";

type SettingsAccordionItemProps = {
  id: string;
  title: string;
  icon?: ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  headerButtonRef?: RefObject<HTMLButtonElement | null>;
  children: ReactNode;
};

type ChevronProps = {
  expanded: boolean;
};

function Chevron({ expanded }: ChevronProps) {
  return (
    <span
      aria-hidden
      className={Html.joinClasses(
        "shrink-0",
        "size-4",
        // Darker in light mode so it doesn't disappear against a white background.
        "text-gray-700 dark:text-gray-200",
        "transition-transform duration-200",
        expanded ? "rotate-0" : "-rotate-90"
      )}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="block">
        <path d="M11.646 15.146 5.854 9.354a.5.5 0 0 1 .353-.854h11.586a.5.5 0 0 1 .353.854l-5.793 5.792a.5.5 0 0 1-.707 0" />
      </svg>
    </span>
  );
}

export function SettingsAccordionItem({
  id,
  title,
  icon,
  isExpanded,
  onToggle,
  headerButtonRef,
  children,
}: SettingsAccordionItemProps) {
  const buttonId = `settings-accordion-${id}-button`;
  const panelId = `settings-accordion-${id}-panel`;

  return (
    <section
      className={Html.joinClasses(
        "rounded",
        "border border-gray-200 dark:border-gray-700",
        "bg-white/70 dark:bg-gray-800/70",
        "backdrop-blur"
      )}
    >
      <button
        ref={headerButtonRef}
        id={buttonId}
        type="button"
        className={Html.joinClasses(
          "w-full",
          "flex items-center justify-between",
          "gap-3",
          "px-3 py-3",
          "text-left",
          "select-none",
          "text-gray-900 dark:text-white",
          "hover:bg-gray-50 dark:hover:bg-gray-700/40",
          "transition-colors"
        )}
        aria-expanded={isExpanded}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className={Html.joinClasses("min-w-0", "flex items-center gap-2")}
        >
          {icon ? (
            <span aria-hidden className={Html.joinClasses("shrink-0", "text-gray-700 dark:text-gray-200")}>
              {icon}
            </span>
          ) : null}
          <span className={Html.joinClasses("truncate", "text-sm font-semibold")}>{title}</span>
        </span>

        <Chevron expanded={isExpanded} />
      </button>

      <AnimatePresence initial={false}>
        {isExpanded ? (
          <motion.div
            key={panelId}
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className={Html.joinClasses("border-t border-gray-200 dark:border-gray-700", "p-3")}>
              {children}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
