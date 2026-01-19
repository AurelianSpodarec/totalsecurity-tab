import { Pencil1Icon } from "@radix-ui/react-icons";
import { Html } from "@packages/utility";
import { TabGroupColor } from "@packages/ext-api";
import { useRef } from "react";
import { Button } from "@packages/components";

type TabGroupHeaderProps = {
  title?: string;
  groupColor?: TabGroupColor;
  isExpanded?: boolean;
  onToggle?: () => void;
  onEdit?: (anchorRect: DOMRect) => void;
  className?: string;
};

export function TabGroupHeader({
  title,
  groupColor,
  isExpanded = true,
  onToggle,
  onEdit,
  className,
}: TabGroupHeaderProps) {
  const resolvedTitle = title?.trim() ? title : "";
  const rootRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={rootRef}
      data-tab-group-color={groupColor}
      className={Html.joinClasses(
        "group",
        "inline-flex items-center gap-1 self-start",
        "text-xs font-medium",
        "select-none cursor-pointer",
        className
      )}
      title={resolvedTitle || "Untitled group"}
      onClick={onToggle}
    >
      <Button
        aria-hidden
        className={Html.joinClasses(
          "shrink-0",
          "transition-transform duration-200",
          "text-gray-200",
          "size-4",
          isExpanded ? "rotate-0" : "-rotate-90"
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="block"
        >
          <path d="M11.646 15.146 5.854 9.354a.5.5 0 0 1 .353-.854h11.586a.5.5 0 0 1 .353.854l-5.793 5.792a.5.5 0 0 1-.707 0" />
        </svg>
      </Button>

      <div
        className={Html.joinClasses(
          "inline-flex items-center gap-1",
          "rounded-md px-3 py-1"
        )}
        style={{
          backgroundColor:
            "var(--tab-group-bg, var(--tab-group-color, #6b7280))",
          color: "var(--tab-group-text, #111827)",
        }}
      >
        <span className="truncate max-w-[150px]">
          {resolvedTitle || "\u2022\u2022\u2022"}
        </span>

        {onEdit && (
          <Button
            aria-label="Edit group"
            className={Html.joinClasses(
              "ml-1 p-1 rounded transition-colors hover:bg-black/10"
            )}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              const rect = rootRef.current?.getBoundingClientRect();
              if (!rect) return;
              onEdit(rect);
            }}
          >
            <Pencil1Icon aria-hidden className="size-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
