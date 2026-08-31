"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

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
      status: "待申请",
      fresh: true,
    };
    setJobs((current) => [newJob, ...current]);
    setShowAdd(false);
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
