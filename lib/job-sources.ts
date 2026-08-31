export type TargetCountry = "中国" | "英国" | "加拿大";

export type JobSource = {
  company: string;
  country: TargetCountry;
  careersUrl: string;
  provider: "greenhouse" | "lever" | "official";
  token?: string;
  sponsorQuery?: string;
};

export const jobSources: JobSource[] = [
  { company: "TikTok / ByteDance", country: "中国", careersUrl: "https://jobs.bytedance.com/zh/", provider: "official" },
  { company: "Alibaba", country: "中国", careersUrl: "https://talent.alibaba.com/", provider: "official" },
  { company: "Ant Group", country: "中国", careersUrl: "https://talent.antgroup.com/", provider: "official" },
  { company: "Meituan", country: "中国", careersUrl: "https://zhaopin.meituan.com/", provider: "official" },
  { company: "Tencent", country: "中国", careersUrl: "https://join.qq.com/", provider: "official" },
  { company: "JD.com", country: "中国", careersUrl: "https://zhaopin.jd.com/", provider: "official" },
  { company: "PDD / Temu", country: "中国", careersUrl: "https://careers.pddglobalhr.com/", provider: "official" },
  { company: "Xiaohongshu", country: "中国", careersUrl: "https://job.xiaohongshu.com/", provider: "official" },
  { company: "Kuaishou", country: "中国", careersUrl: "https://zhaopin.kuaishou.cn/", provider: "official" },
  { company: "Bilibili", country: "中国", careersUrl: "https://jobs.bilibili.com/", provider: "official" },
  { company: "Baidu", country: "中国", careersUrl: "https://talent.baidu.com/", provider: "official" },
  { company: "Trip.com Group", country: "中国", careersUrl: "https://careers.trip.com/", provider: "official" },

  { company: "AlphaSights", country: "英国", careersUrl: "https://www.alphasights.com/careers/", provider: "greenhouse", token: "alphasights", sponsorQuery: "AlphaSights Ltd" },
  { company: "Monzo", country: "英国", careersUrl: "https://monzo.com/careers", provider: "greenhouse", token: "monzo", sponsorQuery: "Monzo Bank Limited" },
  { company: "TrueLayer", country: "英国", careersUrl: "https://truelayer.com/careers/", provider: "greenhouse", token: "truelayer", sponsorQuery: "TrueLayer Limited" },
  { company: "Coinbase", country: "英国", careersUrl: "https://www.coinbase.com/careers", provider: "greenhouse", token: "coinbase", sponsorQuery: "Coinbase UK, Ltd" },
  { company: "Zopa", country: "英国", careersUrl: "https://www.zopa.com/careers", provider: "lever", token: "zopa", sponsorQuery: "Zopa Bank Limited" },
  { company: "OpenPayd", country: "英国", careersUrl: "https://www.openpayd.com/company/careers", provider: "lever", token: "OpenPayd", sponsorQuery: "OpenPayd Services Limited" },
  { company: "Recognise Bank", country: "英国", careersUrl: "https://www.recognisebank.co.uk/careers/", provider: "lever", token: "recognisebank", sponsorQuery: "Recognise Bank Limited" },
  { company: "Apollo Research", country: "英国", careersUrl: "https://www.apolloresearch.ai/careers", provider: "lever", token: "apolloresearch", sponsorQuery: "Apollo Research Limited" },
  { company: "Wise", country: "英国", careersUrl: "https://www.wise.jobs/", provider: "official", sponsorQuery: "Wise Payments Limited" },
  { company: "Revolut", country: "英国", careersUrl: "https://www.revolut.com/careers/", provider: "official", sponsorQuery: "Revolut Ltd" },
  { company: "Checkout.com", country: "英国", careersUrl: "https://www.checkout.com/careers", provider: "official", sponsorQuery: "Checkout Ltd" },
  { company: "Starling Bank", country: "英国", careersUrl: "https://www.starlingbank.com/careers/", provider: "official", sponsorQuery: "Starling Bank Limited" },
  { company: "Deloitte", country: "英国", careersUrl: "https://www.deloitte.com/uk/en/careers.html", provider: "official", sponsorQuery: "Deloitte LLP" },

  { company: "StackAdapt", country: "加拿大", careersUrl: "https://www.stackadapt.com/careers", provider: "greenhouse", token: "stackadapt" },
  { company: "Hootsuite", country: "加拿大", careersUrl: "https://careers.hootsuite.com/", provider: "greenhouse", token: "hootsuite" },
  { company: "DoorDash Canada", country: "加拿大", careersUrl: "https://careersatdoordash.com/", provider: "greenhouse", token: "doordashcanada" },
  { company: "Faire", country: "加拿大", careersUrl: "https://www.faire.com/careers", provider: "greenhouse", token: "faire" },
  { company: "Shopify", country: "加拿大", careersUrl: "https://www.shopify.com/careers", provider: "official" },
  { company: "Wealthsimple", country: "加拿大", careersUrl: "https://www.wealthsimple.com/en-ca/careers", provider: "official" },
  { company: "RBC", country: "加拿大", careersUrl: "https://jobs.rbc.com/ca/en", provider: "official" },
  { company: "TD", country: "加拿大", careersUrl: "https://jobs.td.com/en-CA/", provider: "official" },
  { company: "BMO", country: "加拿大", careersUrl: "https://jobs.bmo.com/ca/en", provider: "official" },
  { company: "Scotiabank", country: "加拿大", careersUrl: "https://jobs.scotiabank.com/", provider: "official" },
  { company: "CIBC", country: "加拿大", careersUrl: "https://www.cibc.com/en/about-cibc/careers.html", provider: "official" },
  { company: "Clio", country: "加拿大", careersUrl: "https://www.clio.com/about/careers/", provider: "official" },
  { company: "PwC Canada", country: "加拿大", careersUrl: "https://www.pwc.com/ca/en/careers.html", provider: "official" },
];

export const liveSourceCount = jobSources.filter((source) => source.provider !== "official").length;

