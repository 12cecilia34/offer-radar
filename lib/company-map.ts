import { jobSources, type TargetCountry } from "./job-sources";

export type EvidenceStrength = "强" | "中" | "弱" | "未找到";
export type DiscoveryPath = "种子锚点" | "投资组合" | "竞品拓展" | "产业链拓展";

export type CompanyMapProfile = {
  roles: string[];
  skills: string[];
  locations: string;
  resumeText: string;
  countries: TargetCountry[];
};

export type CompanyMapEntry = {
  id: string;
  company: string;
  industry: string;
  path: DiscoveryPath;
  anchor: string;
  relationship: string;
  cities: string[];
  roleSignals: string[];
  skillSignals: string[];
  recommendedRoles: string[];
  discoverySource?: { label: string; url: string };
  evidence: {
    strength: EvidenceStrength;
    label: string;
    year?: number;
    url: string;
    verifiedAt: string;
  };
};

export type RankedCompanyMapEntry = CompanyMapEntry & {
  careersUrl: string;
  displayName: string;
  score: number;
  matchReasons: string[];
  nextAction: string;
};

const verifiedAt = "2026-09-01";

const entries: CompanyMapEntry[] = [
  {
    id: "bytedance",
    company: "TikTok / ByteDance",
    industry: "内容平台 / 直播电商 / AI",
    path: "种子锚点",
    anchor: "简历中的电商、内容与增长信号",
    relationship: "从用户目标职能直接建立的核心锚点",
    cities: ["北京", "上海", "杭州", "深圳"],
    roleSignals: ["直播电商", "电商运营", "策略运营", "产品运营", "用户增长", "内容运营", "数据运营"],
    skillSignals: ["sql", "数据分析", "增长", "电商", "直播", "内容", "项目管理"],
    recommendedRoles: ["电商策略运营", "产品运营", "用户增长", "商业分析"],
    evidence: { strength: "强", label: "2027 届校园招聘官方项目", year: 2027, url: "https://jobs.bytedance.com/campus/position", verifiedAt },
  },
  {
    id: "alibaba",
    company: "Alibaba",
    industry: "电商 / 云计算 / 本地生活 / AI",
    path: "种子锚点",
    anchor: "电商与商业分析目标",
    relationship: "用大厂作为行业入口，再向消费、云与本地生活赛道扩展",
    cities: ["杭州", "上海", "北京"],
    roleSignals: ["电商运营", "策略运营", "产品运营", "商业分析", "数据分析", "市场运营", "ai"],
    skillSignals: ["sql", "数据分析", "电商", "策略", "增长", "市场"],
    recommendedRoles: ["业务运营", "商业分析", "AI 产品运营", "市场运营"],
    evidence: { strength: "强", label: "2027 届校园招聘官方项目", year: 2027, url: "https://campus-talent.alibaba.com/campus/gov", verifiedAt },
  },
  {
    id: "tencent",
    company: "Tencent",
    industry: "社交 / 内容 / 游戏 / 云服务",
    path: "种子锚点",
    anchor: "内容、产品和商业化职能",
    relationship: "作为投资组合与内容生态的发现入口",
    cities: ["深圳", "北京", "上海", "广州"],
    roleSignals: ["产品运营", "内容运营", "商业化运营", "策略运营", "数据分析", "市场运营"],
    skillSignals: ["产品", "内容", "增长", "数据分析", "项目管理", "商业化"],
    recommendedRoles: ["产品运营", "内容运营", "商业化运营", "策略分析"],
    evidence: { strength: "强", label: "官方职位接口可核验在招岗位及更新时间", year: 2026, url: "https://join.qq.com/", verifiedAt },
  },
  {
    id: "meituan",
    company: "Meituan",
    industry: "本地生活 / 零售科技",
    path: "竞品拓展",
    anchor: "阿里巴巴 / 京东",
    relationship: "从电商与本地生活相邻赛道扩展",
    cities: ["北京", "上海", "深圳", "成都"],
    roleSignals: ["产品运营", "策略运营", "商业分析", "数据分析", "用户增长"],
    skillSignals: ["sql", "数据分析", "策略", "增长", "运营"],
    recommendedRoles: ["产品运营", "商业分析", "策略运营"],
    evidence: { strength: "未找到", label: "已确认官方招聘入口；近期校招年份需继续核验", url: "https://zhaopin.meituan.com/", verifiedAt },
  },
  {
    id: "jd",
    company: "JD.com",
    industry: "零售电商 / 物流 / 供应链科技",
    path: "投资组合",
    anchor: "腾讯",
    relationship: "腾讯与京东的长期战略合作关系形成电商与供应链入口",
    cities: ["北京", "上海", "深圳", "宿迁"],
    roleSignals: ["电商运营", "商家运营", "供应链", "策略运营", "数据分析", "市场运营"],
    skillSignals: ["电商", "供应链", "sql", "数据分析", "商家", "增长"],
    recommendedRoles: ["电商运营", "商家运营", "供应链运营", "商业分析"],
    discoverySource: { label: "京东 IR：与腾讯续签战略合作", url: "https://ir.jd.com/news-releases/news-release-details/jdcom-announced-renewed-strategic-cooperation-tencent" },
    evidence: { strength: "未找到", label: "已确认官方招聘入口；近期校招年份需继续核验", url: "https://zhaopin.jd.com/", verifiedAt },
  },
  {
    id: "pdd",
    company: "PDD / Temu",
    industry: "平台电商 / 跨境电商",
    path: "竞品拓展",
    anchor: "阿里巴巴 / 京东 / TikTok Shop",
    relationship: "从国内电商与跨境增长赛道扩展",
    cities: ["上海", "广州", "深圳"],
    roleSignals: ["电商运营", "商家运营", "用户增长", "策略运营", "市场运营", "数据分析"],
    skillSignals: ["电商", "增长", "商家", "市场", "数据分析", "跨境"],
    recommendedRoles: ["跨境电商运营", "商家运营", "增长策略"],
    evidence: { strength: "未找到", label: "已确认官方招聘入口；近期校招年份需继续核验", url: "https://careers.pddglobalhr.com/", verifiedAt },
  },
  {
    id: "xiaohongshu",
    company: "Xiaohongshu",
    industry: "内容社区 / 消费决策 / 电商",
    path: "竞品拓展",
    anchor: "字节跳动 / 腾讯",
    relationship: "从内容、创作者与消费品牌营销赛道扩展",
    cities: ["上海", "北京", "武汉"],
    roleSignals: ["内容运营", "用户增长", "商业化运营", "市场运营", "电商运营", "产品运营"],
    skillSignals: ["内容", "增长", "社区", "营销", "电商", "creator"],
    recommendedRoles: ["内容运营", "创作者运营", "商业化运营", "品牌营销"],
    evidence: { strength: "未找到", label: "已确认官方招聘入口；近期校招年份需继续核验", url: "https://job.xiaohongshu.com/", verifiedAt },
  },
  {
    id: "kuaishou",
    company: "Kuaishou",
    industry: "短视频 / 直播 / 电商",
    path: "投资组合",
    anchor: "腾讯",
    relationship: "腾讯投资组合中的内容与直播电商公司",
    cities: ["北京", "杭州", "深圳", "成都"],
    roleSignals: ["直播电商", "内容运营", "电商运营", "用户增长", "商业化运营", "策略运营"],
    skillSignals: ["直播", "内容", "增长", "电商", "数据分析"],
    recommendedRoles: ["直播电商运营", "内容策略", "商业化运营"],
    discoverySource: { label: "快手年度报告：腾讯为主要股东", url: "https://ir.kuaishou.com/corporate-filings/annual-interim-reports/" },
    evidence: { strength: "未找到", label: "已确认官方招聘入口；近期校招年份需继续核验", url: "https://zhaopin.kuaishou.cn/", verifiedAt },
  },
  {
    id: "bilibili",
    company: "Bilibili",
    industry: "视频社区 / 游戏 / 内容商业化",
    path: "投资组合",
    anchor: "腾讯",
    relationship: "腾讯投资及内容合作关系带出的青年内容平台",
    cities: ["上海", "北京"],
    roleSignals: ["内容运营", "用户增长", "商业化运营", "产品运营", "市场运营"],
    skillSignals: ["内容", "社区", "增长", "商业化", "游戏", "市场"],
    recommendedRoles: ["内容运营", "社区运营", "商业化运营"],
    discoverySource: { label: "哔哩哔哩年度报告：腾讯投资与内容合作", url: "https://ir.bilibili.com/media/3xfch12a/annual-and-transition-report-of-foreign-private-issuers-sections-13-or-15-d.pdf" },
    evidence: { strength: "未找到", label: "已确认官方招聘入口；近期校招年份需继续核验", url: "https://jobs.bilibili.com/", verifiedAt },
  },
  {
    id: "weibo",
    company: "Weibo",
    industry: "社交媒体 / 广告 / 内容",
    path: "投资组合",
    anchor: "阿里巴巴",
    relationship: "阿里巴巴历史投资关系带出的社交媒体与广告赛道",
    cities: ["北京"],
    roleSignals: ["内容运营", "市场运营", "商业化运营", "用户增长", "数据分析"],
    skillSignals: ["内容", "广告", "市场", "增长", "数据分析"],
    recommendedRoles: ["内容运营", "广告商业化", "市场策略"],
    discoverySource: { label: "Weibo 2025 年报：Alibaba 历史投资", url: "https://www.sec.gov/Archives/edgar/data/1595761/000110465926047217/wb-20251231x20f.htm" },
    evidence: { strength: "未找到", label: "已确认官方招聘入口；近期校招年份需继续核验", url: "https://career.sina.com.cn/", verifiedAt },
  },
  {
    id: "trip",
    company: "Trip.com Group",
    industry: "在线旅游 / 本地服务",
    path: "投资组合",
    anchor: "百度",
    relationship: "百度持股关系带出的在线旅游与本地服务赛道",
    cities: ["上海", "北京", "成都", "南通"],
    roleSignals: ["产品运营", "策略运营", "用户增长", "市场运营", "数据分析", "客户成功"],
    skillSignals: ["旅游", "增长", "产品", "数据分析", "国际化", "客户"],
    recommendedRoles: ["产品运营", "市场运营", "商业分析", "客户运营"],
    discoverySource: { label: "Trip.com 2024 年报：Baidu 为主要股东", url: "https://www.sec.gov/Archives/edgar/data/1269238/000119312524122196/d630811d20f.htm" },
    evidence: { strength: "未找到", label: "已确认官方招聘入口；近期校招年份需继续核验", url: "https://careers.trip.com/", verifiedAt },
  },
  {
    id: "iqiyi",
    company: "iQIYI",
    industry: "长视频 / 内容 / 会员商业化",
    path: "投资组合",
    anchor: "百度",
    relationship: "百度控股关系带出的内容与会员增长赛道",
    cities: ["北京", "上海"],
    roleSignals: ["内容运营", "用户增长", "商业化运营", "产品运营", "数据分析"],
    skillSignals: ["内容", "会员", "增长", "产品", "数据分析"],
    recommendedRoles: ["内容运营", "会员增长", "商业化运营"],
    discoverySource: { label: "iQIYI 2025 年报：Baidu 为控股股东", url: "https://www.sec.gov/Archives/edgar/data/1722608/000119312526107079/iq-20251231.htm" },
    evidence: { strength: "未找到", label: "已确认官方招聘入口；近期校招年份需继续核验", url: "https://zhaopin.iqiyi.com/", verifiedAt },
  },
  {
    id: "tencent-music",
    company: "Tencent Music",
    industry: "数字音乐 / 内容 / 社交娱乐",
    path: "产业链拓展",
    anchor: "腾讯",
    relationship: "从腾讯内容生态向音乐、版权与社交娱乐扩展",
    cities: ["深圳", "北京"],
    roleSignals: ["内容运营", "产品运营", "商业化运营", "用户增长", "市场运营"],
    skillSignals: ["内容", "音乐", "版权", "增长", "产品"],
    recommendedRoles: ["内容运营", "产品运营", "商业化运营"],
    evidence: { strength: "强", label: "2027 届校园招聘官方项目", year: 2027, url: "https://join.tencentmusic.com/campus/", verifiedAt },
  },
  {
    id: "oppo",
    company: "OPPO",
    industry: "消费电子 / 互联网服务 / AI",
    path: "产业链拓展",
    anchor: "内容平台与消费科技",
    relationship: "向设备端软件商店、游戏、广告和 AI 产品运营扩展",
    cities: ["深圳", "成都", "东莞"],
    roleSignals: ["产品运营", "商业化运营", "ai", "数据分析", "市场运营"],
    skillSignals: ["产品", "ai", "数据分析", "广告", "游戏"],
    recommendedRoles: ["互联网产品运营", "AI 产品运营", "商业化运营"],
    evidence: { strength: "强", label: "2027 届互联网产品运营官方岗位", year: 2027, url: "https://careers.oppo.com/university/oppo/campus/post/1859?recruitType=Intern", verifiedAt },
  },
  {
    id: "shopee",
    company: "Shopee",
    industry: "跨境电商 / 游戏 / 金融科技",
    path: "竞品拓展",
    anchor: "TikTok Shop / Temu / Alibaba",
    relationship: "从跨境电商与东南亚市场扩展出的国际化目标",
    cities: ["深圳", "上海", "北京"],
    roleSignals: ["电商运营", "商家运营", "用户增长", "策略运营", "市场运营", "数据分析"],
    skillSignals: ["电商", "跨境", "增长", "商家", "数据分析", "英语"],
    recommendedRoles: ["跨境电商运营", "商家运营", "市场策略"],
    evidence: { strength: "中", label: "Shopee 中国官方招聘站持续发布岗位", year: 2026, url: "https://careers.shopee.cn/", verifiedAt },
  },
  {
    id: "amazon",
    company: "亚马逊 Amazon",
    industry: "跨境电商 / 云计算 / 物流",
    path: "竞品拓展",
    anchor: "京东 / 阿里巴巴 / Shopee",
    relationship: "从零售、跨境和云服务赛道扩展",
    cities: ["北京", "上海", "深圳", "杭州"],
    roleSignals: ["电商运营", "商家运营", "策略运营", "数据分析", "客户成功", "市场运营"],
    skillSignals: ["电商", "云", "数据分析", "客户", "英语", "供应链"],
    recommendedRoles: ["Marketplace 运营", "Account Management", "Business Analyst"],
    evidence: { strength: "中", label: "Amazon 官方中国地点页可核验在招岗位", year: 2026, url: "https://www.amazon.jobs/en/search?base_query=&loc_query=China", verifiedAt },
  },
  {
    id: "apple",
    company: "苹果 Apple",
    industry: "消费电子 / 软件服务 / 零售",
    path: "产业链拓展",
    anchor: "OPPO / 小米 / 华为",
    relationship: "从消费科技向产品、供应链、零售和服务运营扩展",
    cities: ["上海", "北京", "深圳", "苏州"],
    roleSignals: ["产品运营", "市场运营", "数据分析", "供应链", "项目管理"],
    skillSignals: ["产品", "供应链", "数据分析", "项目管理", "英语"],
    recommendedRoles: ["Product Operations", "Supply Chain", "Marketing"],
    evidence: { strength: "强", label: "Apple 中国官方职位页含 2026 年实习与应届岗位", year: 2026, url: "https://jobs.apple.com/zh-cn/search?location=china-CHNC", verifiedAt },
  },
  {
    id: "microsoft",
    company: "微软 Microsoft",
    industry: "云计算 / 企业软件 / AI",
    path: "产业链拓展",
    anchor: "阿里云 / 腾讯云 / 百度 AI",
    relationship: "从云与 AI 向企业客户、解决方案和产品运营扩展",
    cities: ["北京", "上海", "深圳", "苏州"],
    roleSignals: ["产品运营", "策略运营", "客户成功", "商业分析", "市场运营", "ai"],
    skillSignals: ["云", "ai", "客户", "产品", "数据分析", "英语"],
    recommendedRoles: ["Customer Success", "Product Operations", "Business Program"],
    evidence: { strength: "中", label: "微软大中华区官方地点页展示当前职位", year: 2026, url: "https://careers.microsoft.com/v2/global/en/locations/gcr.html", verifiedAt },
  },
  {
    id: "google",
    company: "谷歌 Google",
    industry: "广告 / 云计算 / AI / 开发者生态",
    path: "竞品拓展",
    anchor: "百度 / 字节跳动 / 微软",
    relationship: "从搜索、广告、云和 AI 相邻赛道扩展",
    cities: ["北京", "上海", "深圳"],
    roleSignals: ["商业分析", "市场运营", "客户成功", "用户增长", "策略运营", "ai"],
    skillSignals: ["广告", "ai", "云", "数据分析", "客户", "英语"],
    recommendedRoles: ["Customer Solutions", "Strategy & Insights", "Cloud Operations"],
    evidence: { strength: "中", label: "Google Careers 当前可检索中国岗位", year: 2026, url: "https://www.google.com/about/careers/applications/jobs/results/?location=China", verifiedAt },
  },
  {
    id: "sap",
    company: "SAP",
    industry: "企业软件 / 数据 / AI",
    path: "产业链拓展",
    anchor: "电商与消费企业的数字化供应商",
    relationship: "从候选人的业务运营经验向企业软件和客户成功扩展",
    cities: ["上海", "北京", "大连", "西安"],
    roleSignals: ["客户成功", "产品运营", "商业分析", "数据分析", "市场运营", "ai"],
    skillSignals: ["客户", "数据分析", "erp", "云", "ai", "英语"],
    recommendedRoles: ["Customer Success", "Business Operations", "AI / Data Intern"],
    evidence: { strength: "强", label: "SAP 中国官方职位页含 2026 年 iXp 实习岗位", year: 2026, url: "https://jobs.sap.com/go/SAP-Jobs-in-China/881201/", verifiedAt },
  },
  {
    id: "pg",
    company: "宝洁 P&G",
    industry: "快消 / 品牌 / 电商",
    path: "产业链拓展",
    anchor: "平台电商与消费品牌客户",
    relationship: "从电商平台向品牌方的电商、市场与商业分析岗位扩展",
    cities: ["广州", "上海", "北京"],
    roleSignals: ["电商运营", "市场运营", "商业分析", "用户增长", "供应链"],
    skillSignals: ["品牌", "电商", "市场", "数据分析", "供应链"],
    recommendedRoles: ["Brand Management", "E-commerce", "Commercial Analytics"],
    evidence: { strength: "未找到", label: "已确认宝洁中国官方招聘入口；近期校招年份需继续核验", url: "https://www.pgcareers.com/cn/zh", verifiedAt },
  },
  {
    id: "unilever",
    company: "联合利华 Unilever",
    industry: "快消 / 品牌 / 数字商业",
    path: "竞品拓展",
    anchor: "宝洁 / 欧莱雅",
    relationship: "从消费品牌、数字营销与电商相邻职能扩展",
    cities: ["上海", "北京", "合肥"],
    roleSignals: ["电商运营", "市场运营", "商业分析", "用户增长", "供应链"],
    skillSignals: ["品牌", "电商", "市场", "数据分析", "供应链"],
    recommendedRoles: ["Digital Commerce", "Marketing", "Customer Development"],
    evidence: { strength: "中", label: "Unilever China 官方职业页含 Early Careers 入口", year: 2026, url: "https://careers.unilever.com/en/china", verifiedAt },
  },
  {
    id: "loreal",
    company: "欧莱雅 L'Oréal",
    industry: "美妆 / 品牌 / 数字电商",
    path: "产业链拓展",
    anchor: "小红书 / 抖音电商 / 天猫",
    relationship: "从内容电商平台向品牌数字化和消费者增长扩展",
    cities: ["上海", "苏州", "广州"],
    roleSignals: ["电商运营", "市场运营", "用户增长", "商业分析", "内容运营"],
    skillSignals: ["美妆", "品牌", "电商", "内容", "市场", "数据分析"],
    recommendedRoles: ["Digital Marketing", "E-commerce", "Consumer Insights"],
    evidence: { strength: "未找到", label: "已确认欧莱雅官方招聘入口；近期中国校招年份需继续核验", url: "https://careers.loreal.com/zh_CN/content/Home", verifiedAt },
  },
  {
    id: "tesla",
    company: "特斯拉 Tesla",
    industry: "新能源汽车 / 能源 / AI",
    path: "产业链拓展",
    anchor: "消费科技 / AI / 制造",
    relationship: "从数字产品和运营能力向新能源、零售与供应链扩展",
    cities: ["上海", "北京", "深圳"],
    roleSignals: ["产品运营", "市场运营", "数据分析", "供应链", "项目管理", "ai"],
    skillSignals: ["ai", "数据分析", "供应链", "项目管理", "市场"],
    recommendedRoles: ["Business Operations", "Supply Chain", "Sales Operations"],
    evidence: { strength: "中", label: "Tesla 中国官方实习资源页说明大中华区全年招聘", year: 2026, url: "https://www.tesla.cn/careers/intern-resources", verifiedAt },
  },
  {
    id: "dewu",
    company: "Dewu / Poizon",
    industry: "潮流电商 / 鉴定服务 / 社区",
    path: "竞品拓展",
    anchor: "小红书 / 京东 / 得物用户生态",
    relationship: "从年轻消费、内容社区和电商运营赛道扩展",
    cities: ["上海"],
    roleSignals: ["电商运营", "商家运营", "内容运营", "用户增长", "策略运营"],
    skillSignals: ["电商", "内容", "社区", "增长", "商家"],
    recommendedRoles: ["电商运营", "商家运营", "用户增长"],
    evidence: { strength: "未找到", label: "已确认官方校招入口；页面年份需继续核验", url: "https://campus.dewu.com/", verifiedAt },
  },
  {
    id: "keep",
    company: "Keep",
    industry: "运动科技 / 内容社区 / 消费品",
    path: "产业链拓展",
    anchor: "内容社区 / 消费品牌",
    relationship: "从内容、用户增长和消费品电商向运动科技扩展",
    cities: ["北京"],
    roleSignals: ["内容运营", "用户增长", "电商运营", "产品运营", "市场运营"],
    skillSignals: ["内容", "社区", "增长", "电商", "市场"],
    recommendedRoles: ["用户运营", "内容运营", "电商运营"],
    evidence: { strength: "未找到", label: "已确认官方招聘入口；未找到近期公开校招证据", url: "https://keep.jobs.feishu.cn/", verifiedAt },
  },
];

const evidenceWeight: Record<EvidenceStrength, number> = { 强: 16, 中: 11, 弱: 5, 未找到: 0 };
const pathWeight: Record<DiscoveryPath, number> = { 种子锚点: 8, 投资组合: 7, 竞品拓展: 6, 产业链拓展: 6 };

function includesSignal(haystack: string, signal: string) {
  return haystack.includes(signal.toLowerCase());
}

export function rankCompanyMap(profile: CompanyMapProfile): RankedCompanyMapEntry[] {
  const roleText = profile.roles.join(" ").toLowerCase();
  const resumeText = `${profile.resumeText} ${profile.skills.join(" ")}`.toLowerCase();
  const locationText = profile.locations.toLowerCase();

  return entries
    .map((entry) => {
      const source = jobSources.find((item) => item.company === entry.company);
      if (!source) throw new Error(`Missing job source for ${entry.company}`);
      const roleMatches = entry.roleSignals.filter((signal) => includesSignal(roleText, signal));
      const skillMatches = entry.skillSignals.filter((signal) => includesSignal(resumeText, signal));
      const locationMatches = entry.cities.filter((city) => locationText.includes(city.toLowerCase()));
      const roleScore = Math.min(30, roleMatches.length * 8);
      const skillScore = Math.min(24, skillMatches.length * 6);
      const locationScore = locationMatches.length ? 10 : 3;
      const score = Math.min(98, 24 + roleScore + skillScore + locationScore + evidenceWeight[entry.evidence.strength] + pathWeight[entry.path]);
      const matchReasons = [
        roleMatches.length ? `命中 ${roleMatches.slice(0, 2).join("、")} 方向` : `可拓展到 ${entry.recommendedRoles[0]}`,
        skillMatches.length ? `简历含 ${skillMatches.slice(0, 2).join("、")} 信号` : entry.relationship,
        locationMatches.length ? `覆盖偏好城市 ${locationMatches.join("、")}` : `主要地点：${entry.cities.slice(0, 2).join("、")}`,
      ];
      const nextAction = entry.evidence.strength === "强"
        ? `优先查看 ${entry.recommendedRoles.slice(0, 2).join(" / ")}，核对截止日期后投递`
        : entry.evidence.strength === "中"
          ? `进入官方岗位页检索 ${entry.recommendedRoles[0]}，确认是否接受应届/实习`
          : `用“${entry.company} 校招 2027 / 应届生 / 实习”继续核验，找到日期证据后再升为优先`;
      return {
        ...entry,
        careersUrl: source.careersUrl,
        displayName: source.displayName ?? source.company,
        score,
        matchReasons,
        nextAction,
      };
    })
    .filter(() => profile.countries.includes("中国"))
    .sort((a, b) => b.score - a.score || evidenceWeight[b.evidence.strength] - evidenceWeight[a.evidence.strength]);
}

export const companyMapMethod = {
  verifiedAt,
  totalCandidates: entries.length,
  searchTerms: [
    "大厂名 + 投资 / 战略投资 / 被投企业 / 投资组合",
    "公司名 + 融资 / 投资方 / 竞品 / 所属行业",
    "公司名 + 校招 / 校园招聘 / 应届生 / 管培生 / 实习 + 年份",
    "行业名 + 头部公司 / 上下游公司 / 校招岗位名",
  ],
};
