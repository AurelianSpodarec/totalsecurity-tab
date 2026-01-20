import { useRef, MouseEvent } from "react";
import { Pencil1Icon } from "@radix-ui/react-icons";
import { Button } from "@packages/components";
import { Html } from "@packages/utility";
import type { TabGroupColor } from "@packages/tab-manager";

type TabGroupHeaderProps = {
  title?: string;
  groupColor?: TabGroupColor;
  isExpanded?: boolean;
  onToggle?: () => void;
  onEdit?: (anchorRect: DOMRect) => void;
  className?: string;
};

type GroupChevronProps = {
  expanded: boolean;
};

function GroupChevron({ expanded }: GroupChevronProps) {
  return (
    <span
      aria-hidden
      className={Html.joinClasses(
        "shrink-0",
        "size-4",
        // Darker in light mode so it doesn't disappear against a white background.
        "text-gray-700 dark:text-gray-200",
        "transition-transform duration-200",
        expanded ? "rotate-0" : "-rotate-90"
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
    </span>
  );
}

export function TabGroupHeader({ title, groupColor, isExpanded = true, onToggle, onEdit, className }: TabGroupHeaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const resolvedTitle = title?.trim() || "";

  const handleToggle = () => {
    onToggle?.();
  };

  const handleEditPointerDown = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
  };

  const handleEditClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const rect = rootRef.current?.getBoundingClientRect();
    if (rect) onEdit?.(rect);
  };

  return (
    <div
      ref={rootRef}
      data-tab-group-color={groupColor}
      title={resolvedTitle || "Untitled group"}
      className={Html.joinClasses(
        "group",
        "flex w-full min-w-0 items-center gap-1",
        "text-xs font-medium",
        "select-none cursor-pointer",
        className
      )}
      onClick={handleToggle}
    >
      <Button
        aria-hidden
        className={Html.joinClasses(
          "inline-flex items-center justify-center",
          "shrink-0",
          "p-1",
          "rounded",
          "transition-colors",
          "hover:bg-black/10 dark:hover:bg-white/10"
        )}
      >
        <GroupChevron expanded={isExpanded} />
      </Button>

      <div
        className={Html.joinClasses(
          // Keep the row full-width, but keep the "pill" sized to its content.
          "inline-flex min-w-0 max-w-[70%] items-center justify-start gap-1",
          "rounded-md px-3 py-1"
        )}
        style={{
          backgroundColor:"var(--tab-group-bg, var(--tab-group-color, #6b7280))",
          color: "var(--tab-group-text, #111827)",
        }}
      >
        <span className="truncate min-w-0 flex-1 text-left">
          {resolvedTitle || ""}
        </span>

        {onEdit && (
          <Button
            aria-label="Edit group"
            className="ml-1 p-1 rounded transition-colors hover:bg-black/10"
            onPointerDown={handleEditPointerDown}
            onClick={handleEditClick}
          >
            <Pencil1Icon aria-hidden className="size-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
