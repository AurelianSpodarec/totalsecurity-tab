import * as fs from "node:fs";
import * as path from "node:path";

const repoRoot = path.resolve(__dirname, "../../..");

const THEME_IDS = ["light", "midnight", "mocha", "total-security"] as const;
type ThemeId = (typeof THEME_IDS)[number];

function readUtf8(filePath: string): string {
  return fs.readFileSync(filePath, { encoding: "utf8" });
}

function extractTokenContractVars(contractCss: string): string[] {
  const tokens = new Set<string>();

  // Contract tokens are documented as comment lines like: /* --tmit-foo */
  const tokenPattern = /\/\*\s*(--tmit-[a-z0-9-]+)\s*\*\//gi;
  let match: RegExpExecArray | null = null;

  while ((match = tokenPattern.exec(contractCss)) !== null) {
    tokens.add(match[1]);
  }

  return Array.from(tokens).sort();
}

function extractDefinedThemeVars(cssText: string): string[] {
  const tokens = new Set<string>();

  // We only validate theme tokens (prefixed with --tmit-), not arbitrary custom properties.
  const definitionPattern = /(--tmit-[a-z0-9-]+)\s*:/gi;
  let match: RegExpExecArray | null = null;

  while ((match = definitionPattern.exec(cssText)) !== null) {
    tokens.add(match[1]);
  }

  return Array.from(tokens).sort();
}

function extractImports(indexCss: string): string[] {
  const imports: string[] = [];
  const importPattern = /@import\s+"([^"]+)"\s*;/g;
  let match: RegExpExecArray | null = null;

  while ((match = importPattern.exec(indexCss)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

function getThemeDir(themeId: ThemeId): string {
  return path.join(repoRoot, "css", "1-tokens", `theme-${themeId}`);
}

function getThemeComponentsDir(themeId: ThemeId): string {
  return path.join(getThemeDir(themeId), "components");
}

function getThemeIndexPath(themeId: ThemeId): string {
  return path.join(getThemeDir(themeId), "index.css");
}

describe("Theme token CSS", () => {
  const contractCss = readUtf8(path.join(repoRoot, "css", "1-tokens", "global", "_token-contract.css"));
  const contractTokens = extractTokenContractVars(contractCss);

  it("has a non-empty token contract", () => {
    expect(contractTokens.length).toBeGreaterThan(0);
  });

  describe("CSS theme tokens are consistent with the token contract", () => {
    for (const themeId of THEME_IDS) {
      it(`theme-${themeId} defines exactly the contract tokens`, () => {
        const componentsDir = getThemeComponentsDir(themeId);
        const componentFiles = fs
          .readdirSync(componentsDir)
          .filter((file) => file.endsWith(".css"))
          .map((file) => path.join(componentsDir, file));

        const combinedCss = componentFiles.map(readUtf8).join("\n");
        const definedTokens = extractDefinedThemeVars(combinedCss);

        const contractSet = new Set(contractTokens);
        const definedSet = new Set(definedTokens);

        const missing = contractTokens.filter((token) => !definedSet.has(token));
        const extras = definedTokens.filter((token) => !contractSet.has(token));

        expect({ missing, extras }).toEqual({ missing: [], extras: [] });
      });
    }
  });

  describe("Theme entrypoints import component partials", () => {
    for (const themeId of THEME_IDS) {
      it(`theme-${themeId} tokens correctly import component partials`, () => {
        const componentsDir = getThemeComponentsDir(themeId);
        const componentPartials = fs
          .readdirSync(componentsDir)
          .filter((file) => file.endsWith(".css"))
          .map((file) => `./components/${file}`)
          .sort();

        const indexCss = readUtf8(getThemeIndexPath(themeId));
        const imports = Array.from(new Set(extractImports(indexCss))).sort();

        expect(imports).toEqual(componentPartials);
      });
    }
  });
});
