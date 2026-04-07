import { RuleConfigSeverity, type UserConfig } from "@commitlint/types";

export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "subject-case": [
      RuleConfigSeverity.Disabled,
      "never",
      ["sentence-case", "start-case", "pascal-case", "upper-case"],
    ],
  },
} satisfies UserConfig;
