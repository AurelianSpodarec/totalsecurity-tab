import { Html } from "@packages/utility";
import { MouseEventHandler } from "react";
import { SessionWindow } from "@packages/tab-manager";
import { Reorder } from "motion/react";
import { TabCard } from "./TabCard";
import { useTabReorder } from "../hooks/useTabReorder";

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
    tabs,
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
      <Reorder.Group values={tabs} onReorder={handleReorder} as="div">
        <ul className="flex flex-col gap-3 grow overflow-y-auto">
          {tabs.map((tab) => (
            <Reorder.Item
              key={tab.id}
              value={tab}
              as="li"
              onDragStart={() => handleDragStart(tab)}
              onDragEnd={handleDragEnd}
            >
              <TabCard
                tab={tab}
                onClick={() => handleTabClick(tab)}
                onPin={() => handleTabPin(tab)}
                onClose={() => handleTabClose(tab)}
              />
            </Reorder.Item>
          ))}
        </ul>
      </Reorder.Group>
    </div>
  );
}
