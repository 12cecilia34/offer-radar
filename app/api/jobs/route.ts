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

const syncKey = "live-job-feeds-v2";

const roleSignals = [
  "strategy", "operations", "operation", "growth", "product", "commercial", "business analyst",
  "data analyst", "analytics", "insights", "ecommerce", "e-commerce", "commerce", "marketing",
  "consultant", "consulting", "graduate", "new grad", "associate", "customer success", "risk", "fraud",
  "运营", "策略", "增长", "产品", "商业分析", "数据分析", "电商", "直播", "市场", "咨询",
];

const campaignJobs: Array<Omit<FeedJob, "fetchedAt">> = [
  {
    id: "campaign:bytedance:2027-campus",
    company: "TikTok / ByteDance",
    role: "2027届校园招聘｜运营及非产研岗位",
    country: "中国",
    city: "北京 / 上海 / 杭州 / 深圳等",
    track: "电商 / 产品 / 策略运营",
    source: "企业官网 / 官方招聘公众号",
    sourceUrl: "https://jobs.bytedance.com/campus/position",
    description: "字节跳动2027届校园招聘项目。官网岗位持续更新，并通过“字节跳动招聘”公众号同步校招动态；具体职位与投递状态以官网为准。",
    postedAt: "2026-08-03T00:00:00.000Z",
    sponsorQuery: null,
  },
  {
    id: "campaign:alibaba:2027-campus",
    company: "Alibaba",
    role: "2027届校园招聘｜大消费与AI业务方向",
    country: "中国",
    city: "杭州 / 上海 / 北京等",
    track: "电商 / AI / 业务运营",
    source: "企业校招官网",
    sourceUrl: "https://campus-talent.alibaba.com/campus/gov",
    description: "阿里巴巴2027届校园招聘覆盖16个业务，面向2026年11月至2027年10月毕业生。进入官网后按运营、产品、市场及业务分析等关键词筛选。",
    postedAt: null,
    sponsorQuery: null,
  },
  {
    id: "campaign:oppo:2027-product-operations",
    company: "OPPO",
    role: "互联网产品运营｜2027届校园招聘",
    country: "中国",
    city: "深圳 / 成都",
    track: "产品运营 / AI",
    source: "企业校招官网",
    sourceUrl: "https://careers.oppo.com/university/oppo/campus/post/1859?recruitType=Intern",
    description: "负责软件商店、游戏中心、广告等互联网产品及业务运营，要求具备数据分析、逻辑分析和AI产品理解能力。",
    postedAt: "2026-07-15T00:00:00.000Z",
    sponsorQuery: null,
  },
  {
    id: "campaign:decathlon:2027-ecommerce",
    company: "Decathlon China",
    role: "线上运营主管｜2027届秋季校园招聘",
    country: "中国",
    city: "中国多地",
    track: "电商运营",
    source: "企业官网 / 官方公众号",
    sourceUrl: "https://recruitment.decathlon.com.cn/p/campus.html",
    description: "迪卡侬2027秋招电商事业部线上运营方向，官网同时列出“迪卡侬招聘”微信公众号投递渠道；秋季招聘期为2026年9月1日至11月30日。",
    postedAt: null,
    sponsorQuery: null,
  },
  {
    id: "campaign:tencentmusic:2027-content-operations",
    company: "Tencent Music",
    role: "内容运营｜2027届校园招聘",
    country: "中国",
    city: "深圳等",
    track: "内容运营",
    source: "企业校招官网",
    sourceUrl: "https://join.tencentmusic.com/campus/",
    description: "腾讯音乐娱乐集团2027校园招聘内容运营方向，面向2026年1月至2027年12月毕业的同学，具体开放岗位以官网为准。",
    postedAt: null,
    sponsorQuery: null,
  },
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
  if (value.includes("直播") || value.includes("电商")) return "直播电商 / 电商运营";
  if (value.includes("数据") || value.includes("商业分析")) return "商业分析 / 数据分析";
  if (value.includes("产品")) return "产品运营";
  if (value.includes("增长") || value.includes("市场")) return "用户增长 / 市场运营";
  if (value.includes("策略")) return "策略运营";
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

function parseChineseDate(value?: string) {
  const match = value?.match(/(\d{4})年(\d{2})月(\d{2})日/);
  return match ? `${match[1]}-${match[2]}-${match[3]}T00:00:00.000Z` : null;
}

async function fetchTencent(source: JobSource, fetchedAt: string): Promise<FeedJob[]> {
  const keywords = ["运营", "策略", "分析"];
  const responses = await Promise.all(keywords.map(async (keyword) => {
    const url = new URL("https://careers.tencent.com/tencentcareer/api/post/Query");
    url.searchParams.set("keyword", keyword);
    url.searchParams.set("attrId", "1");
    url.searchParams.set("pageIndex", "1");
    url.searchParams.set("pageSize", "100");
    url.searchParams.set("language", "zh-cn");
    url.searchParams.set("area", "cn");
    const response = await fetch(url, { headers: { accept: "application/json", "user-agent": "OfferRadar/1.0" } });
    if (!response.ok) throw new Error(`Tencent: ${response.status}`);
    return response.json() as Promise<{ Data?: { Posts?: Array<{
      PostId?: string; RecruitPostName?: string; CountryName?: string; LocationName?: string; CategoryName?: string;
      Responsibility?: string; Requirement?: string; RequireWorkYearsName?: string; LastUpdateTime?: string; PostURL?: string;
    }> } }>;
  }));

  const deduped = new Map<string, FeedJob>();
  for (const data of responses) {
    for (const job of data.Data?.Posts ?? []) {
      const id = job.PostId?.trim();
      const title = job.RecruitPostName?.trim() ?? "";
      const earlyCareer = !job.RequireWorkYearsName || /不限|应届|实习/.test(job.RequireWorkYearsName);
      if (!id || !title || !earlyCareer || !relevantRole(title)) continue;
      deduped.set(id, {
        id: `tencent:${id}`,
        company: source.company,
        role: title,
        country: "中国",
        city: job.LocationName || "中国",
        track: inferTrack(`${title} ${job.CategoryName ?? ""}`),
        source: "腾讯官方职位接口",
        sourceUrl: (job.PostURL || `https://careers.tencent.com/jobdesc.html?postId=${id}`).replace(/^http:/, "https:"),
        description: `${job.Responsibility ?? ""} ${job.Requirement ?? ""}`.trim(),
        postedAt: parseChineseDate(job.LastUpdateTime),
        sponsorQuery: null,
        fetchedAt,
      });
    }
  }
  return [...deduped.values()];
}

async function refreshJobs() {
  const db = getDb();
  const fetchedAt = new Date().toISOString();
  const liveSources = jobSources.filter((source) => source.provider !== "official");
  const settled = await Promise.allSettled(liveSources.map((source) => {
    if (source.provider === "greenhouse") return fetchGreenhouse(source, fetchedAt);
    if (source.provider === "lever") return fetchLever(source, fetchedAt);
    return fetchTencent(source, fetchedAt);
  }));
  const freshJobs = [
    ...settled.flatMap((result) => result.status === "fulfilled" ? result.value : []),
    ...campaignJobs.map((job) => ({ ...job, fetchedAt })),
  ];

  for (const job of freshJobs) {
    await db.insert(jobs).values(job).onConflictDoUpdate({ target: jobs.id, set: job });
  }

  await db.insert(syncRuns).values({ sourceKey: syncKey, syncedAt: fetchedAt, jobCount: freshJobs.length }).onConflictDoUpdate({
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
  const sync = await db.select().from(syncRuns).where(eq(syncRuns.sourceKey, syncKey)).limit(1);
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
    targetCompanies: selectedSources.length + campaignJobs.filter((job) => countries.includes(job.country)).filter((job) => !selectedSources.some((source) => source.company === job.company)).length,
    liveSources: selectedSources.filter((source) => source.provider !== "official").length,
    discoverySources: campaignJobs.filter((job) => countries.includes(job.country)).length,
    totalCompanies: jobSources.length,
    totalLiveSources: liveSourceCount,
  });
}
