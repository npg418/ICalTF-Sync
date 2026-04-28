import { Type } from "typebox";

export const Seasons = Type.Union([
  Type.Literal("spring"),
  Type.Literal("fall"),
]);

export const Modules = Type.Union([
  Type.Literal("A"),
  Type.Literal("B"),
  Type.Literal("C"),
]);

export const Weekdays = Type.Union([
  Type.Literal("monday"),
  Type.Literal("tuesday"),
  Type.Literal("wednesday"),
  Type.Literal("thursday"),
  Type.Literal("friday"),
]);

export const ISODateString = Type.String({ format: "date" });

export type Seasons = Type.Static<typeof Seasons>;
export type Modules = Type.Static<typeof Modules>;
export type Weekdays = Type.Static<typeof Weekdays>;
export type ISODateString = Type.Static<typeof ISODateString>;
