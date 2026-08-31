import { GET as getJobs } from "../app/api/jobs/route";
import { GET as getSponsors } from "../app/api/sponsors/route";

const allowedOrigins = new Set([
  "https://12cecilia34.github.io",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

function corsHeaders(request: Request) {
  const origin = request.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "https://12cecilia34.github.io",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function withCors(request: Request, response: Response) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders(request))) headers.set(key, value);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request) });
    if (request.method !== "GET") return withCors(request, Response.json({ error: "Method not allowed" }, { status: 405 }));

    const pathname = new URL(request.url).pathname;
    try {
      if (pathname === "/api/jobs") return withCors(request, await getJobs(request));
      if (pathname === "/api/sponsors") return withCors(request, await getSponsors(request));
      if (pathname === "/health") return withCors(request, Response.json({ ok: true, service: "offer-radar-api" }));
      return withCors(request, Response.json({ error: "Not found" }, { status: 404 }));
    } catch (error) {
      console.error(error);
      return withCors(request, Response.json({ error: "Service temporarily unavailable" }, { status: 503 }));
    }
  },
};
