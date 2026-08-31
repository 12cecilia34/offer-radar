"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

type Country = "中国" | "英国" | "加拿大";
type Status = "待申请" | "准备中" | "已申请";

type Job = {
  id: number;
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
  status: Status;
  fresh?: boolean;
};

const seededJobs: Job[] = [
  {
    id: 1,
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
    id: 2,
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
    id: 3,
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
    id: 4,
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
    status: "待申请",
  },
  {
    id: 5,
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
    status: "已申请",
  },
  {
    id: 6,
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
    status: "待申请",
  },
  {
    id: 7,
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
    id: 8,
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
  if (days <= 7) return "urgent";
  if (days <= 14) return "soon";
  return "safe";
}

type AtsResult = {
  score: number;
  matched: string[];
  missing: string[];
  checks: { label: string; passed: boolean }[];
  suggestions: string[];
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
];

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
  const [jobs, setJobs] = useState<Job[]>(seededJobs);
  const [country, setCountry] = useState<"全部" | Country>("全部");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"match" | "deadline">("match");
  const [saved, setSaved] = useState<number[]>([]);
  const [savedReady, setSavedReady] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [resumeName, setResumeName] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [parsingResume, setParsingResume] = useState(false);
  const [atsError, setAtsError] = useState("");
  const [atsResult, setAtsResult] = useState<AtsResult | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = window.localStorage.getItem("offer-radar-saved");
      if (stored) setSaved(JSON.parse(stored));
      setSavedReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (savedReady) {
      window.localStorage.setItem("offer-radar-saved", JSON.stringify(saved));
    }
  }, [saved, savedReady]);

  const filteredJobs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return jobs
      .filter((job) => country === "全部" || job.country === country)
      .filter((job) => !showSaved || saved.includes(job.id))
      .filter((job) =>
        [job.company, job.role, job.track, job.city]
          .join(" ")
          .toLowerCase()
          .includes(normalized),
      )
      .sort((a, b) =>
        sort === "match" ? b.match - a.match : a.daysLeft - b.daysLeft,
      );
  }, [country, jobs, query, saved, showSaved, sort]);

  function toggleSaved(id: number) {
    setSaved((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function startScan() {
    if (scanning) return;
    setScanning(true);
    setScanMessage("正在检查 12 个招聘来源…");
    window.setTimeout(() => setScanMessage("正在去重并计算岗位匹配度…"), 900);
    window.setTimeout(() => {
      setScanning(false);
      setScanMessage("扫描完成：发现 3 条高匹配示例岗位，已排在列表前列");
    }, 1900);
  }

  function addJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const newJob: Job = {
      id: Date.now(),
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

  async function readResume(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
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
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
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
      setResumeText(text.trim());
    } catch {
      setResumeName("");
      setResumeText("");
      setAtsError("没有成功读取这份简历。请确认它是可复制文字的 PDF、DOCX 或 TXT 文件。");
    } finally {
      setParsingResume(false);
    }
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

  const appliedCount = jobs.filter((job) => job.status === "已申请").length;
  const urgentCount = jobs.filter((job) => job.daysLeft <= 7).length;

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Offer Radar 首页">
          <span className="brand-mark">OR</span>
          <span>Offer Radar</span>
          <span className="beta">BETA</span>
        </a>
        <div className="top-actions">
          <span className="last-sync"><i /> 上次同步：12 分钟前</span>
          <button className="icon-button" aria-label="通知">◔</button>
          <span className="avatar">M</span>
        </div>
      </header>

      <div className="layout" id="top">
        <aside className="sidebar" aria-label="主导航">
          <nav>
            <button className="nav-item active"><span>⌁</span>岗位雷达</button>
            <button className="nav-item" onClick={() => setShowSaved(!showSaved)}>
              <span>♡</span>我的收藏 <b>{saved.length}</b>
            </button>
            <button className="nav-item"><span>▤</span>申请看板 <b>{appliedCount}</b></button>
            <button className="nav-item" onClick={() => document.getElementById("ats-workspace")?.scrollIntoView({ behavior: "smooth" })}>
              <span>◉</span>ATS 简历匹配
            </button>
            <button className="nav-item"><span>◎</span>信息源</button>
          </nav>

          <div className="profile-card">
            <span className="eyebrow">求职画像</span>
            <strong>2027届 · 英国硕士</strong>
            <p>运营优先 · 海外 Strategy / BA / DA</p>
            <div className="profile-tags"><span>TikTok</span><span>电商</span><span>AI</span></div>
            <button>编辑求职偏好 →</button>
          </div>
        </aside>

        <section className="content">
          <section className="hero">
            <div>
              <span className="kicker">YOUR GLOBAL GRADUATE JOB COPILOT</span>
              <h1>把三国秋招，<em>收进一个雷达。</em></h1>
              <p>AI 每天替你扫描目标岗位、合并重复信息、追踪截止日期，只留下真正值得申请的机会。</p>
            </div>
            <button className={`scan-button ${scanning ? "is-scanning" : ""}`} onClick={startScan}>
              <span className="scan-symbol">✦</span>
              {scanning ? "正在扫描…" : "开始 AI 扫描"}
              <small>12 个信息源</small>
            </button>
          </section>

          {scanMessage && <div className={`scan-message ${scanning ? "loading" : "done"}`}>{scanMessage}</div>}

          <section className="stats" aria-label="岗位概览">
            <div className="stat-card">
              <span>匹配岗位</span><strong>{jobs.length}</strong><small>当前追踪</small>
            </div>
            <div className="stat-card urgent-stat">
              <span>即将截止</span><strong>{urgentCount}</strong><small>7 天以内</small>
            </div>
            <div className="stat-card">
              <span>本周新增</span><strong>{jobs.filter((job) => job.fresh).length}</strong><small>已去重</small>
            </div>
            <div className="stat-card country-stat">
              <span>覆盖国家</span>
              <div className="flags"><i>🇨🇳</i><i>🇬🇧</i><i>🇨🇦</i></div>
              <small>中国 · 英国 · 加拿大</small>
            </div>
          </section>

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
                  <strong>上传英文简历</strong>
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

          <section className="radar-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">LIVE OPPORTUNITY FEED</span>
                <h2>高匹配岗位</h2>
              </div>
              <button className="secondary-button" onClick={() => setShowAdd(true)}>＋ 手动添加</button>
            </div>

            <div className="filters">
              <div className="country-tabs" role="tablist" aria-label="按国家筛选">
                {(["全部", "中国", "英国", "加拿大"] as const).map((item) => (
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
                  <option value="deadline">截止日期优先</option>
                </select>
              </div>
            </div>

            <div className="demo-note">
              <span>DEMO</span> 当前为产品演示数据；正式版接入招聘官网与搜索服务后，将显示实时岗位和经核验的截止日期。
            </div>

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
                      <span>{job.track}</span><span>{job.status}</span><span>{job.source}</span>
                    </div>
                    <p className="match-reason"><b>AI 匹配理由</b>{job.reason}</p>
                  </div>
                  <div className="job-meta">
                    <div className={`deadline ${deadlineTone(job.daysLeft)}`}>
                      <span>申请截止</span><strong>{job.deadline}</strong><small>{job.daysLeft < 90 ? `剩余 ${job.daysLeft} 天` : "日期待核验"}</small>
                    </div>
                    <div className="match-score"><strong>{job.match}%</strong><span>匹配度</span></div>
                    <div className="job-actions">
                      <button className={saved.includes(job.id) ? "saved" : ""} onClick={() => toggleSaved(job.id)} aria-label={saved.includes(job.id) ? "取消收藏" : "收藏岗位"}>
                        {saved.includes(job.id) ? "♥" : "♡"}
                      </button>
                      <button className="ats-job-button" onClick={() => selectJobForAts(job)} aria-label={`用 ${job.company} 的岗位描述进行 ATS 匹配`}>ATS</button>
                      <a href={job.sourceUrl} target="_blank" rel="noreferrer">查看来源 ↗</a>
                    </div>
                  </div>
                </article>
              ))}
              {filteredJobs.length === 0 && (
                <div className="empty-state"><span>⌕</span><h3>暂时没有匹配岗位</h3><p>试试更换国家、搜索关键词或取消收藏筛选。</p></div>
              )}
            </div>
          </section>

          <section className="source-strip">
            <div><span className="source-icon">⌁</span><p><strong>12 个来源保持连接</strong><small>企业官网 · Graduate portals · 招聘平台</small></p></div>
            <div className="source-health"><span><i />10 正常</span><span><i className="warn" />2 待授权</span></div>
            <button>管理信息源 →</button>
          </section>
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
    </main>
  );
}
