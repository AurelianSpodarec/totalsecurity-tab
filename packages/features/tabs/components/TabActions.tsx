import { MouseEventHandler } from "react";
import { Cross2Icon, DrawingPinFilledIcon, DrawingPinIcon } from "@radix-ui/react-icons";
import { IconButton } from "@packages/components";

type TabActionsProps = {
  pinned: boolean;
  active: boolean;
  onPin: MouseEventHandler<HTMLButtonElement>;
  onClose: MouseEventHandler<HTMLButtonElement>;
};

export function TabActions({ pinned, active, onPin, onClose }: TabActionsProps) {
  return (
    <span className="flex gap-3">
      <IconButton
        className={pinned && !active ? "text-blue-500" : "text-white"}
        onClick={onPin}
      >
        {pinned ? <DrawingPinFilledIcon /> : <DrawingPinIcon />}
      </IconButton>
      <IconButton onClick={onClose}>
        <Cross2Icon />
      </IconButton>
    </span>
  );
}
