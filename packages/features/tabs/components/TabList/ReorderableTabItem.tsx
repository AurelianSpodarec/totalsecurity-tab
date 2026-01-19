import type { SessionTab } from "@packages/tab-manager";
import { Reorder } from "motion/react";
import type { EditingTabGroup } from "../../hooks/useTabGroupEdit";
import type { TabListItem } from "../../hooks/useTabReorder";
import { TabItem } from "../TabItem";

type TabItemRow = Extract<TabListItem, { type: "tab" }>;

type ReorderableTabItemProps = {
  itemKey: string;
  item: TabItemRow;
  itemSpacing: number;

  activeEditingGroup: EditingTabGroup | null;

  handleTabClick: (tab: SessionTab) => unknown;
  handleTabPin: (tab: SessionTab) => unknown;
  handleTabClose: (tab: SessionTab) => unknown;

  handleItemDragStart: (item: TabListItem) => void;
  handleItemDragEnd: () => void;
};

export function ReorderableTabItem({
  itemKey,
  item,
  itemSpacing,
  activeEditingGroup,
  handleTabClick,
  handleTabPin,
  handleTabClose,
  handleItemDragStart,
  handleItemDragEnd,
}: ReorderableTabItemProps) {
  const tab = item.tab;

  const displayTab =
    activeEditingGroup?.groupId === tab.groupId
      ? {
          ...tab,
          groupTitle: activeEditingGroup.draftTitle,
          groupColor: activeEditingGroup.draftColor,
        }
      : tab;

  return (
    <Reorder.Item
      value={itemKey}
      as="div"
      style={{
        overflow: "hidden",
        willChange: "height, opacity",
        marginBottom: itemSpacing,
      }}
      initial={{ height: 0, opacity: 0, marginBottom: 0 }}
      animate={{ height: "auto", opacity: 1, marginBottom: itemSpacing }}
      exit={{ height: 0, opacity: 0, marginBottom: 0 }}
      transition={{
        type: "tween",
        ease: "easeInOut",
        height: { duration: 0.12 },
        opacity: { duration: 0.08 },
        marginBottom: { duration: 0.08 },
      }}
      onDragStart={() => handleItemDragStart(item)}
      onDragEnd={() => handleItemDragEnd()}
    >
      <TabItem
        tab={displayTab}
        onClick={() => handleTabClick(tab)}
        onPin={() => handleTabPin(tab)}
        onClose={() => handleTabClose(tab)}
      />
    </Reorder.Item>
  );
}
