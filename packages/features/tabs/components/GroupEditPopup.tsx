import { Html } from "@packages/utility";
import type { TabGroupColor } from "@packages/ext-api";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

const TAB_GROUP_COLORS: TabGroupColor[] = [
  "grey",
  "blue",
  "red",
  "yellow",
  "green",
  "pink",
  "purple",
  "cyan",
  "orange",
];

type GroupEditPopupProps = {
  groupId: number;
  title: string;
  color: TabGroupColor;
  anchorRect: DOMRect;
  onTitleChange: (title: string) => void;
  onColorChange: (color: TabGroupColor) => void;
  onClose: () => void;
};

export function GroupEditPopup({
  groupId,
  title,
  color,
  anchorRect,
  onTitleChange,
  onColorChange,
  onClose,
}: GroupEditPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const computePosition = useCallback(() => {
    const el = popupRef.current;
    if (!el) return;

    const viewportPadding = 8;

    const popupWidth = el.offsetWidth || 320;
    const popupHeight = el.offsetHeight || 0;

    let left = anchorRect.left;
    left = Math.max(viewportPadding, Math.min(left, window.innerWidth - popupWidth - viewportPadding));

    let top = anchorRect.bottom + 8;
    const wouldOverflowBottom = top + popupHeight > window.innerHeight - viewportPadding;
    if (wouldOverflowBottom) {
      top = Math.max(viewportPadding, anchorRect.top - popupHeight - 8);
    }

    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  }, [anchorRect.left, anchorRect.top, anchorRect.bottom]);

  useLayoutEffect(() => {
    computePosition();
  }, [computePosition]);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  useEffect(() => {
    const onResize = () => computePosition();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [computePosition]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50" onMouseDown={onClose}>
      <div
        ref={popupRef}
        className={Html.joinClasses(
          "absolute",
          "w-[290px] max-w-[calc(90vw-16px)]",
          "rounded-md",
          "bg-gray-700 dark:bg-gray-700",
          "shadow-lg",
          "p-2",
          "text-white"
        )}
        style={{ top: anchorRect.bottom + 8, left: anchorRect.left }}
        role="dialog"
        aria-modal="true"
        aria-label={`Edit tab group ${groupId}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-2">

          <input
            ref={inputRef}
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Group name"
            className={Html.joinClasses(
              "flex-1",
              "w-full",
              "bg-transparent",
              "outline-none",
              "text-sm",
              "px-2 py-1",
              "mb-2",
              "rounded",
              "focus:bg-gray-600/40"
            )}
          />
          <div className="flex items-center gap-2 flex-wrap justify-between">
            {TAB_GROUP_COLORS.map((c) => {
              const selected = c === color;
              return (
                <button
                  key={c}
                  type="button"
                  data-tab-group-color={c}
                  className={Html.joinClasses(
                    "w-5 h-5",
                    "rounded-full",
                    "border",
                    selected ? "border-white" : "border-white/20",
                    "transition-transform",
                    selected ? "scale-110" : "scale-100"
                  )}
                  style={{ backgroundColor: "var(--tab-group-color)" }}
                  onClick={() => onColorChange(c)}
                  aria-label={`Set group color to ${c}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
