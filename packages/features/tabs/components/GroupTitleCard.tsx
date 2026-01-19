import { Html } from "@packages/utility";
import { TabGroupColor } from "@packages/ext-api";

type GroupTitleCardProps = {
  title?: string;
  groupColor?: TabGroupColor;
  className?: string;
};

export function GroupTitleCard({ title, groupColor, className }: GroupTitleCardProps) {
  const resolvedTitle = title?.trim() ? title : "";

  return (
    <div
      data-tab-group-color={groupColor}
      className={Html.joinClasses(
        "inline-flex items-center self-start",
        "rounded-full",
        "px-3 py-1",
        "text-xs font-medium text-white",
        "select-none cursor-grab",
        className
      )}
      style={{ backgroundColor: "var(--tab-group-color, #6b7280)" }}
      title={resolvedTitle || "Untitled group"}
    >
      <span className="truncate max-w-[150px]">
        {resolvedTitle || "\u2022\u2022\u2022"}
      </span>
    </div>
  );
}
