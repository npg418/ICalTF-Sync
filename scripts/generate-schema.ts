import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { ScheduleSchema } from "../src/schema/schedule";

const outPath = resolve("src/schedule/schema.json");

await mkdir(dirname(outPath), { recursive: true });

await writeFile(
  outPath,
  `
  ${JSON.stringify(
    {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      ...ScheduleSchema,
    },
    null,
    2,
  )}\n`,
  "utf-8",
);
