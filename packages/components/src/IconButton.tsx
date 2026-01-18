import { MouseEventHandler, ReactNode } from "react";
import { Html } from "@packages/utility";

type IconButtonProps = {
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
};

export function IconButton({ className, onClick, children }: IconButtonProps) {
  return (
    <button
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
      <span className={"relative pointer-events-none"}>{children}</span>
    </button>
  );
}
