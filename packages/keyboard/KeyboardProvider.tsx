import React, { createContext, useCallback, useEffect, useMemo, useRef } from "react";
import type { ParsedKeyCombo, RegisteredShortcut } from "./types";

export type RegisterShortcutArgs = Omit<RegisteredShortcut, "id" | "order">;

type KeyboardContextValue = {
  registerShortcut: (shortcut: RegisterShortcutArgs) => () => void;
};

export const KeyboardContext = createContext<KeyboardContextValue | null>(null);

function normalizeKeyName(raw: string): string {
  const key = raw.trim().toLowerCase();
  if (key === "esc") return "escape";
  if (key === "return") return "enter";
  if (key === "space") return " ";
  return key;
}

function isApplePlatform(): boolean {
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = nav.userAgentData?.platform ?? navigator.platform;

  return /(mac|iphone|ipad|ipod)/i.test(platform);
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  if (target.isContentEditable) return true;

  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;

  const role = target.getAttribute("role");
  if (role === "textbox" || role === "searchbox") return true;

  return false;
}

function scopeRank(scope: string): number {
  if (scope === "modal") return 2;
  if (scope === "global") return 0;
  return 1;
}

function matchesCombo(e: KeyboardEvent, combo: ParsedKeyCombo, isMac: boolean): boolean {
  const eventKey = normalizeKeyName(e.key);
  if (eventKey !== combo.key) return false;

  const requiresCtrl = combo.ctrl || (combo.mod && !isMac);
  const requiresMeta = combo.meta || (combo.mod && isMac);

  return (
    e.altKey === combo.alt &&
    e.shiftKey === combo.shift &&
    e.ctrlKey === requiresCtrl &&
    e.metaKey === requiresMeta
  );
}

export function KeyboardProvider({ children }: { children: React.ReactNode }) {
  const shortcutsRef = useRef(new Map<string, RegisteredShortcut>());
  const orderRef = useRef(0);
  const isMacRef = useRef<boolean | null>(null);

  const registerShortcut = useCallback((shortcut: RegisterShortcutArgs) => {
    const id = globalThis.crypto?.randomUUID?.() ?? `kbd_${Date.now()}_${orderRef.current}`;
    const order = ++orderRef.current;

    shortcutsRef.current.set(id, {
      ...shortcut,
      id,
      order,
    });

    return () => {
      shortcutsRef.current.delete(id);
    };
  }, []);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    if (shortcutsRef.current.size === 0) return;

    if (isMacRef.current == null) {
      isMacRef.current = isApplePlatform();
    }

    const isMac = isMacRef.current;

    let best: RegisteredShortcut | null = null;

    for (const shortcut of shortcutsRef.current.values()) {
      if (!shortcut.allowRepeat && e.repeat) continue;
      if (!shortcut.allowInInput && isEditableTarget(e.target)) continue;

      const matched = shortcut.combos.some((combo) => matchesCombo(e, combo, isMac));
      if (!matched) continue;

      if (!best) {
        best = shortcut;
        continue;
      }

      const byPriority = shortcut.priority - best.priority;
      if (byPriority !== 0) {
        if (byPriority > 0) best = shortcut;
        continue;
      }

      const byScope = scopeRank(String(shortcut.scope)) - scopeRank(String(best.scope));
      if (byScope !== 0) {
        if (byScope > 0) best = shortcut;
        continue;
      }

      if (shortcut.order > best.order) {
        best = shortcut;
      }
    }

    if (!best) return;

    if (best.preventDefault) e.preventDefault();
    if (best.stopPropagation) e.stopPropagation();

    best.handler(e);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [onKeyDown]);

  const value = useMemo<KeyboardContextValue>(() => ({ registerShortcut }), [registerShortcut]);

  return <KeyboardContext.Provider value={value}>{children}</KeyboardContext.Provider>;
}
