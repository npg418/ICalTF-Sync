import { SCHEDULE_DATA, SUPPORTED_YEARS } from "./schedule/schedules";

function isSupportedYear(year: string): year is (typeof SUPPORTED_YEARS)[number] {
  return SUPPORTED_YEARS.includes(year as (typeof SUPPORTED_YEARS)[number]);
}

export default {
  async fetch(request, _env, _ctx): Promise<Response> {
    const url = new URL(request.url);
    const params = url.searchParams;
    const classIds = params.get("classIds");
    const year = params.get("year") ?? "2026";

    if (!classIds) {
      return new Response("'classIds' クエリパラメータは必須です。", {
        status: 400,
      });
    }

    if (!isSupportedYear(year)) {
      return new Response(
        `対応していない年です。対応している年: ${SUPPORTED_YEARS.join(", ")}`,
        { status: 400 }
      );
    }

    const data = SCHEDULE_DATA[year];
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  },
} satisfies ExportedHandler<Env>;
