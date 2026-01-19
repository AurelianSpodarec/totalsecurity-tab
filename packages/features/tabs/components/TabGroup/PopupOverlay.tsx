import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Html } from "@packages/utility";

type PopupOverlayProps = {
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

export function PopupOverlay({ onClose, children, className }: PopupOverlayProps) {
  return createPortal(
    <div
      className={Html.joinClasses("fixed inset-0 z-50", className)}
      onMouseDown={onClose}
    >
      {children}
    </div>,
    document.body
  );
}
