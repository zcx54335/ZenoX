import { useEffect, useMemo, useRef, useState, type FormEvent, type PointerEvent } from "react";
import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Home,
  KeyRound,
  Languages,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  QrCode,
  ReceiptText,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Sun,
  Tags,
  UploadCloud,
  UserRound,
  Users,
  WandSparkles,
  X,
  type LucideIcon,
} from "lucide-react";

type Role = "admin" | "teacher" | "student" | "parent";
type AuthPanelPlacement = "left" | "center" | "right";
type ThemeMode = "light" | "dark" | "auto";
type Accent = "blue" | "violet" | "cyan" | "emerald" | "rose" | "amber" | "graphite";
type ContentWidth = "boxed" | "fluid";
type Radius = "soft" | "round" | "pill";
type Density = "comfortable" | "compact";
type Glass = "light" | "frosted" | "crystal";
type LayoutMode = "sidebar" | "top" | "mixed" | "compact";
type NavStyle = "glass" | "plain";
type Transition = "fade" | "slide" | "scale";

type Preferences = {
  accent: Accent;
  animation: boolean;
  collapsed: boolean;
  contentWidth: ContentWidth;
  density: Density;
  glass: Glass;
  gray: boolean;
  language: "zh" | "en";
  layout: LayoutMode;
  mode: ThemeMode;
  navStyle: NavStyle;
  radius: Radius;
  transition: Transition;
  weak: boolean;
};

type ModuleItem = {
  badge?: string;
  group: "工作台" | "教学" | "运营" | "系统";
  icon: LucideIcon;
  key: string;
  roles: Role[];
  title: string;
};

type AuthUser = {
  accessCodes: string[];
  avatar: string;
  homePath: string;
  label: string;
  name: string;
  role: Role;
  studio: string;
  username: string;
};

const AUTH_STORAGE_KEY = "zenox-auth-session";
const REMEMBER_USERNAME_KEY = "zenox-remember-username";

const mockAccounts: AuthUser[] = [
  {
    accessCodes: ["dashboard:view", "lesson:manage", "homework:review", "billing:export", "system:admin"],
    avatar: "赵",
    homePath: "dashboard",
    label: "管理员 / 工作室负责人",
    name: "赵辰雄",
    role: "admin",
    studio: "ZenoX Studio",
    username: "zcx",
  },
  {
    accessCodes: ["dashboard:view", "lesson:manage", "homework:review", "billing:view"],
    avatar: "师",
    homePath: "dashboard",
    label: "授课老师",
    name: "林老师",
    role: "teacher",
    studio: "ZenoX Studio",
    username: "teacher",
  },
  {
    accessCodes: ["dashboard:view", "lesson:view", "homework:submit", "question:create"],
    avatar: "学",
    homePath: "dashboard",
    label: "学生端体验",
    name: "王一诺",
    role: "student",
    studio: "ZenoX Family",
    username: "student",
  },
  {
    accessCodes: ["dashboard:view", "lesson:view", "billing:view", "record:view"],
    avatar: "家",
    homePath: "dashboard",
    label: "家长端体验",
    name: "王女士",
    role: "parent",
    studio: "ZenoX Family",
    username: "parent",
  },
];

const modules: ModuleItem[] = [
  { group: "工作台", icon: LayoutDashboard, key: "dashboard", roles: ["admin", "teacher", "student", "parent"], title: "工作台" },
  { group: "教学", icon: CalendarDays, key: "schedule", roles: ["admin", "teacher", "student", "parent"], title: "日历排课", badge: "冲突" },
  { group: "教学", icon: Users, key: "classes", roles: ["admin", "teacher"], title: "班级学员" },
  { group: "教学", icon: UploadCloud, key: "homework", roles: ["admin", "teacher", "student", "parent"], title: "作业中心", badge: "18" },
  { group: "教学", icon: Tags, key: "review", roles: ["admin", "teacher", "student", "parent"], title: "批改反馈" },
  { group: "教学", icon: BookOpen, key: "forum", roles: ["admin", "teacher", "student"], title: "题库论坛" },
  { group: "教学", icon: ClipboardCheck, key: "records", roles: ["admin", "teacher", "student", "parent"], title: "上课记录" },
  { group: "运营", icon: Bell, key: "reminders", roles: ["admin", "teacher", "student", "parent"], title: "提醒中心" },
  { group: "运营", icon: CircleDollarSign, key: "billing", roles: ["admin", "teacher", "parent"], title: "收费记录" },
  { group: "运营", icon: ReceiptText, key: "monthly", roles: ["admin", "teacher", "parent"], title: "月结 PDF" },
  { group: "系统", icon: ShieldCheck, key: "permission", roles: ["admin"], title: "权限套餐" },
  { group: "系统", icon: Settings2, key: "fields", roles: ["admin", "teacher"], title: "自定义字段" },
];

const defaultPreferences: Preferences = {
  accent: "blue",
  animation: true,
  collapsed: false,
  contentWidth: "fluid",
  density: "comfortable",
  glass: "frosted",
  gray: false,
  language: "zh",
  layout: "sidebar",
  mode: "light",
  navStyle: "glass",
  radius: "round",
  transition: "slide",
  weak: false,
};

const todoItems = [
  { label: "王一诺作业待点评", meta: "二次函数压轴 8 题", priority: "high", type: "作业" },
  { label: "19:00 高一物理课前提醒", meta: "腾讯会议链接待发送", priority: "medium", type: "上课" },
  { label: "李泽昨天请假，需要安排补课", meta: "本周五前处理", priority: "medium", type: "修改" },
  { label: "月底账单 PDF 待生成", meta: "5 位家长付款记录", priority: "low", type: "账单" },
];

const todayLessons = [
  ["09:00", "初二数学 A 班", "函数图像", "已完成"],
  ["14:30", "王一诺 1v1", "二次函数压轴", "待上课"],
  ["19:00", "高一物理班", "牛顿定律", "待提醒"],
] as const;

const stats = [
  ["今日课程", "3", "手动排课"],
  ["待办事项", "4", "需要处理"],
  ["待批作业", "18", "文字点评"],
  ["本月收入", "¥42,860", "按人收费"],
] as const;

const scheduleLessons = [
  { time: "09:00-10:30", title: "初二数学 A 班", subject: "函数图像专题", members: "6 人", status: "已完成", tone: "green", note: "课后记录待补充" },
  { time: "14:30-16:00", title: "王一诺 1v1", subject: "二次函数压轴", members: "1 人", status: "待上课", tone: "blue", note: "作业已发布" },
  { time: "19:00-20:30", title: "高一物理班", subject: "牛顿定律", members: "5 人", status: "待提醒", tone: "amber", note: "会议链接待发送" },
  { time: "20:00-21:00", title: "李泽补课", subject: "圆锥曲线基础", members: "1 人", status: "时间冲突", tone: "red", note: "与物理班重叠 30 分钟" },
];

const classCards = [
  { name: "初二数学 A 班", count: "6 名学生", plan: "周三/周六 手动排课", progress: "函数图像 62%", next: "下节：一次函数综合" },
  { name: "高一物理班", count: "5 名学生", plan: "临时排课", progress: "牛顿定律 48%", next: "下节：受力分析" },
  { name: "1v1 精准提升", count: "4 名学生", plan: "按学生单独排课", progress: "错题复盘 71%", next: "下节：压轴题拆解" },
];

const studentCards = [
  { name: "王一诺", grade: "初三", subject: "数学", weak: "二次函数", balance: "18 课时", parent: "王女士" },
  { name: "李泽", grade: "高二", subject: "数学", weak: "解析几何", balance: "9 课时", parent: "李先生" },
  { name: "陈嘉禾", grade: "高一", subject: "物理", weak: "受力分析", balance: "15 课时", parent: "陈女士" },
];

const homeworkPipeline = [
  { stage: "待发布", title: "函数图像分层练习", target: "初二数学 A 班", due: "今天 21:00", count: "24 题" },
  { stage: "进行中", title: "牛顿定律错题复盘", target: "高一物理班", due: "明天 18:00", count: "5/6 已提交" },
  { stage: "待批改", title: "二次函数压轴 8 题", target: "王一诺", due: "已截止", count: "18 张图片" },
];

const reviewQueue = [
  { student: "王一诺", homework: "二次函数压轴 8 题", tags: ["审题", "步骤"], status: "待文字点评" },
  { student: "陈嘉禾", homework: "牛顿第二定律", tags: ["概念", "模型"], status: "待打分" },
  { student: "林雨桐", homework: "函数图像综合", tags: ["计算"], status: "可生成讲评" },
];

const questionCards = [
  { title: "一次函数与几何面积结合", meta: "初二数学 / 中等 / 12 收藏", scope: "班级题库" },
  { title: "弹簧模型受力分析", meta: "高一物理 / 较难 / 8 评论", scope: "公开题库" },
  { title: "二次函数动点压轴拆解", meta: "初三数学 / 困难 / 26 收藏", scope: "私有题库" },
];

const recordCards = [
  { lesson: "初二数学 A 班", summary: "完成函数图像变换，2 人需要补基础练习", status: "待发布作业" },
  { lesson: "王一诺 1v1", summary: "压轴题思路清楚，但计算稳定性不足", status: "待家长查看" },
  { lesson: "高一物理班", summary: "下节课进入整体法与隔离法对比", status: "草稿" },
];

const reminderCards = [
  { time: "18:30", title: "高一物理班课前提醒", target: "学生 + 家长", channel: "微信订阅消息" },
  { time: "21:00", title: "函数图像作业截止提醒", target: "未提交学生", channel: "小程序" },
  { time: "周五 20:00", title: "李泽补课确认", target: "家长", channel: "微信订阅消息" },
];

const billingCards = [
  { name: "王一诺", amount: "¥3,600", lessons: "12 课时", status: "待确认" },
  { name: "初二数学 A 班", amount: "¥12,800", lessons: "64 人次", status: "已收款" },
  { name: "高一物理班", amount: "¥8,460", lessons: "47 人次", status: "部分付款" },
];

const customFields = [
  ["学生档案", "薄弱点、目标学校、剩余课时", "老师可见"],
  ["课程记录", "课堂表现、下次计划、家长摘要", "老师/家长可见"],
  ["作业批改", "错因标签、讲评优先级", "老师/学生可见"],
] as const;

const accentOptions: Array<{ key: Accent; label: string }> = [
  { key: "blue", label: "海盐蓝" },
  { key: "violet", label: "星云紫" },
  { key: "cyan", label: "冰湖青" },
  { key: "emerald", label: "松石绿" },
  { key: "rose", label: "玫瑰粉" },
  { key: "amber", label: "日光橙" },
  { key: "graphite", label: "石墨黑" },
];

const layoutOptions: Array<{ key: LayoutMode; label: string; tip: string }> = [
  { key: "sidebar", label: "侧边导航", tip: "适合老师日常管理，功能入口稳定。" },
  { key: "top", label: "顶部导航", tip: "适合演示型 SaaS，横向空间更开阔。" },
  { key: "mixed", label: "混合导航", tip: "适合工作室，保留图标主导航。" },
  { key: "compact", label: "紧凑导航", tip: "适合小屏和高频录入。" },
];

function loadPreferences(): Preferences {
  try {
    const raw = window.localStorage.getItem("zenox-preferences");
    return raw ? { ...defaultPreferences, ...JSON.parse(raw) } : defaultPreferences;
  } catch {
    return defaultPreferences;
  }
}

function loadAuthSession() {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function Skeleton() {
  return (
    <div className="bootScreen">
      <div className="bootRail">
        <span />
        <span />
        <span />
      </div>
      <div className="bootCenter">
        <div className="bootLogo">
          <GraduationCap size={30} />
          <i />
        </div>
        <strong>ZenoX</strong>
        <p>Loading workspace preferences</p>
        <div className="bootProgress">
          <span />
        </div>
      </div>
    </div>
  );
}

function groupModules(items: ModuleItem[]) {
  return items.reduce<Record<ModuleItem["group"], ModuleItem[]>>(
    (acc, item) => {
      acc[item.group].push(item);
      return acc;
    },
    { 工作台: [], 教学: [], 运营: [], 系统: [] },
  );
}

function ModuleStatus({ tone, children }: { tone?: string; children: string }) {
  return <span className={`statusTag ${tone ?? "blue"}`}>{children}</span>;
}

function ModuleToolbar({ primary }: { primary: string }) {
  return (
    <div className="moduleToolbar">
      <button className="ghostButton">筛选</button>
      <button className="ghostButton">导出</button>
      <button className="blackButton">{primary}</button>
    </div>
  );
}

function ModuleWorkspace({ module }: { module: ModuleItem }) {
  const Icon = module.icon;

  if (module.key === "schedule") {
    return (
      <section className="moduleView">
        <article className="panel moduleHeader glowCard">
          <div className="moduleTitle">
            <Icon size={26} />
            <div>
              <p className="overline">Lesson Calendar</p>
              <h2>日历排课</h2>
              <span>手动按日期排课，优先发现学生、老师和时间段冲突。</span>
            </div>
          </div>
          <ModuleToolbar primary="新建课程" />
        </article>
        <div className="moduleGrid scheduleGrid">
          <article className="panel scheduleBoard">
            <div className="boardHeader">
              <strong>2026 年 6 月 29 日</strong>
              <div className="segmented small">
                <button className="active">日</button>
                <button>周</button>
                <button>月</button>
              </div>
            </div>
            {scheduleLessons.map((lesson) => (
              <div className="scheduleRow" key={`${lesson.time}-${lesson.title}`}>
                <time>{lesson.time}</time>
                <div>
                  <strong>{lesson.title}</strong>
                  <small>{lesson.subject} · {lesson.members}</small>
                  <span>{lesson.note}</span>
                </div>
                <ModuleStatus tone={lesson.tone}>{lesson.status}</ModuleStatus>
              </div>
            ))}
          </article>
          <article className="panel insightPanel">
            <p className="overline">Conflict Guard</p>
            <h3>冲突检测</h3>
            <strong>1 个时间冲突</strong>
            <span>李泽补课与高一物理班重叠 30 分钟。建议改到 20:40 或周五 19:30。</span>
          </article>
        </div>
      </section>
    );
  }

  if (module.key === "classes") {
    return (
      <section className="moduleView">
        <article className="panel moduleHeader glowCard">
          <div className="moduleTitle">
            <Icon size={26} />
            <div>
              <p className="overline">Roster</p>
              <h2>班级学员</h2>
              <span>把一对一和小班都放进班级/小组模型，后端可直接接 class_group。</span>
            </div>
          </div>
          <ModuleToolbar primary="新增学员" />
        </article>
        <div className="moduleGrid twoColumns">
          <article className="panel">
            <div className="panelHeader">
              <div>
                <p className="overline">Classes</p>
                <h3>班级列表</h3>
              </div>
              <Users size={20} />
            </div>
            <div className="cardStack">
              {classCards.map((card) => (
                <div className="businessCard" key={card.name}>
                  <strong>{card.name}</strong>
                  <span>{card.count} · {card.plan}</span>
                  <small>{card.progress}</small>
                  <em>{card.next}</em>
                </div>
              ))}
            </div>
          </article>
          <article className="panel">
            <div className="panelHeader">
              <div>
                <p className="overline">Students</p>
                <h3>重点学员</h3>
              </div>
              <GraduationCap size={20} />
            </div>
            <div className="studentGrid">
              {studentCards.map((student) => (
                <div className="studentCard" key={student.name}>
                  <strong>{student.name}</strong>
                  <span>{student.grade} · {student.subject}</span>
                  <small>薄弱点：{student.weak}</small>
                  <small>剩余：{student.balance}</small>
                  <em>{student.parent}</em>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    );
  }

  if (module.key === "homework") {
    return (
      <section className="moduleView">
        <article className="panel moduleHeader glowCard">
          <div className="moduleTitle">
            <Icon size={26} />
            <div>
              <p className="overline">Homework Flow</p>
              <h2>作业中心</h2>
              <span>覆盖发布、可见范围、截止提醒和提交状态，先用 mock 数据跑通教师视角。</span>
            </div>
          </div>
          <ModuleToolbar primary="发布作业" />
        </article>
        <div className="pipelineGrid">
          {homeworkPipeline.map((item) => (
            <article className="panel pipelineColumn" key={item.stage}>
              <p className="overline">{item.stage}</p>
              <h3>{item.title}</h3>
              <span>{item.target}</span>
              <div>
                <ModuleStatus>{item.due}</ModuleStatus>
                <ModuleStatus tone="violet">{item.count}</ModuleStatus>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (module.key === "review") {
    return (
      <section className="moduleView">
        <article className="panel moduleHeader glowCard">
          <div className="moduleTitle">
            <Icon size={26} />
            <div>
              <p className="overline">Review Queue</p>
              <h2>批改反馈</h2>
              <span>第一版先支持文字点评、得分和错因标签，AI 批改以后再接入。</span>
            </div>
          </div>
          <ModuleToolbar primary="开始批改" />
        </article>
        <article className="panel reviewList">
          {reviewQueue.map((item) => (
            <div className="reviewRow" key={`${item.student}-${item.homework}`}>
              <div>
                <strong>{item.student}</strong>
                <span>{item.homework}</span>
              </div>
              <div className="tagList">
                {item.tags.map((tag) => <ModuleStatus tone="violet" key={tag}>{tag}</ModuleStatus>)}
              </div>
              <ModuleStatus tone="amber">{item.status}</ModuleStatus>
            </div>
          ))}
        </article>
      </section>
    );
  }

  if (module.key === "forum") {
    return (
      <section className="moduleView">
        <article className="panel moduleHeader glowCard">
          <div className="moduleTitle">
            <Icon size={26} />
            <div>
              <p className="overline">Question Bank</p>
              <h2>题库论坛</h2>
              <span>老师和学生都能沉淀好题，按学科、年级、知识点和范围管理。</span>
            </div>
          </div>
          <ModuleToolbar primary="上传题目" />
        </article>
        <div className="moduleGrid threeColumns">
          {questionCards.map((question) => (
            <article className="panel questionCard" key={question.title}>
              <ModuleStatus tone="green">{question.scope}</ModuleStatus>
              <h3>{question.title}</h3>
              <span>{question.meta}</span>
              <button className="ghostButton">转为作业</button>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (module.key === "records") {
    return (
      <section className="moduleView">
        <article className="panel moduleHeader glowCard">
          <div className="moduleTitle">
            <Icon size={26} />
            <div>
              <p className="overline">Class Records</p>
              <h2>上课记录</h2>
              <span>记录课堂评价、作业情况和下次计划；第一版不要求家长确认记录。</span>
            </div>
          </div>
          <ModuleToolbar primary="写上课记录" />
        </article>
        <div className="cardStack">
          {recordCards.map((record) => (
            <article className="panel recordCard" key={record.lesson}>
              <div>
                <strong>{record.lesson}</strong>
                <span>{record.summary}</span>
              </div>
              <ModuleStatus>{record.status}</ModuleStatus>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (module.key === "reminders") {
    return (
      <section className="moduleView">
        <article className="panel moduleHeader glowCard">
          <div className="moduleTitle">
            <Icon size={26} />
            <div>
              <p className="overline">Notifications</p>
              <h2>提醒中心</h2>
              <span>先覆盖上课和作业提醒；账单提醒按产品决策暂不做。</span>
            </div>
          </div>
          <ModuleToolbar primary="新建提醒" />
        </article>
        <article className="panel timelinePanel">
          {reminderCards.map((item) => (
            <div className="timelineItem" key={`${item.time}-${item.title}`}>
              <time>{item.time}</time>
              <div>
                <strong>{item.title}</strong>
                <span>{item.target} · {item.channel}</span>
              </div>
            </div>
          ))}
        </article>
      </section>
    );
  }

  if (module.key === "billing" || module.key === "monthly") {
    return (
      <section className="moduleView">
        <article className="panel moduleHeader glowCard">
          <div className="moduleTitle">
            <Icon size={26} />
            <div>
              <p className="overline">{module.key === "monthly" ? "Monthly PDF" : "Billing"}</p>
              <h2>{module.title}</h2>
              <span>按学生/班级统计课时和收款，支付只做记录，不接在线交易。</span>
            </div>
          </div>
          <ModuleToolbar primary={module.key === "monthly" ? "生成 PDF" : "记录收款"} />
        </article>
        <div className="moduleGrid threeColumns">
          {billingCards.map((item) => (
            <article className="panel financeCard" key={item.name}>
              <span>{item.lessons}</span>
              <h3>{item.name}</h3>
              <strong>{item.amount}</strong>
              <ModuleStatus tone={item.status === "已收款" ? "green" : "amber"}>{item.status}</ModuleStatus>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (module.key === "permission") {
    return (
      <section className="moduleView">
        <article className="panel moduleHeader glowCard">
          <div className="moduleTitle">
            <Icon size={26} />
            <div>
              <p className="overline">SaaS Plan</p>
              <h2>权限套餐</h2>
              <span>保留专业版和工作室版差异，角色可见性由登录态和权限决定。</span>
            </div>
          </div>
          <ModuleToolbar primary="配置套餐" />
        </article>
        <article className="panel permissionMatrix">
          {["TENANT_OWNER", "TEACHER", "STUDENT", "PARENT", "PLATFORM_ADMIN"].map((role) => (
            <div key={role}>
              <strong>{role}</strong>
              <span>{role === "TENANT_OWNER" ? "全部管理权限" : role === "PLATFORM_ADMIN" ? "SaaS 运营权限" : "按授权范围查看和操作"}</span>
            </div>
          ))}
        </article>
      </section>
    );
  }

  if (module.key === "fields") {
    return (
      <section className="moduleView">
        <article className="panel moduleHeader glowCard">
          <div className="moduleTitle">
            <Icon size={26} />
            <div>
              <p className="overline">Custom Fields</p>
              <h2>自定义字段</h2>
              <span>给学生档案、课程记录和作业批改预留 SaaS 级扩展能力。</span>
            </div>
          </div>
          <ModuleToolbar primary="新增字段" />
        </article>
        <article className="panel fieldsTable">
          {customFields.map(([scope, fields, visible]) => (
            <div key={scope}>
              <strong>{scope}</strong>
              <span>{fields}</span>
              <ModuleStatus tone="green">{visible}</ModuleStatus>
            </div>
          ))}
        </article>
      </section>
    );
  }

  return (
    <section className="moduleView">
      <article className="panel moduleHero glowCard">
        <Icon size={34} />
        <div>
          <p className="overline">Module Workspace</p>
          <h2>{module.title}</h2>
          <span>这里是独立模块工作区。下一步每个模块会拆成自己的列表、表单、详情和权限页面。</span>
        </div>
      </article>
    </section>
  );
}

function LoginView({
  onLogin,
  preferences,
  updatePreference,
}: {
  onLogin: (user: AuthUser) => void;
  preferences: Preferences;
  updatePreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
}) {
  const rememberedUsername = window.localStorage.getItem(REMEMBER_USERNAME_KEY) ?? mockAccounts[0].username;
  const [selectedAccount, setSelectedAccount] = useState(rememberedUsername);
  const [username, setUsername] = useState(rememberedUsername);
  const [password, setPassword] = useState("123456");
  const [rememberMe, setRememberMe] = useState(Boolean(rememberedUsername));
  const [authPanel, setAuthPanel] = useState<AuthPanelPlacement>("right");
  const [captchaReady, setCaptchaReady] = useState(false);
  const [error, setError] = useState("");
  const [isDraggingCaptcha, setIsDraggingCaptcha] = useState(false);
  const [sliderProgress, setSliderProgress] = useState(0);
  const sliderTrackRef = useRef<HTMLDivElement>(null);

  const selectedProfile = mockAccounts.find((account) => account.username === selectedAccount) ?? mockAccounts[0];

  const handleAccountSelect = (nextUsername: string) => {
    const account = mockAccounts.find((item) => item.username === nextUsername) ?? mockAccounts[0];
    setSelectedAccount(account.username);
    setUsername(account.username);
    setPassword("123456");
    setCaptchaReady(false);
    setSliderProgress(0);
    setError("");
  };

  const getSliderProgress = (clientX: number) => {
    const rect = sliderTrackRef.current?.getBoundingClientRect();
    if (!rect) {
      return 0;
    }
    return Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
  };

  const completeCaptcha = () => {
    setCaptchaReady(true);
    setIsDraggingCaptcha(false);
    setSliderProgress(100);
    setError("");
  };

  const handleCaptchaPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (captchaReady) {
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDraggingCaptcha(true);
    setError("");
    const nextProgress = getSliderProgress(event.clientX);
    setSliderProgress(nextProgress);
  };

  const handleCaptchaPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDraggingCaptcha || captchaReady) {
      return;
    }
    const nextProgress = getSliderProgress(event.clientX);
    if (nextProgress >= 92) {
      completeCaptcha();
      return;
    }
    setSliderProgress(nextProgress);
  };

  const handleCaptchaPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (captchaReady) {
      return;
    }
    const nextProgress = getSliderProgress(event.clientX);
    if (nextProgress >= 92) {
      completeCaptcha();
      return;
    }
    setIsDraggingCaptcha(false);
    setSliderProgress(0);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const account = mockAccounts.find((item) => item.username === username.trim());
    if (!account || password !== "123456") {
      setError("账号或密码不正确。演示密码为 123456。");
      return;
    }
    if (!captchaReady) {
      setError("请先完成安全验证。");
      return;
    }
    if (rememberMe) {
      window.localStorage.setItem(REMEMBER_USERNAME_KEY, account.username);
    } else {
      window.localStorage.removeItem(REMEMBER_USERNAME_KEY);
    }
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(account));
    onLogin(account);
  };

  return (
    <section className={`authShell auth-${authPanel}`}>
      <div className="authToolbar">
        <div className="authPlacementSwitch" aria-label="登录框位置">
          {(["left", "center", "right"] as AuthPanelPlacement[]).map((placement) => (
            <button
              className={authPanel === placement ? "active" : ""}
              key={placement}
              onClick={() => setAuthPanel(placement)}
              title={placement === "left" ? "登录框靠左" : placement === "center" ? "登录框居中" : "登录框靠右"}
              type="button"
            >
              {placement === "left" ? <PanelLeftOpen size={16} /> : placement === "center" ? <LayoutDashboard size={16} /> : <PanelLeftClose size={16} />}
            </button>
          ))}
        </div>
        <button className="iconButton" onClick={() => updatePreference("language", preferences.language === "zh" ? "en" : "zh")}>
          <Languages size={17} />
          {preferences.language.toUpperCase()}
        </button>
        <button className="iconButton" onClick={() => updatePreference("mode", preferences.mode === "dark" ? "light" : "dark")}>
          {preferences.mode === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>

      <article className="authBrandPanel">
        <div className="brandArea authBrand">
          <div className="brandIcon">
            <GraduationCap size={24} />
          </div>
          <div>
            <strong>ZenoX</strong>
            <span>Tutor SaaS Workspace</span>
          </div>
        </div>
        <div className="authSlogan">
          <span className="chip">Inspired by Vben Admin architecture</span>
          <h1>登录后进入属于当前角色的教学工作台。</h1>
          <p>从登录态开始决定权限、导航和首页内容。老师看到排课和批改，家长看到课时和账单，学生看到作业与反馈。</p>
        </div>
        <div className="authFeatureGrid">
          <div>
            <ShieldCheck size={20} />
            <strong>动态权限</strong>
            <span>按角色过滤模块入口</span>
          </div>
          <div>
            <Palette size={20} />
            <strong>偏好系统</strong>
            <span>主题、布局、动效可持久化</span>
          </div>
          <div>
            <CheckCircle2 size={20} />
            <strong>安全验证</strong>
            <span>预留验证码和后端登录接口</span>
          </div>
        </div>
      </article>

      <article className="authCard panel glowCard">
        <div className="authTitle">
          <p className="overline">Welcome Back</p>
          <h2>欢迎回到 ZenoX</h2>
          <span>选择一个演示身份，密码固定为 123456。</span>
        </div>

        <div className="accountTabs">
          {mockAccounts.map((account) => (
            <button
              className={selectedProfile.username === account.username ? "active" : ""}
              key={account.username}
              onClick={() => handleAccountSelect(account.username)}
              type="button"
            >
              <span>{account.avatar}</span>
              <strong>{account.label}</strong>
            </button>
          ))}
        </div>

        <form className="authForm" onSubmit={handleSubmit}>
          <label>
            <span>账号</span>
            <div>
              <UserRound size={18} />
              <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="请输入账号" />
            </div>
          </label>
          <label>
            <span>密码</span>
            <div>
              <KeyRound size={18} />
              <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder="请输入密码" type="password" />
            </div>
          </label>

          <div
            aria-label="拖动滑块完成安全验证"
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={Math.round(sliderProgress)}
            className={captchaReady ? "sliderCaptcha done" : isDraggingCaptcha ? "sliderCaptcha dragging" : "sliderCaptcha"}
            onPointerDown={handleCaptchaPointerDown}
            onPointerMove={handleCaptchaPointerMove}
            onPointerUp={handleCaptchaPointerUp}
            ref={sliderTrackRef}
            role="slider"
            tabIndex={0}
          >
            <span className="sliderFill" style={{ width: `${sliderProgress}%` }} />
            <span className="sliderText">{captchaReady ? "安全验证已完成" : "按住滑块，拖到最右侧"}</span>
            <span className="sliderHandle" style={{ left: `calc(${sliderProgress}% - ${sliderProgress * 0.46}px)` }}>
              {captchaReady ? <CheckCircle2 size={18} /> : <ArrowRight size={18} />}
            </span>
          </div>

          <div className="authOptions">
            <label>
              <input checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} type="checkbox" />
              记住账号
            </label>
            <button type="button">忘记密码</button>
          </div>

          {error ? <p className="authError">{error}</p> : null}

          <button className="blackButton authSubmit" type="submit">
            登录工作台
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="authAltActions">
          <button className="ghostButton" type="button">
            <Smartphone size={17} />
            手机验证码
          </button>
          <button className="ghostButton" type="button">
            <QrCode size={17} />
            微信扫码
          </button>
        </div>
      </article>
    </section>
  );
}

export function App() {
  const [activeKey, setActiveKey] = useState("dashboard");
  const [authSession, setAuthSession] = useState<AuthUser | null>(loadAuthSession);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<ModuleItem["group"], boolean>>({
    工作台: true,
    教学: true,
    运营: false,
    系统: false,
  });
  const [preferences, setPreferences] = useState<Preferences>(loadPreferences);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 760);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("zenox-preferences", JSON.stringify(preferences));
  }, [preferences]);

  const visibleModules = useMemo(
    () => modules.filter((item) => authSession && item.roles.includes(authSession.role)),
    [authSession],
  );

  const moduleGroups = useMemo(() => groupModules(visibleModules), [visibleModules]);
  const activeModule = visibleModules.find((item) => item.key === activeKey) ?? visibleModules[0];

  useEffect(() => {
    if (authSession && visibleModules.length > 0 && !visibleModules.some((item) => item.key === activeKey)) {
      setActiveKey(authSession.homePath);
    }
  }, [activeKey, authSession, visibleModules]);

  const rootClass = [
    "zenoxApp",
    `theme-${preferences.accent}`,
    `mode-${preferences.mode}`,
    `radius-${preferences.radius}`,
    `density-${preferences.density}`,
    `content-${preferences.contentWidth}`,
    `glass-${preferences.glass}`,
    `layout-${preferences.layout}`,
    `nav-${preferences.navStyle}`,
    `transition-${preferences.transition}`,
    preferences.collapsed ? "is-collapsed" : "",
    preferences.animation ? "motion-on" : "motion-off",
    preferences.gray ? "is-gray" : "",
    preferences.weak ? "is-weak" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const updatePreference = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPreferences((current) => ({ ...current, [key]: value }));
  };

  const toggleGroup = (group: ModuleItem["group"]) => {
    setOpenGroups((current) => ({ ...current, [group]: !current[group] }));
  };

  const handleLogin = (user: AuthUser) => {
    setAuthSession(user);
    setActiveKey(user.homePath);
  };

  const handleLogout = () => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthSession(null);
    setActiveKey("dashboard");
  };

  if (!ready) {
    return <Skeleton />;
  }

  if (!authSession) {
    return (
      <div className={rootClass}>
        <div className="ambientGlow one" />
        <div className="ambientGlow two" />
        <LoginView onLogin={handleLogin} preferences={preferences} updatePreference={updatePreference} />
      </div>
    );
  }

  return (
    <div className={rootClass}>
      <div className="ambientGlow one" />
      <div className="ambientGlow two" />

      <aside className="sideNav">
        <div className="brandArea">
          <div className="brandIcon">
            <GraduationCap size={24} />
          </div>
          <div>
            <strong>ZenoX</strong>
            <span>{authSession.studio}</span>
          </div>
        </div>

        <nav className="navGroups" aria-label="功能模块">
          {Object.entries(moduleGroups).map(([group, items]) =>
            items.length > 0 ? (
              (() => {
                const groupKey = group as ModuleItem["group"];
                const isAlwaysOpen = preferences.collapsed || preferences.layout === "top" || preferences.layout === "mixed";
                const isOpen = isAlwaysOpen || openGroups[groupKey];
                return (
                  <section className="navGroup" key={group}>
                    <button
                      className={isOpen ? "navGroupTitle open" : "navGroupTitle"}
                      onClick={() => toggleGroup(groupKey)}
                      aria-expanded={isOpen}
                    >
                      <span>{group}</span>
                      <small>{items.length}</small>
                      <ChevronDown size={15} />
                    </button>
                    <div className="navGroupBody" aria-hidden={!isOpen}>
                      {items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            className={activeKey === item.key ? "navButton active" : "navButton"}
                            key={item.key}
                            onClick={() => setActiveKey(item.key)}
                            title={item.title}
                          >
                            <Icon size={18} />
                            <span>{item.title}</span>
                            {item.badge ? <em>{item.badge}</em> : null}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })()
            ) : null,
          )}
        </nav>

        <div className="accountCard">
          <div className="avatar">{authSession.avatar}</div>
          <div>
            <strong>{authSession.name}</strong>
            <span>系统已识别：{authSession.label}</span>
          </div>
        </div>
      </aside>

      <main className="mainStage">
        <header className="topbar">
          <div className="leftTop">
            <button
              className="iconButton"
              onClick={() => updatePreference("collapsed", !preferences.collapsed)}
              title="折叠菜单"
            >
              {preferences.collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
            </button>
            <div>
              <p className="overline">Login-based workspace</p>
              <h1>{activeKey === "dashboard" ? "工作台" : activeModule?.title}</h1>
            </div>
          </div>

          <div className="topActions">
            <label className="searchBox">
              <Search size={17} />
              <input placeholder="搜索课程、学生、作业、题库" />
            </label>
            <button
              className="iconButton"
              onClick={() => updatePreference("language", preferences.language === "zh" ? "en" : "zh")}
            >
              <Languages size={18} />
              {preferences.language.toUpperCase()}
            </button>
            <button className="blackButton" onClick={() => setDrawerOpen(true)}>
              <Palette size={18} />
              主题
            </button>
            <button className="iconButton" onClick={handleLogout} title="退出登录">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {activeKey === "dashboard" ? (
          <section className="dashboardView">
            <article className="heroPanel glowCard">
              <div>
                <span className="chip">Zhao Chenxiong Product ID</span>
                <h2>把排课、作业、提醒、收费拆成清晰模块，首页只保留今天必须处理的事。</h2>
                <p>真实角色由登录态判断，侧边栏自动展示权限内模块。老师每天少找入口，家长学生只看自己的内容。</p>
              </div>
              <div className="statsGrid">
                {stats.map(([label, value, meta]) => (
                  <div className="statCard" key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                    <small>{meta}</small>
                  </div>
                ))}
              </div>
            </article>

            <section className="homeGrid">
              <article className="panel todoPanel glowCard">
                <div className="panelHeader">
                  <div>
                    <p className="overline">Action Center</p>
                    <h3>待办提醒</h3>
                  </div>
                  <Bell size={20} />
                </div>
                <div className="todoList">
                  {todoItems.map((item) => (
                    <button className={`todoItem ${item.priority}`} key={item.label}>
                      <span>{item.type}</span>
                      <div>
                        <strong>{item.label}</strong>
                        <small>{item.meta}</small>
                      </div>
                      <ChevronRight size={17} />
                    </button>
                  ))}
                </div>
              </article>

              <article className="panel lessonPanel glowCard">
                <div className="panelHeader">
                  <div>
                    <p className="overline">Today</p>
                    <h3>今日课程</h3>
                  </div>
                  <CalendarCheck size={20} />
                </div>
                <div className="lessonList">
                  {todayLessons.map(([time, name, topic, status]) => (
                    <div className="lessonRow" key={`${time}-${name}`}>
                      <time>{time}</time>
                      <div>
                        <strong>{name}</strong>
                        <small>{topic}</small>
                      </div>
                      <em>{status}</em>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          </section>
        ) : (
          <ModuleWorkspace module={activeModule} />
        )}
      </main>

      <div className={drawerOpen ? "drawerMask open" : "drawerMask"} onClick={() => setDrawerOpen(false)} />
      <aside className={drawerOpen ? "themeDrawer open" : "themeDrawer"} aria-label="主题配置">
        <header>
          <div>
            <p className="overline">Preferences</p>
            <h2>主题配置</h2>
          </div>
          <button className="iconButton" onClick={() => setDrawerOpen(false)}>
            <X size={18} />
          </button>
        </header>

        <section className="settingGroup">
          <label>主题模式</label>
          <div className="segmented">
            {(["light", "dark", "auto"] as ThemeMode[]).map((mode) => (
              <button className={preferences.mode === mode ? "active" : ""} key={mode} onClick={() => updatePreference("mode", mode)}>
                {mode === "light" ? <Sun size={16} /> : mode === "dark" ? <Moon size={16} /> : <Sparkles size={16} />}
                {mode === "light" ? "浅色" : mode === "dark" ? "深色" : "跟随"}
              </button>
            ))}
          </div>
        </section>

        <section className="settingGroup">
          <label>品牌色</label>
          <div className="themePresets">
            {accentOptions.map((accent) => (
              <button
                className={preferences.accent === accent.key ? `themePreset active ${accent.key}` : `themePreset ${accent.key}`}
                key={accent.key}
                onClick={() => updatePreference("accent", accent.key)}
              >
                <span className={`swatch ${accent.key}`} />
                <strong>{accent.label}</strong>
              </button>
            ))}
          </div>
        </section>

        <section className="settingGroup">
          <label>布局模式</label>
          <div className="layoutPresets">
            {layoutOptions.map((layout) => (
              <button
                className={preferences.layout === layout.key ? `layoutPreset active ${layout.key}` : `layoutPreset ${layout.key}`}
                key={layout.key}
                onClick={() => updatePreference("layout", layout.key)}
              >
                <span className="layoutPreview">
                  <i />
                  <b />
                  <em />
                </span>
                <strong>{layout.label}</strong>
                <small>{layout.tip}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="settingGroup">
          <label>布局细节</label>
          <div className="switchRows">
            <button onClick={() => updatePreference("collapsed", !preferences.collapsed)}>
              <Menu size={17} />
              侧栏折叠
              <strong>{preferences.collapsed ? "开" : "关"}</strong>
            </button>
            <button onClick={() => updatePreference("density", preferences.density === "comfortable" ? "compact" : "comfortable")}>
              <Settings2 size={17} />
              内容密度
              <strong>{preferences.density === "comfortable" ? "舒适" : "紧凑"}</strong>
            </button>
            <button onClick={() => updatePreference("contentWidth", preferences.contentWidth === "fluid" ? "boxed" : "fluid")}>
              <PanelLeftOpen size={17} />
              内容宽度
              <strong>{preferences.contentWidth === "fluid" ? "铺满" : "定宽"}</strong>
            </button>
            <button onClick={() => updatePreference("navStyle", preferences.navStyle === "glass" ? "plain" : "glass")}>
              <Home size={17} />
              导航风格
              <strong>{preferences.navStyle === "glass" ? "玻璃" : "极简"}</strong>
            </button>
            <button onClick={() => updatePreference("radius", preferences.radius === "round" ? "soft" : preferences.radius === "soft" ? "pill" : "round")}>
              <FileText size={17} />
              圆角
              <strong>{preferences.radius === "round" ? "圆润" : preferences.radius === "soft" ? "轻柔" : "胶囊"}</strong>
            </button>
          </div>
        </section>

        <section className="settingGroup">
          <label>视觉质感</label>
          <div className="segmented">
            {(["light", "frosted", "crystal"] as Glass[]).map((glass) => (
              <button className={preferences.glass === glass ? "active" : ""} key={glass} onClick={() => updatePreference("glass", glass)}>
                {glass === "light" ? "轻透" : glass === "frosted" ? "磨砂" : "水晶"}
              </button>
            ))}
          </div>
          <div className="segmented">
            {(["fade", "slide", "scale"] as Transition[]).map((transition) => (
              <button className={preferences.transition === transition ? "active" : ""} key={transition} onClick={() => updatePreference("transition", transition)}>
                {transition === "fade" ? "淡入" : transition === "slide" ? "滑入" : "缩放"}
              </button>
            ))}
          </div>
        </section>

        <section className="settingGroup">
          <label>辅助效果</label>
          <div className="switchRows">
            <button onClick={() => updatePreference("animation", !preferences.animation)}>
              <WandSparkles size={17} />
              页面动画
              <strong>{preferences.animation ? "开" : "关"}</strong>
            </button>
            <button onClick={() => updatePreference("gray", !preferences.gray)}>
              <ShieldCheck size={17} />
              灰度模式
              <strong>{preferences.gray ? "开" : "关"}</strong>
            </button>
            <button onClick={() => updatePreference("weak", !preferences.weak)}>
              <Sparkles size={17} />
              色弱模式
              <strong>{preferences.weak ? "开" : "关"}</strong>
            </button>
          </div>
        </section>
      </aside>
    </div>
  );
}
