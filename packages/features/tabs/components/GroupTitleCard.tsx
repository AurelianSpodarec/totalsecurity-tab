import { ChevronDownIcon } from "@radix-ui/react-icons";
import { Html } from "@packages/utility";
import { TabGroupColor } from "@packages/ext-api";

type GroupTitleCardProps = {
  title?: string;
  groupColor?: TabGroupColor;
  isExpanded?: boolean;
  onToggle?: () => void;
  className?: string;
};

export function GroupTitleCard({ title, groupColor, isExpanded = true, onToggle, className }: GroupTitleCardProps) {
  const resolvedTitle = title?.trim() ? title : "";

  return (
    <div
      data-tab-group-color={groupColor}
      className={Html.joinClasses(
        "inline-flex items-center gap-1 self-start",
        "rounded-full",
        "px-3 py-1",
        "text-xs font-medium text-white",
        "select-none cursor-pointer",
        className
      )}
      style={{ backgroundColor: "var(--tab-group-color, #6b7280)" }}
      title={resolvedTitle || "Untitled group"}
      onClick={onToggle}
    >
      <ChevronDownIcon
        className={Html.joinClasses(
          "transition-transform duration-200",
          isExpanded ? "rotate-0" : "-rotate-90"
        )}
        aria-hidden
      />
      <span className="truncate max-w-[150px]">
        {resolvedTitle || "\u2022\u2022\u2022"}
      </span>
    </div>
  );
}
