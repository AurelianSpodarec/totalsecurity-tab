import { MouseEventHandler } from "react";
import { Cross2Icon, DrawingPinFilledIcon, DrawingPinIcon } from "@radix-ui/react-icons";
import { ActionIcon } from "./ActionIcon";

type TabActionsProps = {
  pinned: boolean;
  active: boolean;
  onPin: MouseEventHandler<HTMLButtonElement>;
  onClose: MouseEventHandler<HTMLButtonElement>;
};

export function TabActions({ pinned, active, onPin, onClose }: TabActionsProps) {
  return (
    <span className="flex gap-3">
      <ActionIcon
        ariaLabel={pinned ? "Unpin tab" : "Pin tab"}
        className={pinned && !active ? "text-blue-500" : "text-white"}
        onClick={onPin}
      >
        {pinned ? <DrawingPinFilledIcon /> : <DrawingPinIcon />}
      </ActionIcon>
      <ActionIcon ariaLabel="Close tab" onClick={onClose}>
        <Cross2Icon />
      </ActionIcon>
    </span>
  );
}
