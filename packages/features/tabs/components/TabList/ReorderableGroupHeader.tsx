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

  const groupId = item.groupId;
  const groupIdStr = String(groupId);

  const isEditing = activeEditingGroup?.groupId === groupId;
  const isExpanded = !collapsedGroups.has(groupIdStr);

  const title = isEditing ? activeEditingGroup.draftTitle : item.groupTitle;
  const groupColor = isEditing ? activeEditingGroup.draftColor : item.groupColor;

  const handleEdit = (anchorRect: DOMRect) => {
    openEditor({
      groupId,
      anchorRect,
      initialTitle: item.groupTitle ?? "",
      initialColor: item.groupColor ?? "grey",
    });
  };

  return (
    <Reorder.Item
      value={itemKey}
      as="div"
      style={{ marginBottom: itemSpacing }}
      onDragStart={() => handleItemDragStart(item)}
      onDragEnd={handleItemDragEnd}
    >
      <TabGroupHeader
        title={title}
        groupColor={groupColor}
        isExpanded={isExpanded}
        onToggle={() => toggleGroup(groupIdStr)}
        onEdit={handleEdit}
      />
    </Reorder.Item>
  );
}
