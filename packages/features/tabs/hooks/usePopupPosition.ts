import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";

type PopupPositionOptions = {
  offset?: number;
  viewportPadding?: number;
};

export function usePopupPosition(anchorRect: DOMRect, options: PopupPositionOptions = {}) {
  const { offset = 8, viewportPadding = 8 } = options;

  const popupRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>(() => ({
    top: anchorRect.bottom + offset,
    left: anchorRect.left,
  }));

  const computePosition = useCallback(() => {
    const el = popupRef.current;
    if (!el) return;

    const popupWidth = el.offsetWidth || 320;
    const popupHeight = el.offsetHeight || 0;

    let left = anchorRect.left;
    left = Math.max(
      viewportPadding,
      Math.min(left, window.innerWidth - popupWidth - viewportPadding)
    );

    let top = anchorRect.bottom + offset;
    const wouldOverflowBottom = top + popupHeight > window.innerHeight - viewportPadding;
    if (wouldOverflowBottom) {
      top = Math.max(viewportPadding, anchorRect.top - popupHeight - offset);
    }

    setStyle({ left, top });
  }, [anchorRect.bottom, anchorRect.left, anchorRect.top, offset, viewportPadding]);

  useLayoutEffect(() => {
    computePosition();
  }, [computePosition]);

  useEffect(() => {
    const onResize = () => computePosition();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [computePosition]);

  useEffect(() => {
    const el = popupRef.current;
    if (!el) return;
    if (typeof ResizeObserver === "undefined") return;

    const ro = new ResizeObserver(() => computePosition());
    ro.observe(el);
    return () => ro.disconnect();
  }, [computePosition]);

  return { popupRef, style };
}
