import { MouseEventHandler, ReactNode } from "react";
import { Html } from "@packages/utility";
import { Button } from "@packages/ui";

type ActionIconProps = {
  ariaLabel: string;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
};

export function ActionIcon({ ariaLabel, className, onClick, children }: ActionIconProps) {
  return (
    <Button
      aria-label={ariaLabel}
      onClick={onClick}
      className={Html.joinClasses("relative", "cursor-pointer", className)}
    >
      <span
        className={Html.joinClasses(
          "absolute left-1/2 top-1/2 transform -translate-1/2",
          "w-[24px] h-[24px]",
          "rounded",
          "transition-colors duration-200",
          "hover:bg-gray-400/30"
        )}
      />
      <span className="relative pointer-events-none">{children}</span>
    </Button>
  );
}
