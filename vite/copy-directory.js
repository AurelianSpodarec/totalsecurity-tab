import { cpSync, mkdirSync } from "fs";
import { join, dirname } from "path";

/**
 * @param from string
 * @param to string
 * @returns {{name: string, writeBundle(*): void}}
 */
export function copyDirectory(from, to)
{
  return {
    name: "ext:copy-dir",
    writeBundle(options)
    {
      const outDir = options.dir || "dist";
      const dest = join(outDir, to);

      try
      {
        mkdirSync(dirname(dest), { recursive: true });
        cpSync(from, dest, { recursive: true });
      }
      catch (error)
      {
        console.error(`Failed to copy directory:`, error);
      }
    }
  };
}
