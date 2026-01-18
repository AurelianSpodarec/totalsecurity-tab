import React from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  type = "button",
  disabled = false,
  className = "",
  children,
  ...rest
}: ButtonProps) {
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
