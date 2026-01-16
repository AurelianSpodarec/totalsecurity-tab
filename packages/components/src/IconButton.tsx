import { MouseEventHandler, ReactNode } from "react";
import { Html } from "@packages/utility";

type IconButtonProps = {
  className?: string,
  onClick?: MouseEventHandler<HTMLButtonElement>,
  children: ReactNode
}

export function IconButton({ className, onClick, children }: IconButtonProps)
{
  return (
    <button
      onClick={onClick}
      className={Html.joinClasses(
        // Base
        "relative",
        // Cursor
        "cursor-pointer",
        className
      )}
    >
      <span
        className={Html.joinClasses(
          // Position
          "absolute left-1/2 top-1/2 transform -translate-1/2",
          // Size
          "w-[24px] h-[24px]",
          // Shape
          "rounded",
          // Transition
          "transition-colors duration-200",
          // Color
          "hover:bg-gray-400/30",
        )}
      />
      <span className={"relative pointer-events-none"}>
        {children}
      </span>
    </button>
  )
}
