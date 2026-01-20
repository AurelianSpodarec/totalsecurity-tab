export type KeyboardModifier = "alt" | "shift" | "ctrl" | "meta" | "mod";

export type KeyAliasMap = Record<string, string>;
export type ModifierAliasMap = Record<string, KeyboardModifier>;

export type EditableTargetConfig = {
  tags: readonly string[];
  roles: readonly string[];
};

export type ScopeRankMap = Record<string, number>;

export type ModResolvesMeta = boolean | "auto";

export type KeyboardConfig = {
  keyAliases: KeyAliasMap;
  modifierAliases: ModifierAliasMap;
  editableTargets: EditableTargetConfig;
  scopeRanks: ScopeRankMap;
  defaultScopeRank: number;
  applePlatformPattern: RegExp;

  /**
   * Determines how `mod` is interpreted.
   * - "auto": meta on Apple platforms, ctrl elsewhere
   * - true: always meta
   * - false: always ctrl
   */
  modResolvesMeta: ModResolvesMeta;
};

export const defaultKeyboardConfig: KeyboardConfig = {
  keyAliases: {
    esc: "escape",
    return: "enter",
    space: " ",
  },
  modifierAliases: {
    alt: "alt",
    option: "alt",

    shift: "shift",

    ctrl: "ctrl",
    control: "ctrl",

    meta: "meta",
    cmd: "meta",
    command: "meta",

    mod: "mod",
  },
  editableTargets: {
    tags: ["INPUT", "TEXTAREA", "SELECT"],
    roles: ["textbox", "searchbox"],
  },
  scopeRanks: {
    global: 0,
    modal: 2,
  },
  defaultScopeRank: 1,
  applePlatformPattern: /(mac|iphone|ipad|ipod)/i,
  modResolvesMeta: "auto",
};

/**
 * Normalizes a raw key to a stable name that can be compared against parsed combos.
 *
 * Notes:
 * - We intentionally do *not* trim a literal space key (" "), because trimming would lose the value.
 * - Callers that parse human-entered strings should trim before passing values in.
 */
export function normalizeKeyName(raw: string, keyAliases: KeyAliasMap): string {
  if (raw === " ") return " ";

  const key = raw.trim().toLowerCase();
  return keyAliases[key] ?? key;
}

export function createKeyboardConfig(overrides: Partial<KeyboardConfig> = {}): KeyboardConfig {
  const editableTargets = overrides.editableTargets
    ? {
        tags: overrides.editableTargets.tags ?? defaultKeyboardConfig.editableTargets.tags,
        roles: overrides.editableTargets.roles ?? defaultKeyboardConfig.editableTargets.roles,
      }
    : defaultKeyboardConfig.editableTargets;

  return {
    ...defaultKeyboardConfig,
    ...overrides,
    keyAliases: { ...defaultKeyboardConfig.keyAliases, ...overrides.keyAliases },
    modifierAliases: { ...defaultKeyboardConfig.modifierAliases, ...overrides.modifierAliases },
    editableTargets,
    scopeRanks: { ...defaultKeyboardConfig.scopeRanks, ...overrides.scopeRanks },
    defaultScopeRank: overrides.defaultScopeRank ?? defaultKeyboardConfig.defaultScopeRank,
    applePlatformPattern: overrides.applePlatformPattern ?? defaultKeyboardConfig.applePlatformPattern,
    modResolvesMeta: overrides.modResolvesMeta ?? defaultKeyboardConfig.modResolvesMeta,
  };
}
