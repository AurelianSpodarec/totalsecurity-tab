import { MouseEventHandler } from "react";
import { Html } from "@packages/utility";
import { SessionTab } from "@packages/tab-manager";
import { Button, Favicon } from "@packages/components";
import { TabItemActions } from "./TabItemActions";

type TabItemProps = {
  tab: SessionTab;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  onPin?: MouseEventHandler<HTMLButtonElement>;
  onClose?: MouseEventHandler<HTMLButtonElement>;
};

export function TabItem({ tab, onClick, onPin, onClose, className }: TabItemProps) {
  const { faviconUrl, title, pinned, active, groupColor } = tab;

  const hasTabActions = Boolean(onPin || onClose);

  const handlePin: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    onPin?.(e);
  };

  const handleClose: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    onClose?.(e);
  };

  return (
    <Button
      onClick={onClick}
      data-tab-group-color={groupColor}
      className={Html.joinClasses(
        "group relative flex w-full min-w-0 items-center justify-between gap-3",
        active ? "bg-blue-500 dark:bg-blue-500" : "hover:bg-gray-500 bg-gray-700 dark:bg-gray-700",
        "rounded",
        "p-3",
        "text-base font-base text-gray-900 dark:text-white",
        "transition-colors duration-150",
        "cursor-pointer",
        className
      )}
    >
      {groupColor && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l"
          style={{ backgroundColor: "var(--tab-group-color)" }}
        />
      )}

      <div className="flex flex-1 min-w-0 items-center gap-3">
        <Favicon
          url={faviconUrl}
          alt={`${title} favicon`}
          className="pointer-events-none shrink-0"
        />
        <span className="flex-1 min-w-0 whitespace-nowrap overflow-hidden text-left tmit-fade-right-actions" title={title}>
          {title}
        </span>
      </div>

      {hasTabActions && (
        <span
          className={Html.joinClasses(
            "absolute inset-y-0 right-0",
            "z-10",
            "flex items-center",
            "bg-inherit tmit-fade-left-actions",
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
          <TabItemActions
            pinned={pinned}
            active={active}
            onPin={handlePin}
            onClose={handleClose}
          />
        </span>
      )}
    </Button>
  );
}
