import React from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  type = "button",
  disabled = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}
