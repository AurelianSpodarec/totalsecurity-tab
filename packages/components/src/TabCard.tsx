import { Html } from "@packages/utility";
import { MouseEventHandler } from "react";
import { Cross2Icon, DrawingPinFilledIcon, DrawingPinIcon, GlobeIcon } from "@radix-ui/react-icons";
import { SessionTab } from "@packages/tab-manager";
import { IconButton } from "./IconButton";
import { TabsApi } from "@packages/ext-api";

type TabCardProps = {
  tab: SessionTab;
  className?: string;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export function TabCard({ tab, onClick, className }: TabCardProps)
{
  const { faviconUrl, title, pinned, active } = tab;
  return (
    <div
      className={Html.joinClasses(
        "flex items-center justify-between gap-3",
        tab.active ? "bg-blue-500 dark:bg-blue-500" : "bg-gray-700 dark:bg-gray-700",
        "rounded",
        "p-3",
        "text-base font-base text-gray-900 dark:text-white",
        "transition-colors duration-150",
        "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <span className={"flex items-center gap-3 truncate"}>
        {
          faviconUrl
            ? <img
              alt={`${title} favicon`}
              className={Html.joinClasses(
                "h-[24px] w-[24px]"
              )}
              src={faviconUrl || "chrome://favicon/"}
            />
            : <GlobeIcon style={{ height: 24, width: 24 }}/>
        }
        <span className={"truncate"} title={title}>
        {title}
      </span>
      </span>

      <span className={"flex gap-3"}>
        <IconButton
          className={pinned && !active ? "text-blue-500" : "text-white"}
          onClick={(event) => {
            event.stopPropagation();
            return TabsApi.update(tab.id, { pinned: !pinned });
          }}
        >
          {pinned ? <DrawingPinFilledIcon/> : <DrawingPinIcon/>}
        </IconButton>
        <IconButton onClick={(event) => {
          event.stopPropagation();
          return TabsApi.remove(tab.id);
        }}>
          {<Cross2Icon/>}
        </IconButton>

      </span>
    </div>
  )
}
