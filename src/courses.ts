import Schema from "typebox/schema";
import { parse } from "web-csv-toolbox";
import { type CourseData, CourseDataSchema } from "./schema/course";
import type { Weekdays } from "./schema/util";

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
): AsyncGenerator<CourseData | string> {
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
      hdnReqName:
        "%E5%AD%A6%E7%BE%A4%E9%96%8B%E8%A8%AD%E6%8E%88%E6%A5%AD%E7%A7%91%E7%9B%AE%E4%B8%80%E8%A6%A7",
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
  const CompiledSchema = Schema.Compile(CourseDataSchema);

  for await (const record of parse(response.body, { charset, header })) {
    const { id, name, semester, period } = record;
    if (!id || !name || !semester || !period) {
      continue;
    }
    try {
      const courseData = {
        id,
        name,
        periods: parsePeriods(semester, period),
      };
      yield CompiledSchema.Parse(courseData);
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
