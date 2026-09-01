"use client";

import { ChangeEvent, DragEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { jobSources } from "../lib/job-sources";

type Country = "中国" | "英国" | "加拿大";
type Status = "待申请" | "准备中" | "已申请";
type CareerStage = "Graduate / Entry Level" | "Internship" | "Graduate + Internship";
type DashboardView = "radar" | "saved" | "applications";
type MatchDimension = { label: string; score: number; max: number };
type SourceCompany = { company: string; country: Country; careersUrl: string; group?: string; live: boolean; provider: string };

const bundledSourceCompanies: SourceCompany[] = jobSources.map((source) => ({
  company: source.displayName ?? source.company,
  country: source.country,
  careersUrl: source.careersUrl,
  group: source.group ?? (source.country === "中国" ? "热门互联网" : `${source.country}企业`),
  live: source.provider !== "official",
  provider: source.provider === "official" ? "官方招聘入口" : `${source.provider[0].toUpperCase()}${source.provider.slice(1)} 官方职位流`,
}));

type Job = {
  id: string;
  company: string;
  role: string;
  country: Country;
  city: string;
  track: string;
  deadline: string;
  daysLeft: number;
  match: number;
  source: string;
  sourceUrl: string;
  reason: string;
  requirements: string;
  sponsorQuery?: string;
  status: Status;
  fresh?: boolean;
  matchBreakdown?: MatchDimension[];
  missingSignals?: string[];
};

type SearchProfile = {
  countries: Country[];
  roles: string[];
  locations: string;
  needsSponsor: boolean;
  resumeSkills: string[];
  resumeLanguage: "中文" | "英文";
  careerStage: CareerStage;
};

// Keep the ATS implementation available for the future resume-writing workspace,
// but remove it from the current job-discovery flow.
const atsWorkspaceEnabled = false;

const roleCatalog = [
  { label: "直播电商运营", keywords: ["直播", "live commerce", "tiktok shop", "gmv", "主播"] },
  { label: "电商运营", keywords: ["电商", "e-commerce", "ecommerce", "merchant", "商家"] },
  { label: "策略运营", keywords: ["策略", "strategy", "business planning", "战略"] },
  { label: "产品运营", keywords: ["产品运营", "product operations", "product adoption", "产品"] },
  { label: "用户增长", keywords: ["用户增长", "growth", "acquisition", "retention", "转化"] },
  { label: "AI 产品 / 业务运营", keywords: ["ai", "人工智能", "大模型", "llm", "machine learning"] },
  { label: "商业化运营", keywords: ["商业化", "monetization", "revenue", "commercial"] },
  { label: "内容运营", keywords: ["内容运营", "content", "creator", "社区运营"] },
  { label: "商家运营", keywords: ["商家", "merchant", "seller", "account management"] },
  { label: "市场运营", keywords: ["市场", "marketing", "campaign", "品牌"] },
  { label: "数据运营", keywords: ["数据运营", "data analysis", "sql", "dashboard", "指标"] },
  { label: "Strategy & Operations", keywords: ["strategy", "operations", "process improvement", "business planning"] },
  { label: "Product Operations", keywords: ["product operations", "product adoption", "product launch", "customer insights"] },
  { label: "Growth Operations", keywords: ["growth", "acquisition", "retention", "experimentation", "a/b testing"] },
  { label: "Business Analyst", keywords: ["business analyst", "requirements", "process", "stakeholder", "商业分析"] },
  { label: "Data Analyst", keywords: ["data analyst", "sql", "python", "tableau", "power bi", "数据分析"] },
  { label: "Commercial Analyst", keywords: ["commercial", "revenue", "forecast", "market research", "financial modelling"] },
  { label: "FinTech Operations", keywords: ["fintech", "payments", "banking", "financial services", "operations"] },
  { label: "Risk / Fraud Operations", keywords: ["risk", "fraud", "compliance", "kyc", "aml"] },
  { label: "Consulting Analyst", keywords: ["consulting", "client", "case", "recommendations", "problem solving"] },
  { label: "Customer Success / Implementation", keywords: ["customer success", "implementation", "onboarding", "client services"] },
  { label: "Marketing Operations", keywords: ["marketing operations", "campaign", "crm", "lifecycle", "marketing"] },
  { label: "Project / Programme Coordinator", keywords: ["project management", "programme", "program", "coordination", "项目管理"] },
];

function recommendRoles(resume: string) {
  const value = resume.toLowerCase();
  return roleCatalog
    .map((role) => ({ ...role, score: role.keywords.filter((keyword) => value.includes(keyword)).length }))
    .filter((role) => role.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((role) => role.label);
}

const seededJobs: Job[] = [
  {
    id: "seed-1",
    company: "TikTok Shop",
    role: "电商策略运营｜校招",
    country: "中国",
    city: "上海 / 杭州",
    track: "直播电商",
    deadline: "09月05日",
    daysLeft: 5,
    match: 96,
    source: "企业招聘官网",
    sourceUrl: "https://careers.tiktok.com/",
    reason: "与你的 TikTok 直播电商经历高度匹配",
    requirements: "负责直播电商策略运营、商家增长和业务分析；能够使用 SQL 分析 GMV、转化率及核心指标，与产品、销售和市场团队跨部门协作并推动策略落地。",
    status: "准备中",
    fresh: true,
  },
  {
    id: "seed-2",
    company: "美团",
    role: "产品运营｜商业化方向",
    country: "中国",
    city: "北京",
    track: "产品运营",
    deadline: "09月09日",
    daysLeft: 9,
    match: 89,
    source: "企业招聘官网",
    sourceUrl: "https://zhaopin.meituan.com/",
    reason: "电商运营经验可迁移，强调策略与数据闭环",
    requirements: "负责商业化产品运营、用户增长和数据分析，通过用户洞察、A/B 测试和跨部门项目管理提升产品使用率与业务收入。",
    status: "待申请",
  },
  {
    id: "seed-3",
    company: "蚂蚁集团",
    role: "AI 业务策略运营",
    country: "中国",
    city: "杭州",
    track: "AI 运营",
    deadline: "09月12日",
    daysLeft: 12,
    match: 86,
    source: "企业招聘官网",
    sourceUrl: "https://talent.antgroup.com/",
    reason: "AI 赛道 + 策略运营，建议用 Web 项目补强",
    requirements: "关注 AI 产品及市场趋势，制定业务运营策略；具备商业分析、用户研究、项目管理和良好的沟通能力，能够推动 AI 产品商业化。",
    status: "待申请",
    fresh: true,
  },
  {
    id: "seed-4",
    company: "Revolut",
    role: "Strategy & Operations Graduate",
    country: "英国",
    city: "London",
    track: "FinTech Strategy",
    deadline: "09月18日",
    daysLeft: 18,
    match: 84,
    source: "Careers page",
    sourceUrl: "https://www.revolut.com/careers/",
    reason: "国际化运营、数据分析与 FinTech 兴趣均可承接",
    requirements: "We are looking for analytical graduates with experience in strategy, operations, process improvement and stakeholder management. Strong SQL, Excel, problem solving and project management skills are preferred in a fast-paced FinTech environment.",
    sponsorQuery: "Revolut Ltd",
    status: "待申请",
  },
  {
    id: "seed-5",
    company: "Wise",
    role: "Product Operations Graduate",
    country: "英国",
    city: "London",
    track: "Product Operations",
    deadline: "09月21日",
    daysLeft: 21,
    match: 82,
    source: "Careers page",
    sourceUrl: "https://www.wise.jobs/",
    reason: "产品运营主线清晰，语言与跨市场经历是加分项",
    requirements: "Support product operations across international markets. Use customer insights, data analysis, experimentation and cross-functional collaboration to improve operational processes and product adoption.",
    sponsorQuery: "Wise Payments Limited",
    status: "已申请",
  },
  {
    id: "seed-6",
    company: "Deloitte",
    role: "Business & Strategy Analyst",
    country: "英国",
    city: "London / Manchester",
    track: "Consulting",
    deadline: "09月26日",
    daysLeft: 26,
    match: 77,
    source: "Graduate careers",
    sourceUrl: "https://www.deloitte.com/uk/en/careers.html",
    reason: "商业分析背景匹配，需要突出结构化解决问题能力",
    requirements: "Analyse complex business problems, conduct market research and communicate recommendations to clients. Candidates should demonstrate structured problem solving, stakeholder management, teamwork, data analysis and commercial awareness.",
    sponsorQuery: "Deloitte LLP",
    status: "待申请",
  },
  {
    id: "seed-7",
    company: "Shopify",
    role: "Strategy & Operations, Early Career",
    country: "加拿大",
    city: "Toronto / Remote",
    track: "Tech Strategy",
    deadline: "10月02日",
    daysLeft: 32,
    match: 81,
    source: "Careers page",
    sourceUrl: "https://www.shopify.com/careers",
    reason: "电商行业相关度高，可突出商家增长与跨区域运营",
    requirements: "Drive strategic operations for merchants across markets. Experience in e-commerce, business analysis, KPI reporting, process improvement and cross-functional programme delivery is valued.",
    status: "待申请",
    fresh: true,
  },
  {
    id: "seed-8",
    company: "RBC",
    role: "Business Data Analyst, New Grad",
    country: "加拿大",
    city: "Toronto",
    track: "Banking BA / DA",
    deadline: "10月08日",
    daysLeft: 38,
    match: 72,
    source: "Careers page",
    sourceUrl: "https://jobs.rbc.com/ca/en",
    reason: "数据分析背景相关，但应作为海外投递的扩展方向",
    requirements: "Translate business requirements into data-driven insights using SQL, Excel, Python, Tableau or Power BI. Communicate with stakeholders, build reports and support process improvement in financial services.",
    status: "待申请",
  },
];

const countryMeta: Record<Country, { flag: string; label: string }> = {
  中国: { flag: "🇨🇳", label: "中国大陆" },
  英国: { flag: "🇬🇧", label: "英国" },
  加拿大: { flag: "🇨🇦", label: "加拿大" },
};

function deadlineTone(days: number) {
  if (days < 0 || days >= 9999) return "safe";
  if (days <= 7) return "urgent";
  if (days <= 14) return "soon";
  return "safe";
}

const englishMonths: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
};

function deadlineInfo(date: Date) {
  if (Number.isNaN(date.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const daysLeft = Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
  return { label: `${target.getMonth() + 1}月${target.getDate()}日`, daysLeft };
}

function extractDeadline(description: string) {
  const chineseRange = description.match(/(\d{4})年(\d{1,2})月(\d{1,2})日\s*(?:至|到|—|-)\s*(?:(\d{4})年)?(\d{1,2})月(\d{1,2})日/);
  if (chineseRange) {
    return deadlineInfo(new Date(Number(chineseRange[4] || chineseRange[1]), Number(chineseRange[5]) - 1, Number(chineseRange[6])));
  }

  const chineseDeadline = description.match(/(?:申请|投递|报名)?(?:截止|截至)(?:日期|时间)?[^\d]{0,12}(\d{4})[年/-](\d{1,2})[月/-](\d{1,2})日?/);
  if (chineseDeadline) {
    return deadlineInfo(new Date(Number(chineseDeadline[1]), Number(chineseDeadline[2]) - 1, Number(chineseDeadline[3])));
  }

  const englishDeadline = description.match(/(?:closing date|application deadline|apply by|applications? close(?:s)?(?: on)?)[^a-z0-9]{0,20}(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/i);
  if (englishDeadline) {
    return deadlineInfo(new Date(Number(englishDeadline[3]), englishMonths[englishDeadline[2].toLowerCase()], Number(englishDeadline[1])));
  }

  const englishMonthFirst = description.match(/(?:closing date|application deadline|apply by|applications? close(?:s)?(?: on)?)[^a-z0-9]{0,20}(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/i);
  if (englishMonthFirst) {
    return deadlineInfo(new Date(Number(englishMonthFirst[3]), englishMonths[englishMonthFirst[1].toLowerCase()], Number(englishMonthFirst[2])));
  }

  const numericDeadline = description.match(/(?:closing date|application deadline|apply by|applications? close(?:s)?(?: on)?)[^\d]{0,20}(\d{1,2})[/-](\d{1,2})[/-](\d{4})/i);
  if (numericDeadline) {
    return deadlineInfo(new Date(Number(numericDeadline[3]), Number(numericDeadline[2]) - 1, Number(numericDeadline[1])));
  }
  return null;
}

type AtsResult = {
  score: number;
  matched: string[];
  missing: string[];
  checks: { label: string; passed: boolean }[];
  suggestions: string[];
};

type SponsorMatch = {
  organisation: string;
  city: string;
  rating: string;
  route: string;
};

type SponsorCheck = {
  query: string;
  found: boolean;
  skilledWorker: boolean;
  matches: SponsorMatch[];
};

type SponsorApiResponse = {
  sourcePage: string;
  registerDate: string;
  checkedAt: string;
  results: SponsorCheck[];
  error?: string;
};

const atsVocabulary = [
  "strategy",
  "operations",
  "product operations",
  "user growth",
  "e-commerce",
  "live commerce",
  "fintech",
  "business analysis",
  "data analysis",
  "market research",
  "customer insights",
  "process improvement",
  "stakeholder management",
  "project management",
  "cross-functional",
  "commercial awareness",
  "problem solving",
  "financial services",
  "sql",
  "python",
  "excel",
  "tableau",
  "power bi",
  "a/b testing",
  "kpi",
  "gmv",
  "conversion rate",
  "策略运营",
  "产品运营",
  "用户增长",
  "直播电商",
  "商业分析",
  "数据分析",
  "用户洞察",
  "跨部门协作",
  "项目管理",
  "danish",
  "swedish",
  "german",
  "norwegian",
  "finnish",
  "dutch",
  "french",
  "spanish",
  "italian",
  "polish",
  "arabic",
  "japanese",
  "korean",
  "crm",
  "salesforce",
  "hubspot",
  "looker",
  "google analytics",
  "ga4",
  "snowflake",
  "bigquery",
  "dbt",
  "spss",
  "powerpoint",
  "forecasting",
  "budgeting",
  "kyc",
  "aml",
  "compliance",
  "risk management",
  "fraud prevention",
  "payments",
  "banking",
  "consulting",
  "customer success",
  "campaign management",
  "content strategy",
  "creator partnerships",
  "account management",
  "marketplace",
  "merchant operations",
  "seller operations",
  "experimentation",
  "retention",
  "acquisition",
  "segmentation",
  "presentation",
  "communication",
  "客户成功",
  "风险管理",
  "反欺诈",
  "支付",
  "银行",
  "咨询",
  "内容策略",
  "达人运营",
  "商家运营",
  "市场分析",
  "活动运营",
];

function extractResumeSkills(resume: string) {
  const value = resume.toLowerCase();
  return atsVocabulary.filter((term) => value.includes(term)).slice(0, 30);
}

const seniorTitlePattern = /\b(?:senior|sr\.?|lead|principal|staff|manager|director|head|vice president|vp|chief)\b|高级|资深|负责人|总监|经理|主管|专家/i;
const internshipPattern = /\b(?:intern|internship|placement)\b|实习/i;
const graduateSignalPattern = /\b(?:graduate|new grad|entry[ -]level|early career|trainee)\b|2027|校招|应届|管培生|培训生/i;
const entryLevelPattern = /\b(?:junior|associate|analyst|coordinator|assistant)\b/i;
const languageRequirements = ["danish", "swedish", "german", "norwegian", "finnish", "dutch", "french", "spanish", "italian", "polish", "arabic", "japanese", "korean"];

function graduateEligibility(job: Pick<Job, "role" | "requirements">, stage: CareerStage, resumeSignals: string) {
  const title = job.role.toLowerCase();
  const description = job.requirements.toLowerCase();
  const explicitGraduate = graduateSignalPattern.test(title);
  const internship = internshipPattern.test(title);
  const seniorTitle = seniorTitlePattern.test(title);
  const years = [
    ...description.matchAll(/(?:minimum\s+|at least\s+)?(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+(?:relevant\s+|professional\s+|work\s+)?experience/gi),
    ...description.matchAll(/(\d+)\s*年(?:以上)?(?:相关)?工作经验/g),
  ]
    .map((match) => Number(match[1]))
    .filter(Number.isFinite);
  const requiredYears = years.length ? Math.min(...years) : 0;
  const requiredLanguage = languageRequirements.find((language) => title.includes(language));
  const knowsRequiredLanguage = !requiredLanguage || resumeSignals.toLowerCase().includes(requiredLanguage);

  if (!knowsRequiredLanguage) return { eligible: false, level: "language" as const };
  if ((seniorTitle || requiredYears >= 3) && !explicitGraduate) return { eligible: false, level: "senior" as const };
  if (stage === "Graduate / Entry Level" && internship && !explicitGraduate) return { eligible: false, level: "internship" as const };
  if (stage === "Internship" && !internship) return { eligible: false, level: "graduate" as const };
  return { eligible: true, level: explicitGraduate || internship ? "entry" as const : "unspecified" as const };
}

function resumeStorageKey(language: "中文" | "英文") {
  return `offer-radar-resume-${language === "中文" ? "zh" : "en"}`;
}

const profileStorageKey = "offer-radar-profile";
const jobStatesStorageKey = "offer-radar-job-states";
const defaultApiBaseUrl = "https://offer-radar-api.uceijk2.workers.dev";

type StoredJobState = { saved: boolean; status: Status };

function apiUrl(path: string) {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim();
  const base = (configured || defaultApiBaseUrl).replace(/\/$/, "");
  return `${base}${path}`;
}

function readJobStates(): Record<string, StoredJobState> {
  try {
    return JSON.parse(window.localStorage.getItem(jobStatesStorageKey) ?? "{}") as Record<string, StoredJobState>;
  } catch {
    return {};
  }
}

function saveJobState(jobId: string, patch: Partial<StoredJobState>) {
  try {
    const states = readJobStates();
    states[jobId] = {
      saved: states[jobId]?.saved ?? false,
      status: states[jobId]?.status ?? "待申请",
      ...patch,
    };
    window.localStorage.setItem(jobStatesStorageKey, JSON.stringify(states));
  } catch {
    // The current session still works when browser storage is unavailable.
  }
}

function uniqueTerms(values: string[]) {
  return [...new Set(values.map((value) => value.trim().toLowerCase()).filter((value) => value.length > 1))];
}

function extractEvidenceTerms(value: string) {
  const stopwords = new Set(["ability", "about", "after", "also", "and", "are", "been", "being", "business", "candidates", "company", "experience", "for", "from", "have", "including", "into", "job", "looking", "more", "our", "required", "responsibilities", "role", "skills", "strong", "support", "team", "that", "the", "their", "this", "through", "using", "will", "with", "work", "you", "your", "负责", "岗位", "工作", "相关", "要求", "具备", "以及"]);
  return uniqueTerms(value.toLowerCase().match(/[a-z][a-z0-9+#.-]{2,}/g) ?? []).filter((term) => !stopwords.has(term));
}

function educationLevel(value: string) {
  if (/\b(?:phd|doctorate)\b|博士/i.test(value)) return 4;
  if (/\b(?:master'?s?|msc|ma|mba|meng)\b|硕士|研究生/i.test(value)) return 3;
  if (/\b(?:bachelor'?s?|bsc|ba|beng|undergraduate|degree)\b|本科|学士/i.test(value)) return 2;
  if (/college|university|大学|教育经历/i.test(value)) return 1;
  return 0;
}

function personalisedMatch(
  job: Pick<Job, "role" | "requirements" | "track" | "city" | "country">,
  roles: string[],
  skills: string[],
  resumeText: string,
  preferredLocations: string,
) {
  const haystack = `${job.role} ${job.requirements} ${job.track}`.toLowerCase();
  const resume = `${resumeText} ${skills.join(" ")}`.toLowerCase();
  const selectedRoleKeywords = uniqueTerms(roles.flatMap((selectedRole) => {
    const catalogRole = roleCatalog.find((item) => item.label === selectedRole);
    return [selectedRole, ...(catalogRole?.keywords ?? []), ...selectedRole.split(/[ /&|]+/)];
  }));
  const jobRoleSignals = selectedRoleKeywords.filter((term) => haystack.includes(term));
  const resumeRoleSignals = selectedRoleKeywords.filter((term) => resume.includes(term));
  const requestedSkills = uniqueTerms(atsVocabulary.filter((term) => haystack.includes(term)));
  const matchedSkills = requestedSkills.filter((term) => resume.includes(term));
  const missingSkills = requestedSkills.filter((term) => !resume.includes(term));
  const evidenceTerms = extractEvidenceTerms(`${job.role} ${job.requirements}`)
    .filter((term) => term.length > 3)
    .slice(0, 80);
  const evidenceHits = evidenceTerms.filter((term) => resume.includes(term));
  const hasMetrics = /\b\d+(?:\.\d+)?%|£[\d,.]+|\$[\d,.]+|\b\d+[kKmM]\b|提升|增长|降低|节省/i.test(resumeText);
  const hasActionEvidence = /(led|built|analysed|analyzed|improved|delivered|managed|launched|owned|drove|increased|reduced|负责|推动|搭建|提升|优化|主导)/i.test(resumeText);
  const earlyCareer = graduateSignalPattern.test(job.role) || entryLevelPattern.test(job.role) || internshipPattern.test(job.role);
  const careerScore = earlyCareer ? 15 : 10;
  const roleScore = Math.min(25, (jobRoleSignals.length ? 13 : 3) + Math.min(resumeRoleSignals.length, 4) * 3);
  const skillScore = requestedSkills.length
    ? Math.round(25 * matchedSkills.length / requestedSkills.length)
    : Math.min(15, 7 + Math.min(evidenceHits.length, 8));
  const evidenceCoverage = evidenceTerms.length ? evidenceHits.length / Math.min(evidenceTerms.length, 20) : 0;
  const evidenceScore = Math.min(20, Math.round(Math.min(evidenceCoverage, 1) * 15) + (hasMetrics ? 3 : 0) + (hasActionEvidence ? 2 : 0));
  const resumeEducation = educationLevel(resumeText);
  const requestedEducation = educationLevel(job.requirements);
  const educationScore = requestedEducation ? (resumeEducation >= requestedEducation ? 7 : 0) : (resumeEducation ? 5 : 3);
  const requiredLanguage = languageRequirements.find((language) => haystack.includes(language));
  const languageScore = requiredLanguage ? (resume.includes(requiredLanguage) ? 3 : 0) : 3;
  const educationLanguageScore = educationScore + languageScore;
  const locationText = preferredLocations.toLowerCase();
  const locationScore = locationText.includes(job.city.toLowerCase()) || (job.city.toLowerCase().includes("remote") && /remote|远程/i.test(preferredLocations)) ? 5 : 3;
  const breakdown: MatchDimension[] = [
    { label: "职级", score: careerScore, max: 15 },
    { label: "方向", score: roleScore, max: 25 },
    { label: "技能", score: skillScore, max: 25 },
    { label: "经历证据", score: evidenceScore, max: 20 },
    { label: "教育语言", score: educationLanguageScore, max: 10 },
    { label: "地点", score: locationScore, max: 5 },
  ];
  const score = breakdown.reduce((total, item) => total + item.score, 0);
  const missingSignals = uniqueTerms([...missingSkills, ...evidenceTerms.filter((term) => !resume.includes(term))]).slice(0, 4);
  const reason = resumeText
    ? `完整简历匹配：${matchedSkills.length ? `命中 ${matchedSkills.slice(0, 3).join(" / ")}` : "技能命中较少"}${missingSignals.length ? `；待核验 ${missingSignals.slice(0, 2).join(" / ")}` : "；未发现明显关键词缺口"}`
    : "当前只有技能标签，重新上传简历后才能恢复教育、经历与成果匹配";
  return { score, reason, breakdown, missingSignals };
}

function analyseAts(resume: string, description: string): AtsResult {
  const resumeLower = resume.toLowerCase();
  const descriptionLower = description.toLowerCase();
  const requested = atsVocabulary.filter((term) => descriptionLower.includes(term));
  const matched = requested.filter((term) => resumeLower.includes(term));
  const missing = requested.filter((term) => !resumeLower.includes(term));
  const hasContact = /@[a-z0-9.-]+|linkedin\.com|\+?\d[\d\s()-]{8,}/i.test(resume);
  const hasSections = /(experience|education|skills|工作经历|教育经历|技能)/i.test(resume);
  const hasMetrics = /\b\d+(?:\.\d+)?%|£[\d,.]+|\$[\d,.]+|\b\d+[kKmM]\b|提升|增长/i.test(resume);
  const hasActionLanguage = /(led|built|analysed|analyzed|improved|delivered|managed|launched|负责|推动|搭建|提升|优化)/i.test(resume);
  const checks = [
    { label: "联系方式可被识别", passed: hasContact },
    { label: "存在清晰的经历与教育标题", passed: hasSections },
    { label: "使用数字量化成果", passed: hasMetrics },
    { label: "使用主动、结果导向的动词", passed: hasActionLanguage },
  ];
  const keywordScore = requested.length ? matched.length / requested.length : 0.55;
  const structureScore = checks.filter((check) => check.passed).length / checks.length;
  const lengthScore = resume.length >= 900 && resume.length <= 6500 ? 1 : 0.55;
  const score = Math.round(keywordScore * 65 + structureScore * 25 + lengthScore * 10);
  const suggestions: string[] = [];

  if (missing.length) {
    suggestions.push(`优先在真实经历中补充：${missing.slice(0, 4).join("、")}`);
  }
  if (!hasMetrics) suggestions.push("把职责描述改成带数字的成果，例如提升转化率、GMV 或节省时间");
  if (!hasActionLanguage) suggestions.push("用 Led、Analysed、Improved 等动作动词开头，减少被动职责描述");
  if (!hasSections) suggestions.push("采用 Experience、Education、Skills 等标准英文标题，便于 ATS 解析");
  if (!suggestions.length) suggestions.push("关键词与格式基础较好，下一步针对 JD 调整项目顺序和成果权重");

  return { score, matched, missing, checks, suggestions };
}

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>(() => seededJobs.slice(0, 0));
  const [country, setCountry] = useState<"全部" | Country>("全部");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"match" | "deadline">("match");
  const [saved, setSaved] = useState<string[]>([]);
  const [clientId, setClientId] = useState("");
  const [activeView, setActiveView] = useState<DashboardView>("radar");
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [resumeName, setResumeName] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [parsingResume, setParsingResume] = useState(false);
  const [atsError, setAtsError] = useState("");
  const [atsResult, setAtsResult] = useState<AtsResult | null>(null);
  const [sponsorChecks, setSponsorChecks] = useState<Record<string, SponsorCheck>>({});
  const [sponsorRegisterDate, setSponsorRegisterDate] = useState("");
  const [sponsorLoading, setSponsorLoading] = useState(true);
  const [sponsorSearch, setSponsorSearch] = useState("");
  const [sponsorSearchResult, setSponsorSearchResult] = useState<SponsorCheck | null>(null);
  const [sponsorSearchError, setSponsorSearchError] = useState("");
  const [sponsorSearching, setSponsorSearching] = useState(false);
  const [selectedCountries, setSelectedCountries] = useState<Country[]>(["中国", "英国", "加拿大"]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(["直播电商运营", "电商运营", "策略运营", "Strategy & Operations", "Business Analyst", "Data Analyst"]);
  const [preferredLocations, setPreferredLocations] = useState("上海、杭州、伦敦、多伦多；可接受 Remote");
  const [needsSponsor, setNeedsSponsor] = useState(true);
  const [careerStage, setCareerStage] = useState<CareerStage>("Graduate / Entry Level");
  const [resumeSkills, setResumeSkills] = useState<string[]>([]);
  const [resumeLanguage, setResumeLanguage] = useState<"中文" | "英文">("英文");
  const [customRole, setCustomRole] = useState("");
  const [profileReady, setProfileReady] = useState(false);
  const [editingProfile, setEditingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [radarLoading, setRadarLoading] = useState(false);
  const [radarError, setRadarError] = useState("");
  const [targetCompanyCount, setTargetCompanyCount] = useState(38);
  const [liveSourceCount, setLiveSourceCount] = useState(12);
  const [discoverySourceCount, setDiscoverySourceCount] = useState(0);
  const [lastSyncedAt, setLastSyncedAt] = useState("");
  const [filteredOutCount, setFilteredOutCount] = useState(0);
  const [sourceCompanies, setSourceCompanies] = useState<SourceCompany[]>([]);
  const sourceGroups = useMemo(() => sourceCompanies.reduce<Record<string, SourceCompany[]>>((groups, source) => {
    const group = source.group ?? (source.country === "中国" ? "热门互联网" : `${source.country}企业`);
    (groups[group] ??= []).push(source);
    return groups;
  }, {}), [sourceCompanies]);
  const recommendedRoles = useMemo(() => recommendRoles(resumeText || resumeSkills.join(" ")).slice(0, 6), [resumeText, resumeSkills]);
  const orderedRoleCatalog = useMemo(() => [...roleCatalog].sort((a, b) => {
    const aRank = recommendedRoles.indexOf(a.label);
    const bRank = recommendedRoles.indexOf(b.label);
    if (aRank >= 0 && bRank >= 0) return aRank - bRank;
    if (aRank >= 0) return -1;
    if (bRank >= 0) return 1;
    return 0;
  }), [recommendedRoles]);

  useEffect(() => {
    let id = window.localStorage.getItem("offer-radar-client-id");
    if (!id) {
      id = window.crypto.randomUUID();
      window.localStorage.setItem("offer-radar-client-id", id);
    }
    const timer = window.setTimeout(() => setClientId(id), 0);

    function restoreProfile() {
      try {
        if (window.localStorage.getItem("offer-radar-profile-disabled") === "1") return;
        const storedProfile = window.localStorage.getItem(profileStorageKey);
        if (!storedProfile) return;
        const profile = JSON.parse(storedProfile) as SearchProfile;
        setSelectedCountries(profile.countries);
        setSelectedRoles(profile.roles);
        setPreferredLocations(profile.locations);
        setNeedsSponsor(profile.needsSponsor);
        setResumeSkills(profile.resumeSkills);
        setResumeLanguage(profile.resumeLanguage ?? "英文");
        setCareerStage(profile.careerStage ?? "Graduate / Entry Level");
        try {
          const cachedResume = window.localStorage.getItem(resumeStorageKey(profile.resumeLanguage ?? "英文"));
          if (cachedResume) {
            const parsed = JSON.parse(cachedResume) as { name?: string; text?: string };
            if (parsed.text && parsed.text.length >= 80) {
              setResumeText(parsed.text);
              setResumeName(parsed.name ?? "本浏览器保存的简历文本");
              setResumeSkills((current) => uniqueTerms([...extractResumeSkills(parsed.text!), ...current]).slice(0, 30));
            }
          }
        } catch {
          // A corrupt device-local cache should not block the saved search profile.
        }
        setProfileReady(true);
        setEditingProfile(false);
      } catch {
        // A new visitor can still complete the profile if persistence is temporarily unavailable.
      }
    }
    restoreProfile();
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const syncViewFromHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "saved" || hash === "applications" || hash === "radar") {
        setActiveView(hash);
      }
    };
    syncViewFromHash();
    window.addEventListener("hashchange", syncViewFromHash);
    return () => window.removeEventListener("hashchange", syncViewFromHash);
  }, []);

  useEffect(() => {
    if (!clientId || !profileReady || editingProfile) return;
    void loadRadar(selectedCountries);
    // Refresh when the saved search profile changes so restored resume signals and career stage are applied.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [careerStage, clientId, editingProfile, preferredLocations, profileReady, resumeSkills, resumeText, selectedCountries, selectedRoles]);

  useEffect(() => {
    if (country !== "英国" || Object.keys(sponsorChecks).length > 0) return;
    const companies = jobs
      .map((job) => job.sponsorQuery)
      .filter((query): query is string => Boolean(query));
    if (!companies.length) {
      return;
    }
    fetch(apiUrl(`/api/sponsors?companies=${encodeURIComponent(companies.join("|"))}`))
      .then((response) => response.json() as Promise<SponsorApiResponse>)
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setSponsorChecks(
          Object.fromEntries(data.results.map((result) => [result.query, result])),
        );
        setSponsorRegisterDate(data.registerDate);
      })
      .catch(() => setSponsorSearchError("官方名单暂时无法连接，请稍后重试。"))
      .finally(() => setSponsorLoading(false));
  }, [country, jobs, sponsorChecks]);

  const filteredJobs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return jobs
      .filter((job) => country === "全部" || job.country === country)
      .filter((job) => activeView !== "saved" || saved.includes(job.id))
      .filter((job) => activeView !== "applications" || job.status !== "待申请")
      .filter((job) =>
        [job.company, job.role, job.track, job.city]
          .join(" ")
          .toLowerCase()
          .includes(normalized),
      )
      .sort((a, b) => {
        if (sort === "match") return b.match - a.match;
        const aDeadline = a.daysLeft >= 0 && a.daysLeft < 9999 ? a.daysLeft : Number.MAX_SAFE_INTEGER;
        const bDeadline = b.daysLeft >= 0 && b.daysLeft < 9999 ? b.daysLeft : Number.MAX_SAFE_INTEGER;
        return aDeadline - bDeadline || b.match - a.match;
      });
  }, [activeView, country, jobs, query, saved, sort]);
  const knownDeadlineCount = useMemo(() => jobs.filter((job) => job.daysLeft < 9999).length, [jobs]);
  const hasActiveRadar = profileReady && Boolean(resumeText || resumeSkills.length);

  async function loadRadar(countries: Country[]) {
    setRadarLoading(true);
    setRadarError("");
    try {
      const jobsResponse = await fetch(apiUrl(`/api/jobs?countries=${encodeURIComponent(countries.join(","))}`));
      if (!jobsResponse.ok) throw new Error("radar unavailable");
      const jobsData = (await jobsResponse.json()) as {
        jobs: Array<{
          id: string; company: string; role: string; country: Country; city: string; track: string;
          source: string; sourceUrl: string; description: string; postedAt?: string | null; sponsorQuery?: string | null;
        }>;
        targetCompanies: number; liveSources: number; discoverySources?: number; syncedAt?: string; sources?: SourceCompany[];
      };
      const nextStates = readJobStates();
      setSaved(Object.entries(nextStates).filter(([, state]) => state.saved).map(([jobId]) => jobId));
      const resumeSignals = `${resumeText} ${resumeSkills.join(" ")}`;
      const eligibleJobs = jobsData.jobs.filter((job) => graduateEligibility({ role: job.role, requirements: job.description }, careerStage, resumeSignals).eligible);
      setFilteredOutCount(jobsData.jobs.length - eligibleJobs.length);
      setJobs(eligibleJobs.map((job) => {
        const parsedDeadline = extractDeadline(job.description);
        const base = {
          ...job,
          deadline: parsedDeadline?.label ?? "官网为准",
          daysLeft: parsedDeadline?.daysLeft ?? 9999,
          requirements: job.description,
          reason: "",
          sponsorQuery: job.sponsorQuery ?? undefined,
          status: nextStates[job.id]?.status ?? "待申请" as Status,
          fresh: job.postedAt ? Date.now() - Date.parse(job.postedAt) < 7 * 24 * 60 * 60 * 1000 : false,
          match: 0,
        };
        const match = personalisedMatch(base, selectedRoles, resumeSkills, resumeText, preferredLocations);
        return { ...base, match: match.score, reason: match.reason, matchBreakdown: match.breakdown, missingSignals: match.missingSignals };
      }));
      const selectedBundledSources = bundledSourceCompanies.filter((source) => countries.includes(source.country));
      const apiOnlyCompanyCount = Math.max(0, jobsData.targetCompanies - (jobsData.sources?.length ?? 0));
      setTargetCompanyCount(selectedBundledSources.length + apiOnlyCompanyCount);
      setLiveSourceCount(jobsData.liveSources);
      setDiscoverySourceCount(jobsData.discoverySources ?? 0);
      setSourceCompanies(selectedBundledSources);
      setLastSyncedAt(jobsData.syncedAt ?? "");
    } catch {
      setRadarError("真实岗位源暂时无法同步，请稍后重新扫描。");
      setJobs([]);
    } finally {
      setRadarLoading(false);
    }
  }

  function toggleSaved(id: string) {
    const nextSaved = !saved.includes(id);
    setSaved((current) => nextSaved ? [...current, id] : current.filter((item) => item !== id));
    saveJobState(id, { saved: nextSaved });
  }

  function openDashboardView(view: DashboardView) {
    if (!hasActiveRadar) {
      setActiveView("radar");
      openProfileBuilder();
      return;
    }
    setActiveView(view);
    setShowSources(false);
    window.setTimeout(() => {
      const panel = document.getElementById("radar-panel");
      panel?.scrollIntoView({ behavior: "smooth", block: "start" });
      panel?.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
    }, 0);
  }

  function openProfileBuilder() {
    setEditingProfile(true);
    setShowSources(false);
    window.setTimeout(() => document.getElementById("profile-builder")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  function openSources() {
    setShowSources(true);
  }

  function changeStatus(id: string, status: Status) {
    setJobs((current) => current.map((job) => job.id === id ? { ...job, status } : job));
    saveJobState(id, { status });
  }

  async function startScan() {
    if (scanning) return;
    setScanning(true);
    setScanMessage(`正在检查 ${targetCompanyCount} 家目标公司、官方职位接口、校招公告与公众号线索…`);
    await loadRadar(selectedCountries);
    setScanning(false);
    setScanMessage("扫描完成：岗位已去重，并按你的简历与求职意愿重新排序。 ");
  }

  function toggleCountry(item: Country) {
    setSelectedCountries((current) => current.includes(item) ? current.filter((countryItem) => countryItem !== item) : [...current, item]);
  }

  function toggleRole(item: string) {
    setSelectedRoles((current) => current.includes(item) ? current.filter((role) => role !== item) : [...current, item]);
  }

  function addCustomRole() {
    const value = customRole.trim();
    if (!value) return;
    setSelectedRoles((current) => current.some((role) => role.toLowerCase() === value.toLowerCase()) ? current : [...current, value]);
    setCustomRole("");
  }

  function changeResumeLanguage(language: "中文" | "英文") {
    if (language === resumeLanguage) return;
    setResumeLanguage(language);
    try {
      const cachedResume = window.localStorage.getItem(resumeStorageKey(language));
      if (cachedResume) {
        const parsed = JSON.parse(cachedResume) as { name?: string; text?: string };
        const cachedText = parsed.text?.trim() ?? "";
        setResumeName(parsed.name ?? "本浏览器保存的简历文本");
        setResumeText(cachedText);
        setResumeSkills(extractResumeSkills(cachedText));
      } else {
        setResumeName("");
        setResumeText("");
        setResumeSkills([]);
      }
    } catch {
      setResumeName("");
      setResumeText("");
      setResumeSkills([]);
    }
    setAtsResult(null);
    setAtsError("");
  }

  async function saveSearchProfile() {
    if (!clientId || (!resumeText && !resumeSkills.length) || !selectedCountries.length || !selectedRoles.length) {
      setAtsError("请先上传简历，并至少选择一个国家和一个求职方向。");
      return;
    }
    setSavingProfile(true);
    setAtsError("");
    try {
      const profile: SearchProfile = {
        countries: selectedCountries,
        roles: selectedRoles,
        locations: preferredLocations,
        needsSponsor,
        resumeSkills,
        resumeLanguage,
        careerStage,
      };
      window.localStorage.setItem(profileStorageKey, JSON.stringify(profile));
      try {
        window.localStorage.removeItem("offer-radar-profile-disabled");
      } catch {
        // The active session can still use the newly generated radar.
      }
      setProfileReady(true);
      setEditingProfile(false);
      setScanMessage("个人岗位雷达已生成，后续会按 24 小时数据窗口自动刷新。");
      setActiveView("radar");
      window.history.replaceState(null, "", "#radar");
      window.setTimeout(() => document.getElementById("radar-panel")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch {
      setAtsError("求职画像暂时无法保存，请稍后再试。");
    } finally {
      setSavingProfile(false);
    }
  }

  function addJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const newJob: Job = {
      id: `manual-${Date.now()}`,
      company: String(form.get("company")),
      role: String(form.get("role")),
      country: form.get("country") as Country,
      city: String(form.get("city") || "待确认"),
      track: String(form.get("track") || "自定义岗位"),
      deadline: String(form.get("deadline") || "待确认"),
      daysLeft: 99,
      match: 75,
      source: "手动添加",
      sourceUrl: String(form.get("url") || "#"),
      reason: "你手动收录的岗位，等待 AI 完成匹配分析",
      requirements: "请粘贴该岗位的完整 Job Description，以获得更准确的 ATS 匹配结果。",
      status: "待申请",
      fresh: true,
    };
    setJobs((current) => [newJob, ...current]);
    setShowAdd(false);
  }

  async function acceptResume(file: File) {
    setAtsError("");
    setAtsResult(null);
    if (file.size > 10 * 1024 * 1024) {
      setAtsError("文件超过 10MB，请上传更小的简历文件。");
      return;
    }

    setParsingResume(true);
    try {
      const extension = file.name.split(".").pop()?.toLowerCase();
      let text = "";
      if (extension === "txt") {
        text = await file.text();
      } else if (extension === "pdf") {
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        pdfjs.GlobalWorkerOptions.workerSrc = `${import.meta.env.BASE_URL}pdf.worker.min.mjs`;
        const data = new Uint8Array(await file.arrayBuffer());
        const pdf = await pdfjs.getDocument({ data }).promise;
        const pages: string[] = [];
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          const content = await page.getTextContent();
          pages.push(
            content.items
              .map((item) => ("str" in item ? item.str : ""))
              .join(" "),
          );
        }
        text = pages.join("\n");
      } else if (extension === "docx") {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = result.value;
      } else {
        throw new Error("unsupported");
      }

      if (text.trim().length < 80) {
        throw new Error("empty");
      }
      setResumeName(file.name);
      const parsedText = text.trim();
      setResumeText(parsedText);
      setResumeSkills(extractResumeSkills(text));
      try {
        window.localStorage.setItem(resumeStorageKey(resumeLanguage), JSON.stringify({ name: file.name, text: parsedText }));
      } catch {
        // Full matching still works for this session when device storage is unavailable.
      }
      const suggestions = recommendRoles(text).slice(0, 3);
      setSelectedRoles((current) => Array.from(new Set([...suggestions, ...current])));
    } catch {
      setResumeName("");
      setResumeText("");
      setAtsError("没有成功读取这份简历。请确认它是可复制文字的 PDF、DOCX 或 TXT 文件。");
    } finally {
      setParsingResume(false);
    }
  }

  async function readResume(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    await acceptResume(file);
    event.target.value = "";
  }

  function dropResume(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) void acceptResume(file);
  }

  function clearResume() {
    try {
      window.localStorage.removeItem(resumeStorageKey(resumeLanguage));
      window.localStorage.removeItem(profileStorageKey);
      window.localStorage.removeItem(jobStatesStorageKey);
      window.localStorage.setItem("offer-radar-profile-disabled", "1");
    } catch {
      // Clearing the in-memory copy is still useful when browser storage is unavailable.
    }
    setResumeName("");
    setResumeText("");
    setResumeSkills([]);
    setProfileReady(false);
    setEditingProfile(true);
    setJobs([]);
    setSaved([]);
    setCountry("全部");
    setQuery("");
    setJobDescription("");
    setAtsResult(null);
    setAtsError("");
    setRadarError("");
    setRadarLoading(false);
    setFilteredOutCount(0);
    setTargetCompanyCount(0);
    setLiveSourceCount(0);
    setDiscoverySourceCount(0);
    setSourceCompanies([]);
    setLastSyncedAt("");
    setActiveView("radar");
    setScanMessage("简历和本次匹配结果已清除。重新上传简历后即可生成新的岗位雷达。");
  }

  function runAtsCheck() {
    setAtsError("");
    if (!resumeText) {
      setAtsError("请先上传一份简历。");
      return;
    }
    if (jobDescription.trim().length < 80) {
      setAtsError("请粘贴更完整的 Job Description，再进行匹配分析。");
      return;
    }
    setAtsResult(analyseAts(resumeText, jobDescription));
  }

  function selectJobForAts(job: Job) {
    setJobDescription(`${job.role} — ${job.company}\n\n${job.requirements}`);
    setAtsResult(null);
    window.setTimeout(() => {
      document.getElementById("ats-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }

  async function searchSponsor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = sponsorSearch.trim();
    if (query.length < 2) return;
    setSponsorSearching(true);
    setSponsorSearchError("");
    setSponsorSearchResult(null);
    try {
      const response = await fetch(
        apiUrl(`/api/sponsors?companies=${encodeURIComponent(query)}`),
      );
      const data = (await response.json()) as SponsorApiResponse;
      if (!response.ok || data.error) throw new Error(data.error);
      setSponsorSearchResult(data.results[0]);
      setSponsorRegisterDate(data.registerDate);
    } catch {
      setSponsorSearchError("没有成功连接官方 Sponsor Register，请稍后重试。");
    } finally {
      setSponsorSearching(false);
    }
  }

  const applicationCount = jobs.filter((job) => job.status !== "待申请").length;

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Offer Radar 首页">
          <span className="brand-mark">OR</span>
          <span>Offer Radar</span>
          <span className="beta">BETA</span>
        </a>
        <div className="top-actions">
          <span className="public-badge"><i /> 公开访问</span>
          <span className="last-sync"><i /> {lastSyncedAt ? `上次同步：${new Date(lastSyncedAt).toLocaleDateString("zh-CN")}` : "正在连接职位源"}</span>
        </div>
      </header>

      <nav className="mobile-nav" aria-label="移动端主导航">
        <a href="#radar" className={activeView === "radar" && !showSources ? "active" : ""} onClick={() => openDashboardView("radar")}><span>⌁</span>岗位</a>
        <a href="#saved" className={activeView === "saved" && !showSources ? "active" : ""} onClick={() => openDashboardView("saved")}><span>♡</span>收藏</a>
        <a href="#applications" className={activeView === "applications" && !showSources ? "active" : ""} onClick={() => openDashboardView("applications")}><span>▤</span>申请</a>
        <a href="#profile-builder" onClick={openProfileBuilder}><span>⇧</span>简历</a>
        <button className={showSources ? "active" : ""} onClick={openSources}><span>◎</span>信息源</button>
      </nav>

      <div className="layout" id="top">
        <aside className="sidebar" aria-label="主导航">
          <nav>
            <a href="#radar" className={`nav-item ${activeView === "radar" && !showSources ? "active" : ""}`} aria-current={activeView === "radar" && !showSources ? "page" : undefined} onClick={() => openDashboardView("radar")}><span>⌁</span>岗位雷达</a>
            <a href="#saved" className={`nav-item ${activeView === "saved" && !showSources ? "active" : ""}`} aria-current={activeView === "saved" && !showSources ? "page" : undefined} onClick={() => openDashboardView("saved")}>
              <span>♡</span>我的收藏 <b>{saved.length}</b>
            </a>
            <a href="#applications" className={`nav-item ${activeView === "applications" && !showSources ? "active" : ""}`} aria-current={activeView === "applications" && !showSources ? "page" : undefined} onClick={() => openDashboardView("applications")}><span>▤</span>申请看板 <b>{applicationCount}</b></a>
            {atsWorkspaceEnabled && (
              <button className="nav-item" onClick={() => document.getElementById("ats-workspace")?.scrollIntoView({ behavior: "smooth" })}>
                <span>◉</span>ATS 简历匹配
              </button>
            )}
            <button className={`nav-item ${showSources ? "active" : ""}`} onClick={openSources}><span>◎</span>信息源</button>
            <a href="#profile-builder" className="nav-upload" onClick={openProfileBuilder}><span>⇧</span><strong>上传简历找工作</strong><small>无需登录 · 每个人都能使用</small></a>
          </nav>

          <div className="profile-card">
            <span className="eyebrow">求职画像</span>
            <strong>{profileReady ? "个人岗位雷达已建立" : "等待创建个人画像"}</strong>
            <p>{selectedCountries.join(" · ")} · {selectedRoles.slice(0, 2).join(" / ")}</p>
            <div className="profile-tags">{resumeSkills.slice(0, 3).map((skill) => <span key={skill}>{skill}</span>)}</div>
            {profileReady && <small className={`full-match-status ${resumeText ? "ready" : "limited"}`}>{resumeText ? "✓ 完整简历匹配已启用" : "! 当前仅使用技能标签"}</small>}
            <button onClick={openProfileBuilder}>{profileReady ? "编辑求职偏好 →" : "开始创建我的雷达 →"}</button>
          </div>
        </aside>

        <section className="content">
          <section className="hero">
            <div>
              <span className="kicker">YOUR GLOBAL GRADUATE JOB COPILOT</span>
              <h1>每一份简历，都值得<em>找到真正适合的岗位。</em></h1>
              <p>这是一个公开的求职网页。任何人都可以直接上传自己的 PDF、DOCX 或 TXT 简历，再选择国家、岗位与签证需求；Offer Radar 会从真实招聘来源中筛选并按个人匹配度排序。</p>
              <div className="hero-trust"><span>✓ 无需登录</span><span>✓ 简历仅在你的浏览器解析</span><span>✓ 每位访客拥有独立求职雷达</span></div>
            </div>
            <button className={`scan-button ${scanning ? "is-scanning" : ""}`} onClick={startScan}>
              <span className="scan-symbol">✦</span>
              {scanning ? "正在扫描…" : "刷新个人雷达"}
              <small>{targetCompanyCount} 家公司 · {liveSourceCount} 个职位接口 · {discoverySourceCount} 条校招线索</small>
            </button>
          </section>

          {scanMessage && <div className={`scan-message ${scanning ? "loading" : "done"}`}>{scanMessage}</div>}

          <section className={`profile-builder ${editingProfile ? "expanded" : "compact"}`} id="profile-builder">
            <div className="profile-builder-head">
              <div>
                <span className="kicker">PERSONALISED SEARCH PROFILE</span>
                <h2>{profileReady && !editingProfile ? "你的岗位雷达正在运行" : "上传你的简历，开始找工作。"}</h2>
                <p>{profileReady && !editingProfile ? `${resumeText ? "完整简历匹配已启用：" : "当前只有技能标签："}正在关注 ${selectedCountries.join("、")}的 ${selectedRoles.length} 个求职方向。${resumeText ? "教育、经历、成果、技能、语言与地点都会进入评分。" : "请重新上传简历以恢复完整匹配。"}` : "无需注册账号。简历文件和解析文本只保存在当前浏览器；服务器仅保存匿名技能标签和求职偏好，不保存原文件。"}</p>
              </div>
              {profileReady && !editingProfile && <button className="secondary-button" onClick={() => setEditingProfile(true)}>编辑画像</button>}
            </div>

            {editingProfile && (
              <div className="profile-builder-grid">
                <div className="profile-step resume-profile-step">
                  <span className="profile-step-number">01</span>
                  <strong>上传简历</strong>
                  <p>支持拖拽或点击上传；文件不会离开你的设备</p>
                  <div className="resume-language-tabs" role="tablist" aria-label="简历语言版本">
                    <button type="button" className={resumeLanguage === "中文" ? "selected" : ""} aria-pressed={resumeLanguage === "中文"} onClick={() => changeResumeLanguage("中文")}>中文版</button>
                    <button type="button" className={resumeLanguage === "英文" ? "selected" : ""} aria-pressed={resumeLanguage === "英文"} onClick={() => changeResumeLanguage("英文")}>English CV</button>
                  </div>
                  <label className={`profile-upload ${resumeText ? "ready" : ""}`} onDragOver={(event) => event.preventDefault()} onDrop={dropResume}>
                    <input key={resumeLanguage} type="file" accept=".pdf,.docx,.txt" onChange={readResume} />
                    <span>{parsingResume ? "正在本地解析…" : resumeText ? `✓ 已识别${resumeLanguage}简历` : `⇧ 拖拽或选择${resumeLanguage}简历`}</span>
                    <small>{resumeName || "PDF、DOCX、TXT · 最大 10MB · 不上传原文件"}</small>
                  </label>
                  {resumeSkills.length > 0 && <div className="detected-skills">{resumeSkills.slice(0, 6).map((skill) => <span key={skill}>{skill}</span>)}</div>}
                  {resumeText && <button type="button" className="clear-resume" onClick={clearResume}>清除这台设备上的简历</button>}
                </div>

                <div className="profile-step">
                  <span className="profile-step-number">02</span>
                  <strong>选择求职国家</strong>
                  <p>系统会据此生成对应的目标公司池</p>
                  <div className="choice-grid country-choice-grid">
                    {(["中国", "英国", "加拿大"] as Country[]).map((item) => (
                      <button key={item} className={selectedCountries.includes(item) ? "selected" : ""} onClick={() => toggleCountry(item)}>
                        <span>{countryMeta[item].flag}</span>{item}
                      </button>
                    ))}
                  </div>
                  <div className="career-stage-field">
                    <span>求职阶段</span>
                    <div>
                      {(["Graduate / Entry Level", "Internship", "Graduate + Internship"] as CareerStage[]).map((stage) => (
                        <button type="button" key={stage} className={careerStage === stage ? "selected" : ""} onClick={() => setCareerStage(stage)}>{stage === "Graduate / Entry Level" ? "Graduate" : stage === "Internship" ? "Intern" : "两者都看"}</button>
                      ))}
                    </div>
                  </div>
                  <label className="profile-text-field">偏好城市 / Remote<input value={preferredLocations} onChange={(event) => setPreferredLocations(event.target.value)} /></label>
                  {selectedCountries.includes("英国") && (
                    <label className="sponsor-toggle"><input type="checkbox" checked={needsSponsor} onChange={(event) => setNeedsSponsor(event.target.checked)} /><span />我需要 Skilled Worker Sponsorship</label>
                  )}
                </div>

                <div className="profile-step role-profile-step">
                  <span className="profile-step-number">03</span>
                  <strong>选择求职方向</strong>
                  <p>{recommendedRoles.length ? `已根据${resumeLanguage}简历识别出 ${recommendedRoles.length} 个推荐方向` : "上传简历后会自动推荐；也可以自由选择或输入"}</p>
                  <div className="choice-grid role-choice-grid">
                    {orderedRoleCatalog.map((item) => (
                      <button type="button" key={item.label} className={`${selectedRoles.includes(item.label) ? "selected" : ""} ${recommendedRoles.includes(item.label) ? "recommended" : ""}`} onClick={() => toggleRole(item.label)}>
                        {selectedRoles.includes(item.label) ? "✓ " : "+ "}{item.label}
                        {recommendedRoles.includes(item.label) && <small>简历推荐</small>}
                      </button>
                    ))}
                  </div>
                  <div className="custom-role-row">
                    <input value={customRole} onChange={(event) => setCustomRole(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addCustomRole(); } }} placeholder="输入其他求职方向，例如：Creator Partnerships" aria-label="自定义求职方向" />
                    <button type="button" onClick={addCustomRole}>添加</button>
                  </div>
                  {selectedRoles.filter((role) => !roleCatalog.some((item) => item.label === role)).length > 0 && (
                    <div className="custom-role-tags">
                      {selectedRoles.filter((role) => !roleCatalog.some((item) => item.label === role)).map((role) => <button type="button" key={role} onClick={() => toggleRole(role)}>✓ {role} ×</button>)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {editingProfile && (
              <>
                {atsError && <div className="profile-error">{atsError}</div>}
                <div className="profile-builder-footer">
                  <span>隐私说明：原始简历与完整文本不上传；服务器只保存匿名技能标签与求职偏好。</span>
                  <button onClick={saveSearchProfile} disabled={savingProfile || parsingResume}>{savingProfile ? "正在生成…" : "✦ 生成我的岗位雷达"}</button>
                </div>
              </>
            )}
          </section>

          {hasActiveRadar && (
          <>
          <section className="stats" aria-label="岗位概览">
            <div className="stat-card">
              <span>匹配岗位</span><strong>{jobs.length}</strong><small>当前追踪</small>
            </div>
            <div className="stat-card">
              <span>目标公司</span><strong>{targetCompanyCount}</strong><small>随画像动态生成</small>
            </div>
            <div className="stat-card">
              <span>本周新增</span><strong>{jobs.filter((job) => job.fresh).length}</strong><small>已去重</small>
            </div>
            <div className="stat-card country-stat">
              <span>覆盖国家</span>
              <div className="flags"><i>🇨🇳</i><i>🇬🇧</i><i>🇨🇦</i></div>
              <small>{liveSourceCount} 个官方职位流已连接</small>
            </div>
          </section>

          {atsWorkspaceEnabled && (
          <section className="ats-panel" id="ats-workspace">
            <div className="ats-heading">
              <div>
                <span className="eyebrow">UK & CANADA ATS CHECKER</span>
                <h2>上传简历，看看 ATS 会怎么读你。</h2>
                <p>对比真实 Job Description，检查关键词覆盖、简历结构和成果量化。适合英国与加拿大网申前快速自检。</p>
              </div>
              <span className="privacy-badge">◇ 浏览器内解析 · 不保存文件</span>
            </div>

            <div className="ats-input-grid">
              <div className="resume-uploader">
                <span className="step-number">01</span>
                <div>
                  <strong>当前使用：{resumeLanguage === "中文" ? "中文版简历" : "English CV"}</strong>
                  <p>支持可复制文字的 PDF、DOCX、TXT，最大 10MB</p>
                </div>
                <label className={`upload-zone ${resumeText ? "has-file" : ""}`}>
                  <input type="file" accept=".pdf,.docx,.txt" onChange={readResume} />
                  <span className="upload-icon">⇧</span>
                  {parsingResume ? (
                    <><strong>正在读取简历…</strong><small>文件不会离开当前浏览器</small></>
                  ) : resumeText ? (
                    <><strong>{resumeName}</strong><small>已读取 {resumeText.length.toLocaleString()} 个字符 · 点击可更换</small></>
                  ) : (
                    <><strong>拖入或选择简历</strong><small>PDF · DOCX · TXT</small></>
                  )}
                </label>
                {resumeText && (
                  <div className="parse-success"><span>✓</span> 文本解析成功，可以开始匹配</div>
                )}
              </div>

              <div className="jd-input">
                <span className="step-number">02</span>
                <div>
                  <strong>粘贴目标岗位 JD</strong>
                  <p>建议粘贴完整的 Responsibilities 与 Requirements</p>
                </div>
                <textarea
                  value={jobDescription}
                  onChange={(event) => { setJobDescription(event.target.value); setAtsResult(null); }}
                  placeholder="Paste the full Job Description here…\n\n例如：We are looking for an analytical graduate with experience in strategy, operations and stakeholder management…"
                />
                <div className="jd-footer"><span>{jobDescription.length.toLocaleString()} 字符</span><span>建议 500–3,000 字符</span></div>
              </div>
            </div>

            {atsError && <div className="ats-error">{atsError}</div>}

            <div className="ats-run-row">
              <p><b>评分构成</b> 关键词 65% · ATS 结构 25% · 内容长度 10%</p>
              <button onClick={runAtsCheck} disabled={parsingResume}>✦ 生成 ATS 匹配报告</button>
            </div>

            {atsResult && (
              <div className="ats-results">
                <div className="score-block">
                  <div className="score-ring" style={{ "--score": `${atsResult.score * 3.6}deg` } as React.CSSProperties}>
                    <div><strong>{atsResult.score}</strong><span>/ 100</span></div>
                  </div>
                  <h3>{atsResult.score >= 75 ? "匹配度良好" : atsResult.score >= 55 ? "有提升空间" : "建议针对性改写"}</h3>
                  <p>这是关键词与格式启发式评分，不代表雇主最终筛选结果。</p>
                </div>

                <div className="keyword-block">
                  <span className="result-label">MATCHED KEYWORDS</span>
                  <h3>已覆盖关键词</h3>
                  <div className="result-tags matched">
                    {atsResult.matched.length ? atsResult.matched.map((term) => <span key={term}>✓ {term}</span>) : <em>暂未识别到明确匹配词</em>}
                  </div>
                  <span className="result-label missing-label">MISSING KEYWORDS</span>
                  <h3>值得补强的关键词</h3>
                  <div className="result-tags missing">
                    {atsResult.missing.length ? atsResult.missing.map((term) => <span key={term}>＋ {term}</span>) : <em>核心关键词覆盖完整</em>}
                  </div>
                </div>

                <div className="checks-block">
                  <span className="result-label">ATS READABILITY</span>
                  <h3>机器可读性</h3>
                  <ul>
                    {atsResult.checks.map((check) => (
                      <li key={check.label} className={check.passed ? "passed" : "failed"}>
                        <span>{check.passed ? "✓" : "!"}</span>{check.label}
                      </li>
                    ))}
                  </ul>
                  <span className="result-label suggestion-label">NEXT ACTIONS</span>
                  <ol>{atsResult.suggestions.map((suggestion) => <li key={suggestion}>{suggestion}</li>)}</ol>
                </div>
              </div>
            )}
          </section>
          )}

          <section className="radar-panel" id="radar-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">{activeView === "saved" ? "SAVED OPPORTUNITIES" : activeView === "applications" ? "APPLICATION TRACKER" : "LIVE OPPORTUNITY FEED"}</span>
                <h2 tabIndex={-1}>{activeView === "saved" ? "我的收藏" : activeView === "applications" ? "申请看板" : "为你找到的岗位"}</h2>
              </div>
              <button className="secondary-button" onClick={() => setShowAdd(true)}>＋ 手动添加</button>
            </div>

            <div className="filters">
              <div className="country-tabs" role="tablist" aria-label="按国家筛选">
                {(["全部", ...selectedCountries] as const).map((item) => (
                  <button
                    key={item}
                    className={country === item ? "selected" : ""}
                    onClick={() => setCountry(item)}
                  >
                    {item !== "全部" && countryMeta[item].flag} {item}
                  </button>
                ))}
              </div>
              <div className="filter-tools">
                <label className="search-box">
                  <span>⌕</span>
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索公司、岗位或方向" />
                </label>
                <select value={sort} onChange={(event) => setSort(event.target.value as "match" | "deadline")} aria-label="排序方式">
                  <option value="match">匹配度优先</option>
                  <option value="deadline">截止日期优先（未知在后）</option>
                </select>
              </div>
            </div>

            <div className={`live-note ${radarError ? "error" : ""}`}>
              <span>{radarLoading ? "SYNC" : radarError ? "RETRY" : "LIVE"}</span>
              {radarLoading ? "正在从公司官网、官方职位接口和校招渠道读取并去重岗位…" : radarError || `${careerStage === "Internship" ? "Intern" : careerStage === "Graduate + Internship" ? "Graduate + Intern" : "Graduate"} 模式已过滤 ${filteredOutCount} 个职级或语言条件不符岗位；已识别 ${knownDeadlineCount}/${jobs.length} 个截止日期。`}
            </div>

            {country === "英国" && (
              <section className="sponsor-inline" id="sponsor-checker">
                <div className="sponsor-inline-head">
                  <div>
                    <span className="eyebrow">UK SKILLED WORKER CHECK</span>
                    <h3>英国雇主 Sponsor 核验</h3>
                    <p>按雇主法定名称查询 GOV.UK Licensed Sponsors 名单。</p>
                  </div>
                  <a href="https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers" target="_blank" rel="noreferrer">官方名单 ↗</a>
                </div>
                <div className="sponsor-inline-body">
                  <div className="register-status">
                    <span><i />官方数据源已连接</span>
                    <small>{sponsorRegisterDate ? `名单版本 ${sponsorRegisterDate}` : "正在读取最新名单…"}</small>
                  </div>
                  <form onSubmit={searchSponsor}>
                    <label htmlFor="sponsor-company">输入雇主法定英文名称</label>
                    <div>
                      <input id="sponsor-company" value={sponsorSearch} onChange={(event) => setSponsorSearch(event.target.value)} placeholder="例如：Wise Payments Limited" />
                      <button disabled={sponsorSearching}>{sponsorSearching ? "核验中…" : "核验 Sponsor"}</button>
                    </div>
                  </form>
                  {sponsorSearchError && <div className="sponsor-error">{sponsorSearchError}</div>}
                  {sponsorSearchResult && (
                    <div className={`sponsor-result ${sponsorSearchResult.skilledWorker ? "licensed" : "unverified"}`}>
                      <span className="result-icon">{sponsorSearchResult.skilledWorker ? "✓" : "?"}</span>
                      <div>
                        <strong>{sponsorSearchResult.skilledWorker ? "存在 Skilled Worker 许可" : sponsorSearchResult.found ? "名单中存在，但未找到 Skilled Worker 路线" : "官方名单未找到精确匹配"}</strong>
                        <p>{sponsorSearchResult.matches[0]?.organisation ?? sponsorSearchResult.query}</p>
                        {sponsorSearchResult.matches.filter((match) => match.route.includes("Skilled Worker")).slice(0, 2).map((match) => (
                          <small key={`${match.organisation}-${match.route}`}>{match.city || "UK"} · {match.rating} · {match.route}</small>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="sponsor-warning"><b>提醒：</b>持有牌照不代表具体岗位一定提供担保，仍需查看 JD 或向招聘方确认。</div>
                </div>
              </section>
            )}

            <div className="job-list">
              {filteredJobs.map((job) => (
                <article className="job-card" key={job.id}>
                  <div className="company-logo" aria-hidden="true">{job.company.slice(0, 1)}</div>
                  <div className="job-main">
                    <div className="job-title-line">
                      <h3>{job.role}</h3>
                      {job.fresh && <span className="new-badge">NEW</span>}
                    </div>
                    <p className="company-line">{job.company} <span>·</span> {countryMeta[job.country].flag} {job.city}</p>
                    <div className="job-tags">
                      <span>{job.track}</span>
                      <select value={job.status} onChange={(event) => changeStatus(job.id, event.target.value as Status)} aria-label={`${job.company} 申请状态`}>
                        <option>待申请</option><option>准备中</option><option>已申请</option>
                      </select>
                      <span>{job.source}</span>
                    </div>
                    {job.sponsorQuery && (
                      <div className="job-sponsor-row">
                        {sponsorLoading ? (
                          <span className="sponsor-badge checking">◌ Sponsor 核验中</span>
                        ) : sponsorChecks[job.sponsorQuery]?.skilledWorker ? (
                          <span className="sponsor-badge licensed">✓ Skilled Worker licensed</span>
                        ) : (
                          <span className="sponsor-badge unverified">? Sponsor 待人工确认</span>
                        )}
                        <small>牌照状态 ≠ 该岗位承诺担保</small>
                      </div>
                    )}
                    <p className="match-reason"><b>匹配理由</b>{job.reason}</p>
                    {job.matchBreakdown && (
                      <div className="match-breakdown" aria-label={`${job.company} 匹配维度`}>
                        {job.matchBreakdown.map((dimension) => <span key={dimension.label}>{dimension.label} <b>{dimension.score}/{dimension.max}</b></span>)}
                      </div>
                    )}
                  </div>
                  <div className="job-meta">
                    <div className={`deadline ${deadlineTone(job.daysLeft)}`}>
                      <span>申请截止</span><strong>{job.deadline}</strong><small>{job.daysLeft < 0 ? "已截止" : job.daysLeft < 9999 ? `剩余 ${job.daysLeft} 天` : "日期待核验"}</small>
                    </div>
                    <div className="match-score"><strong>{job.match}%</strong><span>匹配度</span></div>
                    <div className="job-actions">
                      <button className={saved.includes(job.id) ? "saved" : ""} onClick={() => toggleSaved(job.id)} aria-label={saved.includes(job.id) ? "取消收藏" : "收藏岗位"}>
                        {saved.includes(job.id) ? "♥" : "♡"}
                      </button>
                      {atsWorkspaceEnabled && <button className="ats-job-button" onClick={() => selectJobForAts(job)} aria-label={`用 ${job.company} 的岗位描述进行 ATS 匹配`}>ATS</button>}
                      <a href={job.sourceUrl} target="_blank" rel="noreferrer">查看来源 ↗</a>
                    </div>
                  </div>
                </article>
              ))}
              {filteredJobs.length === 0 && (
                <div className="empty-state"><span>{radarLoading ? "◌" : activeView === "saved" ? "♡" : activeView === "applications" ? "▤" : "⌕"}</span><h3>{radarLoading ? "正在建立你的岗位雷达" : activeView === "saved" ? "还没有收藏岗位" : activeView === "applications" ? "申请看板还是空的" : "当前筛选暂未返回结果"}</h3><p>{radarLoading ? "首次读取官网、职位接口和校招渠道可能需要一点时间。" : activeView === "saved" ? "回到岗位雷达，点击岗位右侧的爱心即可收藏。" : activeView === "applications" ? "回到岗位雷达，把岗位状态改为“准备中”或“已申请”后会出现在这里。" : "请调整国家、搜索词，或点击“刷新个人雷达”重新读取岗位。"}</p></div>
              )}
            </div>
          </section>

          <section className="source-strip">
            <div><span className="source-icon">⌁</span><p><strong>{targetCompanyCount} 家目标公司正在关注</strong><small>官方职位接口 · 企业招聘官网 · 校招公告 · 公众号线索</small></p></div>
            <div className="source-health"><span><i />{liveSourceCount} 实时职位接口</span><span><i className="warn" />{discoverySourceCount} 条校招渠道</span></div>
            <button onClick={() => setShowSources(true)}>查看 {sourceCompanies.length || targetCompanyCount} 家公司 →</button>
          </section>
          </>
          )}
        </section>
      </div>

      {showAdd && (
        <div className="modal-backdrop">
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="add-title">
            <button className="modal-close" onClick={() => setShowAdd(false)} aria-label="关闭">×</button>
            <span className="eyebrow">ADD AN OPPORTUNITY</span>
            <h2 id="add-title">收录一个岗位</h2>
            <p>先把链接存进雷达，之后再交给 AI 补全信息和判断匹配度。</p>
            <form onSubmit={addJob}>
              <label>公司名称<input name="company" required placeholder="例如：Stripe" /></label>
              <label>岗位名称<input name="role" required placeholder="例如：Strategy & Operations Graduate" /></label>
              <div className="form-row">
                <label>国家<select name="country"><option>中国</option><option>英国</option><option>加拿大</option></select></label>
                <label>城市<input name="city" placeholder="London" /></label>
              </div>
              <div className="form-row">
                <label>岗位方向<input name="track" placeholder="FinTech Strategy" /></label>
                <label>截止日期<input name="deadline" placeholder="10月18日" /></label>
              </div>
              <label>信息来源链接<input name="url" type="url" placeholder="https://..." /></label>
              <button className="submit-button" type="submit">加入岗位雷达</button>
            </form>
          </section>
        </div>
      )}

      {showSources && (
        <div className="modal-backdrop">
          <section className="modal source-modal" aria-modal="true" role="dialog" aria-label="监控公司清单">
            <button className="modal-close" onClick={() => setShowSources(false)} aria-label="关闭">×</button>
            <span className="eyebrow">SOURCE COVERAGE</span>
            <h2>当前监控 {sourceCompanies.length} 家公司</h2>
            <p>绿色标记为自动读取的官方职位流；其余公司已纳入目标池并提供官方招聘入口，不会把官网入口伪装成实时岗位。</p>
            <div className="source-groups">
              {Object.entries(sourceGroups).map(([group, sources]) => (
                <section className="source-group" key={group}>
                  <h3>{group}<span>{sources.length} 家</span></h3>
                  <div className="source-company-grid">
                    {sources.map((source) => (
                      <a href={source.careersUrl} target="_blank" rel="noreferrer" key={`${source.country}-${source.company}`}>
                        <strong>{source.company}</strong>
                        <small>{countryMeta[source.country].flag} {source.country} · {source.provider}</small>
                        <span className={source.live ? "live" : "watch"}>{source.live ? "LIVE" : "WATCH"}</span>
                      </a>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
