import { Type } from "typebox";
import Schema from "typebox/schema";
import { parse } from "web-csv-toolbox";
import { Weekdays } from "./util";

const SemesterSeason = Type.Union([
  Type.Literal("spring"),
  Type.Literal("fall"),
]);
const SemesterModule = Type.Union([
  Type.Literal("A"),
  Type.Literal("B"),
  Type.Literal("C"),
]);

const WeeklySchedule = Type.Partial(
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
    ),
    { minProperties: 1 },
  ),
);

const PeriodData = Type.Object({
  semester: Type.Union([
    Type.Partial(
      Type.Record(
        SemesterSeason,
        Type.Array(SemesterModule, {
          minItems: 1,
          maxItems: 3,
          uniqueItems: true,
        }),
        { minProperties: 1 },
      ),
    ),
    Type.Literal("all-year"),
  ]),
  period: WeeklySchedule,
});

const CourseData = Type.Object({
  id: Type.String(),
  name: Type.String(),
  period: Type.Array(PeriodData, { minItems: 1 }),
});

const header = [
  "id",
  "name",
  "method",
  "credits",
  "gradeLevel",
  "semester",
  "period",
  "instructor",
  "description",
  "remarks",
  "isOpenToNonRegularStudents",
  "applicationRequirements",
  "ignore1",
  "ignore2",
  "englishName",
  "courseCode",
  "requiredCourseNames",
  "lastUpdated",
]; /* "科目番号","科目名","授業方法","単位数","標準履修年次","実施学期","曜時限","担当教員","授業概要","備考","科目等履修生申請可否","申請条件","無視1","無視2","英語(日本語)科目名","科目コード","要件科目名","データ更新日" */

async function* fetchCourses(
  year: number,
): AsyncGenerator<Type.Static<typeof CourseData> | string> {
  const response = await fetch(`https://kdb.tsukuba.ac.jp/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: "kdb-common=jpn%2C200%2C0",
    },
    body: new URLSearchParams({
      action: "downloadList",
      hdnFy: year.toString(),
      cmbDwldtype: "csv",
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch classes for year ${year}: ${response.statusText}`,
    );
  }
  if (!response.body) {
    throw new Error(`Response body is null for year ${year}`);
  }

  const charset =
    response.headers.get("Content-Type")?.match(/charset=([^;]+)/)?.[1] ||
    "shift_jis";

  for await (const record of parse(response.body, { charset, header })) {
    const { id, name, semester, period } = record;
    if (!id || !name || !semester || !period) {
      continue;
    }
    try {
      const courseData = {
        id,
        name,
        period: parsePeriods(semester, period),
      };
      yield Schema.Compile(CourseData).Parse(courseData);
    } catch (_) {
      yield id;
    }
  }
}

const seasonMap: Record<string, "spring" | "fall"> = {
  春: "spring",
  秋: "fall",
};

function parsePeriods(semester: string, period: string): Array<unknown> {
  const semesters = semester.split("\n");
  const periods = period.split("\n");
  if (semesters.length !== periods.length) {
    throw new Error(
      `Mismatched semester and period lengths: ${semesters.length} vs ${periods.length}`,
    );
  }

  const pairs = semesters.map((s, i) => [s, periods[i]] as const);

  return pairs.map(([s, p]) => {
    if (s === "通年") {
      return {
        semester: "all-year",
        period: parsePeriod(p),
      } as const;
    } else {
      const rawSeason = s[0];
      const season = seasonMap[rawSeason];
      const modules = s.slice(1).split("");
      return {
        semester: {
          [season]: modules,
        },
        period: parsePeriod(p),
      };
    }
  });
}

const dayMap: Record<string, Weekdays> = {
  月: "monday",
  火: "tuesday",
  水: "wednesday",
  木: "thursday",
  金: "friday",
};

function parsePeriod(periodStr: string): unknown {
  const dayStr = periodStr[0];
  const timesStr = periodStr.slice(1);

  const day = dayMap[dayStr];

  if (timesStr.includes("-")) {
    const [startStr, endStr] = timesStr.split("-");
    const start = parseInt(startStr, 10);
    const end = parseInt(endStr, 10);
    return {
      [day]: Array.from({ length: end - start + 1 }, (_, i) => start + i),
    };
  } else {
    const times = timesStr.split(",").map((t) => parseInt(t, 10));
    return {
      [day]: times,
    };
  }
}

export async function updateCourseDataCache(
  year: number,
  env: Env,
): Promise<void> {
  for await (const course of fetchCourses(year)) {
    if (typeof course === "string") {
      env.COURSE_DATA.delete(course).catch(() => {
        // Ignore deletion errors
      });
    } else {
      await env.COURSE_DATA.put(course.id, JSON.stringify(course));
    }
  }
}
