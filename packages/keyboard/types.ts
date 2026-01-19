export type ShortcutScope = "global" | "modal" | (string & {});

export type ShortcutOptions = {
  scope?: ShortcutScope;
  priority?: number;
  enabled?: boolean;

  /** Default: true. */
  preventDefault?: boolean;

  /** Default: false. */
  stopPropagation?: boolean;

  /** Default: false. */
  allowInInput?: boolean;

  /** Default: false. */
  allowRepeat?: boolean;
};

export type ShortcutHandler = (event: KeyboardEvent) => void;

export type ParsedKeyCombo = {
  key: string;
  alt: boolean;
  shift: boolean;
  ctrl: boolean;
  meta: boolean;
  mod: boolean;
};

export type RegisteredShortcut = {
  id: string;
  combos: ParsedKeyCombo[];
  handler: ShortcutHandler;

  scope: ShortcutScope;
  priority: number;

  preventDefault: boolean;
  stopPropagation: boolean;
  allowInInput: boolean;
  allowRepeat: boolean;

  order: number;
};
