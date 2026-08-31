import { desc, eq, inArray } from "drizzle-orm";
import { getDb } from "../../../db";
import { jobs, syncRuns } from "../../../db/schema";
import { jobSources, liveSourceCount, type JobSource, type TargetCountry } from "../../../lib/job-sources";

type FeedJob = {
  id: string;
  company: string;
  role: string;
  country: TargetCountry;
  city: string;
  track: string;
  source: string;
  sourceUrl: string;
  description: string;
  postedAt: string | null;
  sponsorQuery: string | null;
  fetchedAt: string;
};

const roleSignals = [
  "strategy", "operations", "operation", "growth", "product", "commercial", "business analyst",
  "data analyst", "analytics", "insights", "ecommerce", "e-commerce", "commerce", "marketing",
  "consultant", "consulting", "graduate", "new grad", "associate", "customer success", "risk", "fraud",
];

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/&nbsp;|&#160;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}

function relevantRole(title: string) {
  const value = title.toLowerCase();
  return roleSignals.some((signal) => value.includes(signal));
}

function targetLocation(location: string, country: TargetCountry) {
  const value = location.toLowerCase();
  if (country === "英国") {
    return ["london", "united kingdom", "uk", "manchester", "birmingham", "cardiff", "edinburgh", "glasgow", "remote - uk", "remote uk"].some((term) => value.includes(term));
  }
  if (country === "加拿大") {
    return ["canada", "toronto", "vancouver", "montreal", "ottawa", "calgary", "waterloo", "remote - canada", "remote canada"].some((term) => value.includes(term));
  }
  return ["china", "shanghai", "beijing", "shenzhen", "hangzhou", "guangzhou", "中国", "上海", "北京", "深圳", "杭州", "广州"].some((term) => value.includes(term));
}

function inferTrack(title: string) {
  const value = title.toLowerCase();
  if (value.includes("data") || value.includes("analytics") || value.includes("insight")) return "BA / DA";
  if (value.includes("product")) return "Product Operations";
  if (value.includes("growth") || value.includes("marketing")) return "Growth";
  if (value.includes("consult")) return "Consulting";
  if (value.includes("risk") || value.includes("fraud")) return "FinTech Risk";
  if (value.includes("commercial") || value.includes("strategy")) return "Strategy";
  return "Operations";
}

async function fetchGreenhouse(source: JobSource, fetchedAt: string): Promise<FeedJob[]> {
  const response = await fetch(`https://boards-api.greenhouse.io/v1/boards/${source.token}/jobs?content=true`, {
    headers: { accept: "application/json", "user-agent": "OfferRadar/1.0" },
  });
  if (!response.ok) throw new Error(`Greenhouse ${source.company}: ${response.status}`);
  const data = (await response.json()) as { jobs?: Array<{ id: number; title: string; absolute_url: string; updated_at?: string; location?: { name?: string }; content?: string }> };
  return (data.jobs ?? []).filter((job) => relevantRole(job.title) && targetLocation(job.location?.name ?? "", source.country)).map((job) => ({
    id: `greenhouse:${source.token}:${job.id}`,
    company: source.company,
    role: job.title,
    country: source.country,
    city: job.location?.name || source.country,
    track: inferTrack(job.title),
    source: "Greenhouse 官方职位流",
    sourceUrl: job.absolute_url,
    description: stripHtml(job.content ?? ""),
    postedAt: job.updated_at ?? null,
    sponsorQuery: source.sponsorQuery ?? null,
    fetchedAt,
  }));
}

async function fetchLever(source: JobSource, fetchedAt: string): Promise<FeedJob[]> {
  const response = await fetch(`https://api.lever.co/v0/postings/${source.token}?mode=json`, {
    headers: { accept: "application/json", "user-agent": "OfferRadar/1.0" },
  });
  if (!response.ok) throw new Error(`Lever ${source.company}: ${response.status}`);
  const data = (await response.json()) as Array<{
    id: string; text: string; hostedUrl: string; createdAt?: number; descriptionPlain?: string;
    additionalPlain?: string; categories?: { location?: string; team?: string };
  }>;
  return data.filter((job) => relevantRole(job.text) && targetLocation(job.categories?.location ?? "", source.country)).map((job) => ({
    id: `lever:${source.token}:${job.id}`,
    company: source.company,
    role: job.text,
    country: source.country,
    city: job.categories?.location || source.country,
    track: inferTrack(`${job.text} ${job.categories?.team ?? ""}`),
    source: "Lever 官方职位流",
    sourceUrl: job.hostedUrl,
    description: `${job.descriptionPlain ?? ""} ${job.additionalPlain ?? ""}`.trim(),
    postedAt: job.createdAt ? new Date(job.createdAt).toISOString() : null,
    sponsorQuery: source.sponsorQuery ?? null,
    fetchedAt,
  }));
}

async function refreshJobs() {
  const db = getDb();
  const fetchedAt = new Date().toISOString();
  const liveSources = jobSources.filter((source) => source.provider !== "official");
  const settled = await Promise.allSettled(liveSources.map((source) =>
    source.provider === "greenhouse" ? fetchGreenhouse(source, fetchedAt) : fetchLever(source, fetchedAt),
  ));
  const freshJobs = settled.flatMap((result) => result.status === "fulfilled" ? result.value : []);

  for (const job of freshJobs) {
    await db.insert(jobs).values(job).onConflictDoUpdate({ target: jobs.id, set: job });
  }

  await db.insert(syncRuns).values({ sourceKey: "live-job-feeds", syncedAt: fetchedAt, jobCount: freshJobs.length }).onConflictDoUpdate({
    target: syncRuns.sourceKey,
    set: { syncedAt: fetchedAt, jobCount: freshJobs.length },
  });
  return { freshJobs, syncedAt: fetchedAt, failedSources: settled.filter((result) => result.status === "rejected").length };
}

export async function GET(request: Request) {
  const db = getDb();
  const params = new URL(request.url).searchParams;
  const requestedCountries = params.get("countries")?.split(",").filter(Boolean) as TargetCountry[] | undefined;
  const countries = requestedCountries?.length ? requestedCountries : (["中国", "英国", "加拿大"] as TargetCountry[]);
  const sync = await db.select().from(syncRuns).where(eq(syncRuns.sourceKey, "live-job-feeds")).limit(1);
  const lastSync = sync[0]?.syncedAt ? Date.parse(sync[0].syncedAt) : 0;
  let syncInfo: { syncedAt?: string; failedSources?: number } = { syncedAt: sync[0]?.syncedAt };

  if (!lastSync || Date.now() - lastSync > 24 * 60 * 60 * 1000) {
    syncInfo = await refreshJobs();
  }

  const rows = await db.select().from(jobs).where(inArray(jobs.country, countries)).orderBy(desc(jobs.postedAt)).limit(240);
  const selectedSources = jobSources.filter((source) => countries.includes(source.country));
  return Response.json({
    jobs: rows,
    syncedAt: syncInfo.syncedAt,
    failedSources: syncInfo.failedSources ?? 0,
    targetCompanies: selectedSources.length,
    liveSources: selectedSources.filter((source) => source.provider !== "official").length,
    totalCompanies: jobSources.length,
    totalLiveSources: liveSourceCount,
  });
}
