import type { TabGroupColor } from "@packages/tab-manager";
import { Reorder } from "motion/react";
import type { TabListItem } from "../../hooks/useTabReorder";
import type { EditingTabGroup } from "../../hooks/useTabGroupEdit";
import { TabGroupHeader } from "../TabGroup";

type GroupItem = Extract<TabListItem, { type: "group" }>;

type ReorderableGroupHeaderProps = {
  itemKey: string;
  item: GroupItem;
  itemSpacing: number;

  collapsedGroups: Set<string>;
  toggleGroup: (groupId: string) => void;

  activeEditingGroup: EditingTabGroup | null;
  openEditor: (args: {
    groupId: number;
    anchorRect: DOMRect;
    initialTitle: string;
    initialColor: TabGroupColor;
  }) => void;

  handleItemDragStart: (item: TabListItem) => void;
  handleItemDragEnd: () => void;
};

export function ReorderableGroupHeader({
  itemKey,
  item,
  itemSpacing,
  collapsedGroups,
  toggleGroup,
  activeEditingGroup,
  openEditor,
  handleItemDragStart,
  handleItemDragEnd,
}: ReorderableGroupHeaderProps) {
  const groupIdStr = String(item.groupId);
  const isExpanded = !collapsedGroups.has(groupIdStr);

  const title =
    activeEditingGroup?.groupId === item.groupId
      ? activeEditingGroup.draftTitle
      : item.groupTitle;

  const groupColor =
    activeEditingGroup?.groupId === item.groupId
      ? activeEditingGroup.draftColor
      : item.groupColor;

  return (
    <Reorder.Item
      value={itemKey}
      as="div"
      style={{ marginBottom: itemSpacing }}
      onDragStart={() => handleItemDragStart(item)}
      onDragEnd={() => handleItemDragEnd()}
    >
      <TabGroupHeader
        title={title}
        groupColor={groupColor}
        isExpanded={isExpanded}
        onToggle={() => toggleGroup(groupIdStr)}
        onEdit={(anchorRect) => {
          openEditor({
            groupId: item.groupId,
            anchorRect,
            initialTitle: item.groupTitle ?? "",
            initialColor: item.groupColor ?? "grey",
          });
        }}
      />
    </Reorder.Item>
  );
}
