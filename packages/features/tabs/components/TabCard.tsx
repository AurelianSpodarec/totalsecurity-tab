import { MouseEventHandler } from "react";
import { Html } from "@packages/utility";
import { SessionTab } from "@packages/tab-manager";
import { Favicon } from "@packages/components";
import { TabActions } from "./TabActions";

type TabCardProps = {
  tab: SessionTab;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
  onPin?: MouseEventHandler<HTMLButtonElement>;
  onClose?: MouseEventHandler<HTMLButtonElement>;
};

export function TabCard({ tab, onClick, onPin, onClose, className }: TabCardProps) {
  const { faviconUrl, title, pinned, active, groupColor } = tab;

  const handlePin: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    onPin?.(e);
  };

  const handleClose: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    onClose?.(e);
  };

  return (
    <div
      data-tab-group-color={groupColor}
      className={Html.joinClasses(
        "group relative flex items-center justify-between gap-3",
        active ? "bg-blue-500 dark:bg-blue-500" : "hover:bg-gray-500 bg-gray-700 dark:bg-gray-700",
        "rounded",
        "p-3",
        "text-base font-base text-gray-900 dark:text-white",
        "transition-colors duration-150",
        "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {groupColor && (
        <span
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l"
          style={{ backgroundColor: "var(--tab-group-color)" }}
        />
      )}

      <span className="flex flex-1 min-w-0 items-center gap-3">
        <Favicon
          url={faviconUrl}
          alt={`${title} favicon`}
          className="pointer-events-none shrink-0"
        />
        <span className="flex-1 min-w-0 whitespace-nowrap overflow-hidden tmit-fade-right-actions" title={title}>
          {title}
        </span>
      </span>

      {(onPin || onClose) && (
        <span
          className={Html.joinClasses(
            // Absolute overlay so the title can use the full card width.
            "absolute inset-y-0 right-0",
            "z-10",
            "flex items-center",
            // Background: inherit from the TabCard (so it matches hover/active states),
            // then fade in from the left edge.
            "bg-inherit tmit-fade-left-actions",
            // Dedicated fade strip on the left + right padding matching the card.
            "pl-4 pr-3",
            "rounded-r",
            "transition-opacity duration-150",
            pinned
              ? "opacity-100 pointer-events-auto"
              : Html.joinClasses(
                  "opacity-0 pointer-events-none",
                  "group-hover:opacity-100 group-hover:pointer-events-auto",
                  "group-focus-within:opacity-100 group-focus-within:pointer-events-auto"
                )
          )}
        >
          <TabActions
            pinned={pinned}
            active={active}
            onPin={handlePin}
            onClose={handleClose}
          />
        </span>
      )}
    </div>
  );
}
