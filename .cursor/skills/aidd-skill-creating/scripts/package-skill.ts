#!/usr/bin/env bun
import { createWriteStream, existsSync, statSync } from "node:fs";
import { basename, resolve } from "node:path";
import archiver from "archiver";

import { validateSkill } from "./validate.ts";

const EXCLUDE_PATTERNS = [
  "node_modules/**",
  "package.json",
  "tsconfig.json",
  "bun.lockb",
  "bun.lock",
];

export interface PackageResult {
  message: string;
  outputPath: string | null;
  success: boolean;
}

export async function packageSkill(
  skillPath: string,
  outputDir?: string,
): Promise<PackageResult> {
  const resolved = resolve(skillPath);

  if (!existsSync(resolved)) {
    return {
      message: `Skill folder not found: ${resolved}`,
      outputPath: null,
      success: false,
    };
  }

  if (!statSync(resolved).isDirectory()) {
    return {
      message: `Path is not a directory: ${resolved}`,
      outputPath: null,
      success: false,
    };
  }

  // Validate first
  const validation = validateSkill(resolved);
  if (!validation.valid) {
    return {
      message: `Validation failed: ${validation.message}`,
      outputPath: null,
      success: false,
    };
  }

  const skillName = basename(resolved);
  const outDir = outputDir ? resolve(outputDir) : process.cwd();
  const outputPath = resolve(outDir, `${skillName}.skill`);

  return new Promise((res) => {
    const output = createWriteStream(outputPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
      res({
        message: `Successfully packaged skill to: ${outputPath}`,
        outputPath,
        success: true,
      });
    });

    archive.on("error", (err) => {
      res({
        message: `Error creating .skill file: ${err}`,
        outputPath: null,
        success: false,
      });
    });

    archive.pipe(output);

    archive.glob(
      "**/*",
      {
        cwd: resolved,
        dot: false,
        ignore: EXCLUDE_PATTERNS,
      },
      { prefix: skillName },
    );

    archive.finalize();
  });
}

// CLI entry point
if (import.meta.main) {
  if (process.argv.length < 3) {
    console.log(
      "Usage: bun package-skill.ts <path/to/skill-folder> [output-directory]",
    );
    process.exit(1);
  }

  const skillPath = process.argv[2];
  const outputDir = process.argv[3];

  console.log(`Packaging skill: ${skillPath}\n`);

  const result = await packageSkill(skillPath, outputDir);
  console.log(result.message);
  process.exit(result.success ? 0 : 1);
}
