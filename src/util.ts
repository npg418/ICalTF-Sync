import { Type } from "typebox";

export const Weekdays = Type.Union([
  Type.Literal("monday"),
  Type.Literal("tuesday"),
  Type.Literal("wednesday"),
  Type.Literal("thursday"),
  Type.Literal("friday"),
]);
export const ISODateString = Type.String({ format: "date" });

export type Weekdays = Type.Static<typeof Weekdays>;
export type ISODateString = Type.Static<typeof ISODateString>;
