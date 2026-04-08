import schedule2026 from "./data/2026.json";

export const SUPPORTED_YEARS = ["2026"] as const;

export type SupportedYear = (typeof SUPPORTED_YEARS)[number];

export const SCHEDULE_DATA: Record<SupportedYear, unknown> = {
  "2026": schedule2026,
};
