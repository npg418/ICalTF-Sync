import { Type } from "typebox";

export const Weekdays = Type.Union([
  Type.Literal("Monday"),
  Type.Literal("Tuesday"),
  Type.Literal("Wednesday"),
  Type.Literal("Thursday"),
  Type.Literal("Friday"),
]);
export const ISODateString = Type.String({ format: "date" });

export type Weekdays = Type.Static<typeof Weekdays>;
export type ISODateString = Type.Static<typeof ISODateString>;
