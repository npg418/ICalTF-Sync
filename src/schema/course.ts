import { Type } from "typebox";
import { Modules, Seasons, Weekdays } from "./util";

const WeeklyScheduleSchema = Type.Partial(
  Type.Record(
    Weekdays,
    Type.Array(
      Type.Union([
        Type.Literal(1),
        Type.Literal(2),
        Type.Literal(3),
        Type.Literal(4),
        Type.Literal(5),
        Type.Literal(6),
      ]),
      { minItems: 1, uniqueItems: true },
    ),
    { minProperties: 1 },
  ),
);

const SemesterScheduleSchema = Type.Object({
  semester: Type.Union([
    Type.Partial(
      Type.Record(
        Seasons,
        Type.Array(Modules, {
          minItems: 1,
          maxItems: 3,
          uniqueItems: true,
        }),
        { minProperties: 1 },
      ),
    ),
    Type.Literal("all-year"),
  ]),
  period: WeeklyScheduleSchema,
});

export const CourseDataSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  periods: Type.Array(SemesterScheduleSchema, { minItems: 1 }),
});

export type CourseData = Type.Static<typeof CourseDataSchema>;
