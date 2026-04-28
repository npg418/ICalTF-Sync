import { updateCourseDataCache } from "./courses";
import { SCHEDULE_DATA, SUPPORTED_YEARS } from "./schedule/schedules";

function isSupportedYear(
  year: string,
): year is (typeof SUPPORTED_YEARS)[number] {
  return SUPPORTED_YEARS.includes(year as (typeof SUPPORTED_YEARS)[number]);
}

export default {
  async fetch(request, env, _ctx): Promise<Response> {
    const url = new URL(request.url);
    const params = url.searchParams;
    const classIds = params
      .get("classIds")
      ?.split(",")
      .map((id) => id.trim());
    const year = params.get("year") ?? "2026";

    if (!classIds) {
      return new Response("'classIds' クエリパラメータは必須です。", {
        status: 400,
      });
    }

    if (!isSupportedYear(year)) {
      return new Response(
        `対応していない年です。対応している年: ${SUPPORTED_YEARS.join(", ")}`,
        { status: 400 },
      );
    }

    const schedule = SCHEDULE_DATA[year];
    const courses = await env.COURSE_DATA.get(classIds);
    return new Response(JSON.stringify(courses), {
      headers: { "Content-Type": "application/json" },
    });
  },
  async scheduled(_controller, env, _ctx) {
    const year = new Date().getFullYear();
    if (isSupportedYear(year.toString())) {
      await updateCourseDataCache(year, env);
    }
  },
} satisfies ExportedHandler<Env>;
