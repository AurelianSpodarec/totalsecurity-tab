import { ChevronDownIcon, Pencil1Icon } from "@radix-ui/react-icons";
import { Html } from "@packages/utility";
import { TabGroupColor } from "@packages/ext-api";
import { useRef } from "react";

type GroupTitleCardProps = {
  title?: string;
  groupColor?: TabGroupColor;
  isExpanded?: boolean;
  onToggle?: () => void;
  onEdit?: (anchorRect: DOMRect) => void;
  className?: string;
};

export function GroupTitleCard({
  title,
  groupColor,
  isExpanded = true,
  onToggle,
  onEdit,
  className,
}: GroupTitleCardProps) {
  const resolvedTitle = title?.trim() ? title : "";
  const rootRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={rootRef}
      data-tab-group-color={groupColor}
      className={Html.joinClasses(
        "group",
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

      {onEdit && (
        <button
          type="button"
          aria-label="Edit group"
          className={Html.joinClasses(
            "ml-1",
            "p-1",
            "rounded",
            "opacity-0 group-hover:opacity-100",
            "transition-opacity transition-colors",
            "hover:bg-white/20"
          )}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            const rect = rootRef.current?.getBoundingClientRect();
            if (!rect) return;
            onEdit(rect);
          }}
        >
          <Pencil1Icon aria-hidden />
        </button>
      )}
    </div>
  );
}
