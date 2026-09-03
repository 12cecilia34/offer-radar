export type CampusPriorityLevel = "urgent" | "high" | "normal" | "watch";

export type ChinaCampusPriority = {
  id: string;
  rank: number;
  company: string;
  level: CampusPriorityLevel;
  timing: string;
  suggestedDate: string;
  action: string;
  roles: string[];
  careersUrl: string;
};

// Tactical application plan supplied on 2026-09-03. These timing notes are
// discovery signals, not universal company-wide deadlines; applicants should
// always confirm the selected business unit and vacancy on the official portal.
export const chinaCampusPriorities: ChinaCampusPriority[] = [
  {
    id: "china-plan-alibaba-2027",
    rank: 1,
    company: "阿里巴巴",
    level: "urgent",
    timing: "部分 27 届批次已于 9/2 截止；其他事业群仍可能开放",
    suggestedDate: "立即处理",
    action: "今晚检查仍开放岗位，有合适方向立即投递",
    roles: ["商业分析", "策略运营", "产品运营"],
    careersUrl: "https://campus-talent.alibaba.com/",
  },
  {
    id: "china-plan-tencent-2027",
    rank: 2,
    company: "腾讯",
    level: "urgent",
    timing: "不同 BG 时间不同；已有批次集中在 9/8–9/16 左右",
    suggestedDate: "9/4–9/5",
    action: "先完成主校招与目标 BG 的岗位筛选",
    roles: ["商业分析", "数据分析", "商业化策略"],
    careersUrl: "https://join.qq.com/",
  },
  {
    id: "china-plan-bytedance-2027",
    rank: 3,
    company: "字节跳动",
    level: "urgent",
    timing: "滚动招聘；部分业务线当前批次约 9/9–9/22",
    suggestedDate: "9/5 前",
    action: "按滚动筛选节奏尽早提交，不等待最终截止日",
    roles: ["Strategy & Operations", "数据分析", "商业化策略"],
    careersUrl: "https://jobs.bytedance.com/campus/",
  },
  {
    id: "china-plan-xiaohongshu-2027",
    rank: 4,
    company: "小红书",
    level: "urgent",
    timing: "2027 校招约 9/2 上线；部分项目招满即止",
    suggestedDate: "9/6 前",
    action: "优先检查社区、商业化和电商相关岗位",
    roles: ["产品运营", "商业化策略", "数据分析"],
    careersUrl: "https://job.xiaohongshu.com/",
  },
  {
    id: "china-plan-iflytek-2027",
    rank: 5,
    company: "科大讯飞",
    level: "high",
    timing: "当前线索显示网申期约 7/24–9/22，流程已推进",
    suggestedDate: "9/7 前",
    action: "先投递 AI 产品、业务分析和运营岗位",
    roles: ["AI 产品运营", "业务分析", "数据分析"],
    careersUrl: "https://iflytek.zhiye.com/",
  },
  {
    id: "china-plan-meituan-2027",
    rank: 6,
    company: "美团",
    level: "high",
    timing: "27 届秋招已启动；公开线索约 10/17 截止，滚动推进",
    suggestedDate: "9/8 前",
    action: "不要按 10 月窗口倒推，优先投递核心业务岗位",
    roles: ["策略运营", "商业分析", "产品运营"],
    careersUrl: "https://zhaopin.meituan.com/",
  },
  {
    id: "china-plan-kuaishou-2027",
    rank: 7,
    company: "快手",
    level: "high",
    timing: "8/12 已开始投递、8/14 已开始面试；不同页面结束时间不同",
    suggestedDate: "9/8–9/10",
    action: "以具体岗位页为准，先完成内容、电商和商业化方向",
    roles: ["内容运营", "电商运营", "商业化策略"],
    careersUrl: "https://zhaopin.kuaishou.cn/",
  },
  {
    id: "china-plan-hsbc-2027",
    rank: 8,
    company: "汇丰 HSBC",
    level: "normal",
    timing: "2027 Asia Career Pathway 线索显示约 10/8 截止",
    suggestedDate: "9 月中旬前",
    action: "按项目所在地核验毕业年份、语言与工作权利要求",
    roles: ["商业分析", "Risk", "Strategy & Operations"],
    careersUrl: "https://www.hsbc.com/careers/students-and-graduates",
  },
  {
    id: "china-plan-trip-2027",
    rank: 9,
    company: "携程",
    level: "normal",
    timing: "当前线索为 8/26 开放、10/26 截止；9 月中旬起面试",
    suggestedDate: "9/13–9/14",
    action: "优先匹配旅行、电商、商业分析与产品运营",
    roles: ["商业分析", "产品运营", "Strategy & Operations"],
    careersUrl: "https://careers.trip.com/campus-recruitment",
  },
  {
    id: "china-plan-baidu-2027",
    rank: 10,
    company: "百度",
    level: "watch",
    timing: "27 届正式秋招已开；公开线索显示窗口相对更长",
    suggestedDate: "9/15 前",
    action: "排在本轮最后，但仍按滚动招聘尽早完成",
    roles: ["AI 产品运营", "数据分析", "商业分析"],
    careersUrl: "https://talent.baidu.com/jobs/list",
  },
  {
    id: "china-plan-sf-2027",
    rank: 11,
    company: "顺丰",
    level: "watch",
    timing: "当前计划未提供统一截止日，需按具体岗位官网核验",
    suggestedDate: "本轮同步检查",
    action: "重点查看供应链、经营分析与产品运营岗位",
    roles: ["供应链运营", "经营分析", "产品运营"],
    careersUrl: "https://hr.sf-express.com/",
  },
];
