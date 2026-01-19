import { useContext, useEffect, useMemo, useRef } from "react";
import { KeyboardContext } from "./KeyboardProvider";
import type { ParsedKeyCombo, ShortcutHandler, ShortcutOptions } from "./types";

type ShortcutKeys = string | string[];

function normalizeKeyName(raw: string): string {
  const key = raw.trim().toLowerCase();
  if (key === "esc") return "escape";
  if (key === "return") return "enter";
  if (key === "space") return " ";
  return key;
}

function parseKeyCombo(combo: string): ParsedKeyCombo {
  const parts = combo
    .split("+")
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);

  if (parts.length === 0) {
    throw new Error(`Invalid shortcut: "${combo}"`);
  }

  const key = normalizeKeyName(parts[parts.length - 1]);

  const parsed: ParsedKeyCombo = {
    key,
    alt: false,
    shift: false,
    ctrl: false,
    meta: false,
    mod: false,
  };

  for (const part of parts.slice(0, -1)) {
    if (part === "alt" || part === "option") parsed.alt = true;
    else if (part === "shift") parsed.shift = true;
    else if (part === "ctrl" || part === "control") parsed.ctrl = true;
    else if (part === "meta" || part === "cmd" || part === "command") parsed.meta = true;
    else if (part === "mod") parsed.mod = true;
    else throw new Error(`Unknown shortcut modifier: "${part}" in "${combo}"`);
  }

  return parsed;
}

function normalizeKeys(keys: ShortcutKeys): string[] {
  return Array.isArray(keys) ? keys : [keys];
}

export function useShortcut(keys: ShortcutKeys, handler: ShortcutHandler, options: ShortcutOptions = {}) {
  const ctx = useContext(KeyboardContext);
  if (!ctx) {
    throw new Error("useShortcut must be used within <KeyboardProvider />");
  }

  const {
    scope = "global",
    priority = 0,
    enabled = true,
    preventDefault = true,
    stopPropagation = false,
    allowInInput = false,
    allowRepeat = false,
  } = options;

  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  const combos = useMemo(() => {
    return normalizeKeys(keys).map(parseKeyCombo);
  }, [keys]);

  useEffect(() => {
    if (!enabled) return;

    return ctx.registerShortcut({
      combos,
      handler: (e) => handlerRef.current(e),
      scope,
      priority,
      preventDefault,
      stopPropagation,
      allowInInput,
      allowRepeat,
    });
  }, [
    ctx,
    combos,
    scope,
    priority,
    enabled,
    preventDefault,
    stopPropagation,
    allowInInput,
    allowRepeat,
  ]);
}
