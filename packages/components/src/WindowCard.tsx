import { Html } from "@packages/utility";
import { MouseEventHandler, useEffect, useRef, useState } from "react";
import { SessionWindow, SessionTab } from "@packages/tab-manager";
import { Reorder } from "motion/react";
import { TabCard } from "./TabCard";
import { TabsApi } from "@packages/ext-api";

type TabCardProps = {
  className?: string;
  window: SessionWindow;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export function WindowCard({ window, onClick, onMouseEnter, className }: TabCardProps)
{
  const [ tabs, setTabs ] = useState(window.tabs);
  const dragging = useRef(false);

  useEffect(() => setTabs(window.tabs), [ window.tabs ]);

  useEffect(() => {
    const movedTab = computeMovedTab(window.tabs, tabs);
    if (!movedTab) return;
    TabsApi.move(movedTab.tab.id, { index: movedTab.newIndex }).catch(console.error);
  }, [ tabs ]);

  return (
    <div
      className={Html.joinClasses(
        // Spacing
        "p-3",
        // Cursor
        "cursor-pointer",
        className
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <Reorder.Group values={tabs} onReorder={setTabs} as={"div"}>
        <ul className={"flex flex-col gap-3 grow overflow-y-auto"}>
          {
            tabs
              .map((tab) => {
                return <Reorder.Item
                  key={tab.id}
                  value={tab}
                  onDragStart={() => dragging.current = true}
                  onDragEnd={() => {
                    dragging.current = false;
                    setTabs(window.tabs);
                  }}
                >
                  <TabCard
                    tab={tab}
                    onClick={() => {
                      if (dragging.current) return;
                      return TabsApi.update(tab.id, { active: true });
                    }}
                  />
                </Reorder.Item>;
              })
          }
        </ul>
      </Reorder.Group>
    </div>
  )
}


const computeMovedTab = (oldTabs: Array<SessionTab>, newTabs: Array<SessionTab>) => {

  const shiftedLeft: Array<{ tab: SessionTab, oldIndex: number, newIndex: number }> = [];
  const shiftedRight: Array<{ tab: SessionTab, oldIndex: number, newIndex: number }> = [];

  for (const key in newTabs)
  {
    const newIndex = Number(key);
    const oldIndex = oldTabs.findIndex(tab => tab.id === newTabs[key].id);
    // If it hasn't moved, skip
    if (oldIndex === newIndex) continue;
    const shiftedTab = { tab: newTabs[key], oldIndex, newIndex };

    if (oldIndex < newIndex) shiftedRight.push(shiftedTab);
    else if (oldIndex > newIndex) shiftedLeft.push(shiftedTab);
  }

  // If nothing has moved, return null
  if (!shiftedLeft.length && !shiftedRight.length) return null;

  // If one item has shifted left and one has shifted right, it doesn't matter which one you return
  if (shiftedLeft.length === 1 && shiftedRight.length === 1)
  {
    return shiftedLeft.at(0)!;
  }

  // If one item has shifted left, return it
  if (shiftedLeft.length === 1) return shiftedLeft.at(0)!;
  // If one item has shifted right, return it
  else if (shiftedRight.length === 1) return shiftedRight.at(0)!;

  throw new Error("Multiple items moved at once");
}
