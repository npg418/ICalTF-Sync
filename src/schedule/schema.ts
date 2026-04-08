import { type Static, Type } from "typebox";
import { ISODateString, Weekdays } from "../util";

const ModuleSchema = Type.Object({
  start: ISODateString,
  end: ISODateString,
  backupDays: Type.Array(ISODateString),
  holidays: Type.Optional(Type.Array(ISODateString)),
  dowOverrides: Type.Optional(Type.Record(ISODateString, Weekdays)),
});

const ABCModulesSchema = Type.Object({
  A: ModuleSchema,
  B: ModuleSchema,
  C: ModuleSchema,
});

export const ScheduleSchema = Type.Object({
  spring: ABCModulesSchema,
  autumn: ABCModulesSchema,
});

export type Schedule = Static<typeof ScheduleSchema>;
