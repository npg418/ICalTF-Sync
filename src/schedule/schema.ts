import { type Static, Type } from "typebox";

const Weekdays = Type.Union([
  Type.Literal("Monday"),
  Type.Literal("Tuesday"),
  Type.Literal("Wednesday"),
  Type.Literal("Thursday"),
  Type.Literal("Friday"),
]);

const ISODateString = Type.String({ format: "date" });

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
