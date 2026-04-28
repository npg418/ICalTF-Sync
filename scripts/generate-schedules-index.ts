import { readdirSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const dataDir = resolve("src/schedule/data");
const outPath = resolve("src/schedule/schedules.ts");

const files = readdirSync(dataDir).filter((file) => file.endsWith(".json"));

const schedules = files
  .map((file) => {
    const year = file.replace(".json", "");
    return { year };
  })
  .sort((a, b) => a.year.localeCompare(b.year));

const supportedYears = schedules.map((s) => s.year);
const importsCode = schedules
  .map((s) => `import schedule${s.year} from './data/${s.year}.json';`)
  .join("\n");

const mapCode = `
${importsCode}

export const SUPPORTED_YEARS = [${supportedYears.map((y) => `"${y}"`).join(", ")}] as const;

export type SupportedYear = typeof SUPPORTED_YEARS[number];

export const SCHEDULE_DATA: Record<SupportedYear, unknown> = {
${schedules.map((s) => `  "${s.year}": schedule${s.year}`).join(",\n")}
};
`;

await mkdir(dirname(outPath), { recursive: true });
await writeFile(outPath, mapCode, "utf-8");
