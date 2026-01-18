import { Html } from "@packages/utility";
import { MouseEventHandler } from "react";
import { SessionTab, tabGroupColorToHex } from "@packages/tab-manager";
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
  const groupBorderHex = tabGroupColorToHex(groupColor);

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
      className={Html.joinClasses(
        "flex items-center justify-between gap-3",
        active ? "bg-blue-500 dark:bg-blue-500" : "bg-gray-700 dark:bg-gray-700",
        "rounded",
        "p-3",
        "text-base font-base text-gray-900 dark:text-white",
        "transition-colors duration-150",
        "cursor-pointer",
        className
      )}
      style={groupBorderHex ? { borderLeft: `4px solid ${groupBorderHex}` } : undefined}
      onClick={onClick}
    >
      <span className="flex items-center gap-3 truncate">
        <Favicon url={faviconUrl} alt={`${title} favicon`} />
        <span className="truncate" title={title}>
          {title}
        </span>
      </span>

      {(onPin || onClose) && (
        <TabActions
          pinned={pinned}
          active={active}
          onPin={handlePin}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
