import { Html } from "@packages/utility";
import { MouseEventHandler } from "react";
import { SessionWindow } from "@packages/tab-manager";
import { Reorder } from "motion/react";
import { TabCard } from "./TabCard";
import { GroupTitleCard } from "./GroupTitleCard";
import { useTabReorder, getItemKey } from "../hooks/useTabReorder";

type TabListProps = {
  className?: string;
  window: SessionWindow;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onClick?: MouseEventHandler<HTMLDivElement>;
};

export function TabList({
  window,
  onClick,
  onMouseEnter,
  className,
}: TabListProps) {
  const {
    items,
    handleReorder,
    handleDragStart,
    handleDragEnd,
    handleTabClick,
    handleTabPin,
    handleTabClose,
  } = useTabReorder({ window });

  return (
    <div
      className={Html.joinClasses("p-3", "cursor-pointer", className)}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <Reorder.Group values={items} onReorder={handleReorder} as="div">
        <ul className="flex flex-col gap-3 grow overflow-y-auto">
          {items.map((item) => (
            <Reorder.Item
              key={getItemKey(item)}
              value={item}
              as="li"
              onDragStart={() => handleDragStart(item)}
              onDragEnd={handleDragEnd}
            >
              {item.type === "tab" ? (
                <TabCard
                  tab={item.tab}
                  onClick={() => handleTabClick(item.tab)}
                  onPin={() => handleTabPin(item.tab)}
                  onClose={() => handleTabClose(item.tab)}
                />
              ) : (
                <GroupTitleCard
                  title={item.groupTitle}
                  groupColor={item.groupColor}
                />
              )}
            </Reorder.Item>
          ))}
        </ul>
      </Reorder.Group>
    </div>
  );
}
