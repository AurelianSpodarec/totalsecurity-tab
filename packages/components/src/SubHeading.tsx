import { Html } from "@packages/utility";
import { ReactNode } from "react";

type PageSubHeadingProps = {
  children?: ReactNode;
  className?: string;
}

export function SubHeading({ children, className }: PageSubHeadingProps)
{
  return (
    <h1
      className={
        Html.joinClasses(
          // Base
          "text-base",
          // Color
          "text-gray-900 dark:text-white",
          // Spacing
          // "m-0",
          className
        )
      }
    >
      {children}
    </h1>
  )
}
