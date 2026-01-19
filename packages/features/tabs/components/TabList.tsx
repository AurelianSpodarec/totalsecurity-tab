import { Html } from "@packages/utility";
import { MouseEventHandler, useCallback, useState } from "react";
import { SessionWindow } from "@packages/tab-manager";
import { AnimatePresence, Reorder } from "motion/react";
import { TabGroupEditPopup } from "./TabGroup";
import type { TabListItem } from "../hooks/useTabReorder";
import { useTabReorder } from "../hooks/useTabReorder";
import { useTabGroupEdit } from "../hooks/useTabGroupEdit";
import { useCollapsedGroups } from "../hooks/useCollapsedGroups";
import { useVisibleReorder } from "../hooks/useVisibleReorder";
import { ReorderableGroupHeader } from "./TabList/ReorderableGroupHeader";
import { ReorderableTabItem } from "./TabList/ReorderableTabItem";

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

  const { collapsedGroups, toggleGroup } = useCollapsedGroups();
  const [isDragging, setIsDragging] = useState(false);

  const {
    activeEditingGroup,
    openEditor,
    closeEditor: closeEditingGroup,
    updateTitle,
    updateColor,
  } = useTabGroupEdit(items);


  const handleItemDragStart = useCallback(
    (item: TabListItem) => {
      setIsDragging(true);
      handleDragStart(item);
    },
    [handleDragStart]
  );

  const handleItemDragEnd = useCallback(() => {
    handleDragEnd();
    setIsDragging(false);
  }, [handleDragEnd]);

  const { reorderKeys, itemsByKey, handleVisibleReorder } = useVisibleReorder({
    items,
    collapsedGroups,
    isDragging,
    onReorder: handleReorder,
  });

  return (
    <div
      className={Html.joinClasses("p-3", "cursor-pointer", className)}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      {activeEditingGroup && (
        <TabGroupEditPopup
          key={activeEditingGroup.groupId}
          groupId={activeEditingGroup.groupId}
          title={activeEditingGroup.draftTitle}
          color={activeEditingGroup.draftColor}
          anchorRect={activeEditingGroup.anchorRect}
          onClose={closeEditingGroup}
          onTitleChange={updateTitle}
          onColorChange={updateColor}
        />
      )}
      <Reorder.Group values={reorderKeys} onReorder={handleVisibleReorder} as="div">
        <div className="flex flex-col overflow-x-hidden">
          <AnimatePresence initial={false}>
            {reorderKeys.map((key, idx) => {
              const item = itemsByKey.get(key);
              if (!item) return null;

              // Replace `gap-3` with a per-item margin. This keeps spacing consistent,
              // and (critically) lets exiting items animate their spacing to 0 so we don't
              // temporarily overflow the scroll container and flash an extra scrollbar.
              const isLast = idx === reorderKeys.length - 1;
              const itemSpacing = isLast ? 0 : 12;

              if (item.type === "group") {
                return (
                  <ReorderableGroupHeader
                    key={key}
                    itemKey={key}
                    item={item}
                    itemSpacing={itemSpacing}
                    collapsedGroups={collapsedGroups}
                    toggleGroup={toggleGroup}
                    activeEditingGroup={activeEditingGroup}
                    openEditor={openEditor}
                    handleItemDragStart={handleItemDragStart}
                    handleItemDragEnd={handleItemDragEnd}
                  />
                );
              }

              return (
                <ReorderableTabItem
                  key={key}
                  itemKey={key}
                  item={item}
                  itemSpacing={itemSpacing}
                  activeEditingGroup={activeEditingGroup}
                  handleTabClick={handleTabClick}
                  handleTabPin={handleTabPin}
                  handleTabClose={handleTabClose}
                  handleItemDragStart={handleItemDragStart}
                  handleItemDragEnd={handleItemDragEnd}
                />
              );
            })}
          </AnimatePresence>
        </div>
      </Reorder.Group>
    </div>
  );
}
