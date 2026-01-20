import { MouseEventHandler } from "react";
import {
  Cross2Icon,
  DrawingPinFilledIcon,
  DrawingPinIcon,
} from "@radix-ui/react-icons";
import { ActionIcon } from "./ActionIcon";

type TabItemActionsProps = {
  pinned: boolean;
  active: boolean;
  onPin: MouseEventHandler<HTMLButtonElement>;
  onClose: MouseEventHandler<HTMLButtonElement>;
};

type PinActionIconProps = {
  pinned: boolean;
  active: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>;
};

function PinActionIcon({ pinned, active, onClick }: PinActionIconProps) {
  const ariaLabel = pinned ? "Unpin tab" : "Pin tab";
  const Icon = pinned ? DrawingPinFilledIcon : DrawingPinIcon;
  const className = pinned && !active ? "text-blue-500" : "text-white";

  return (
    <ActionIcon
      ariaLabel={ariaLabel}
      aria-pressed={pinned}
      className={className}
      onClick={onClick}
    >
      <Icon />
    </ActionIcon>
  );
}

export function TabItemActions({ pinned, active, onPin, onClose }: TabItemActionsProps) {
  return (
    <div className="flex gap-3" role="group" aria-label="Tab actions">
      <PinActionIcon pinned={pinned} active={active} onClick={onPin} />
      <ActionIcon ariaLabel="Close tab" onClick={onClose}>
        <Cross2Icon />
      </ActionIcon>
    </div>
  );
}
