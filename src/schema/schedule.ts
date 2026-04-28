import { type Static, Type } from "typebox";
import { ISODateString, Modules, Seasons, Weekdays } from "./util";

const ModuleSchema = Type.Object({
  start: ISODateString,
  end: ISODateString,
  backupDays: Type.Array(ISODateString),
  holidays: Type.Optional(Type.Array(ISODateString)),
  dowOverrides: Type.Optional(Type.Record(ISODateString, Weekdays)),
});

const ABCModulesSchema = Type.Record(Modules, ModuleSchema);

export const ScheduleSchema = Type.Record(Seasons, ABCModulesSchema);

export type Schedule = Static<typeof ScheduleSchema>;
