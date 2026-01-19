import { Html } from "@packages/utility";
import type { TabGroupColor } from "@packages/ext-api";
import { useEffect, useRef } from "react";
import { useShortcut } from "@packages/keyboard";
import { usePopupPosition } from "../../hooks/usePopupPosition";
import { ColorPicker } from "./ColorPicker";
import { PopupOverlay } from "./PopupOverlay";

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

type TabGroupEditPopupProps = {
  groupId: number;
  title: string;
  color: TabGroupColor;
  anchorRect: DOMRect;
  onTitleChange: (title: string) => void;
  onColorChange: (color: TabGroupColor) => void;
  onClose: () => void;
};

export function TabGroupEditPopup({ groupId, title, color, anchorRect, onTitleChange, onColorChange, onClose }: TabGroupEditPopupProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { popupRef, style } = usePopupPosition(anchorRect);

  useShortcut("Escape", onClose, { scope: "modal", allowInInput: true });
  useShortcut("Enter", onClose, {
    scope: "modal",
    allowInInput: true,
    preventDefault: true,
  });

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  return (
    <PopupOverlay onClose={onClose}>
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
        style={style}
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

          <ColorPicker
            colors={TAB_GROUP_COLORS}
            value={color}
            onChange={onColorChange}
          />
        </div>
      </div>
    </PopupOverlay>
  );
}
