import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> { }

export function Button(props: ButtonProps): React.ReactElement {
  const {
    type = "button",
    disabled = false,
    className = "",
    children,
    ...rest
  } = props;

  return (
    <button
      type={type}
      disabled={disabled}
      className={className}
      {...rest}
    >
      {children}
    </button>
  );
}
