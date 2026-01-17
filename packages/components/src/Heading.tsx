import { Html } from "@packages/utility";
import { ReactNode } from "react";

type PageHeadingProps = {
  children?: ReactNode;
}

export function Heading({ children }: PageHeadingProps)
{
  return (
    <h1
      className={
        Html.joinClasses(
          "text-2xl font-semibold",
          "text-gray-900 dark:text-white",
        )
      }
    >
      {children}
    </h1>
  )
}
