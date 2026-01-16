import { resolve } from "path";
import fs from "fs";

export function copyManifest()
{
  return {
    name: "ext:manifest",
    generateBundle()
    {
      const manifest = JSON.parse(fs.readFileSync(resolve("manifest.json"), "utf-8"));
      const packageJson = JSON.parse(fs.readFileSync(resolve("package.json"), "utf-8"));
      manifest.version = packageJson.version;

      this.emitFile({
        type: "asset",
        fileName: "manifest.json",
        source: JSON.stringify(manifest, null, 2)
      });
    }
  };
}
