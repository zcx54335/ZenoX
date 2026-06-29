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
type ModuleKey =
  | "dashboard"
  | "schedule"
  | "classes"
  | "homework"
  | "review"
  | "forum"
  | "records"
  | "reminders"
  | "billing"
  | "monthly"
  | "permission"
  | "fields";
type ModuleCopy = { title: string; description: string; primary?: string };

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
  key: ModuleKey;
  permissionCode: string;
  roles: Role[];
  title: string;
};

type AuthUser = {
  accessCodes: string[];
  accessToken?: string;
  avatar: string;
  homePath: string;
  id?: number;
  label: string;
  name: string;
  refreshToken?: string;
  role: Role;
  studio: string;
  tenantId?: number;
  username: string;
};

const AUTH_STORAGE_KEY = "zenox-auth-session";
const REMEMBER_USERNAME_KEY = "zenox-remember-username";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8080";

type ApiResponse<T> = {
  code: number;
  data: T;
  message: string;
};

type BackendRole = "TENANT_OWNER" | "TEACHER" | "ASSISTANT" | "STUDENT" | "PARENT" | "PLATFORM_ADMIN";

type BackendLoginResponse = {
  accessCodes: string[];
  accessToken: string;
  refreshToken: string;
  user: {
    displayName: string;
    id: number;
    role: BackendRole;
    tenantId: number;
    username: string;
  };
};

type ServerStudent = {
  grade?: string;
  id: number;
  name: string;
  parentName?: string;
  remainingLessons?: number;
  school?: string;
  subject?: string;
  weaknessNote?: string;
};

type ServerClassGroup = {
  description?: string;
  grade?: string;
  id: number;
  name: string;
  subject?: string;
};

type ServerLesson = {
  classGroupId?: number;
  classGroupName?: string;
  deliveryMode?: string;
  endsAt: string;
  id: number;
  lessonHours?: number;
  studentCount?: number;
  startsAt: string;
  status: string;
  subject?: string;
  topic?: string;
};

type ServerHomework = {
  content?: string;
  dueAt?: string;
  id: number;
  lessonId?: number;
  status: string;
  title: string;
};

type WorkspaceData = {
  classes: ServerClassGroup[];
  homework: ServerHomework[];
  lessons: ServerLesson[];
  students: ServerStudent[];
};

const mockAccounts: AuthUser[] = [
  {
    accessCodes: ["dashboard:view", "lesson:view", "lesson:manage", "student:view", "student:manage", "homework:view", "homework:manage", "homework:review", "billing:export", "system:admin"],
    avatar: "赵",
    homePath: "dashboard",
    label: "管理员 / 工作室负责人",
    name: "赵辰雄",
    role: "admin",
    studio: "ZenoX Studio",
    username: "zcx",
  },
  {
    accessCodes: ["dashboard:view", "lesson:view", "lesson:manage", "student:view", "student:manage", "homework:view", "homework:manage", "homework:review", "question:view", "record:view", "reminder:view", "billing:view"],
    avatar: "师",
    homePath: "dashboard",
    label: "授课老师",
    name: "林老师",
    role: "teacher",
    studio: "ZenoX Studio",
    username: "teacher",
  },
  {
    accessCodes: ["homework:view", "homework:submit", "homework:review", "question:view", "question:create", "record:view"],
    avatar: "学",
    homePath: "homework",
    label: "学生端体验",
    name: "王一诺",
    role: "student",
    studio: "ZenoX Family",
    username: "student",
  },
  {
    accessCodes: ["homework:view", "homework:review", "record:view", "billing:view", "billing:export"],
    avatar: "家",
    homePath: "homework",
    label: "家长端体验",
    name: "王女士",
    role: "parent",
    studio: "ZenoX Family",
    username: "parent",
  },
];

const modules: ModuleItem[] = [
  { group: "工作台", icon: LayoutDashboard, key: "dashboard", permissionCode: "dashboard:view", roles: ["admin", "teacher", "student", "parent"], title: "工作台" },
  { group: "教学", icon: CalendarDays, key: "schedule", permissionCode: "lesson:view", roles: ["admin", "teacher", "student", "parent"], title: "日历排课", badge: "冲突" },
  { group: "教学", icon: Users, key: "classes", permissionCode: "student:view", roles: ["admin", "teacher"], title: "班级学员" },
  { group: "教学", icon: UploadCloud, key: "homework", permissionCode: "homework:view", roles: ["admin", "teacher", "student", "parent"], title: "作业中心", badge: "18" },
  { group: "教学", icon: Tags, key: "review", permissionCode: "homework:review", roles: ["admin", "teacher", "student", "parent"], title: "批改反馈" },
  { group: "教学", icon: BookOpen, key: "forum", permissionCode: "question:view", roles: ["admin", "teacher", "student"], title: "题库论坛" },
  { group: "教学", icon: ClipboardCheck, key: "records", permissionCode: "record:view", roles: ["admin", "teacher", "student", "parent"], title: "上课记录" },
  { group: "运营", icon: Bell, key: "reminders", permissionCode: "reminder:view", roles: ["admin", "teacher", "student", "parent"], title: "提醒中心" },
  { group: "运营", icon: CircleDollarSign, key: "billing", permissionCode: "billing:view", roles: ["admin", "teacher", "parent"], title: "收费记录" },
  { group: "运营", icon: ReceiptText, key: "monthly", permissionCode: "billing:export", roles: ["admin", "teacher", "parent"], title: "月结 PDF" },
  { group: "系统", icon: ShieldCheck, key: "permission", permissionCode: "system:admin", roles: ["admin"], title: "权限套餐" },
  { group: "系统", icon: Settings2, key: "fields", permissionCode: "field:manage", roles: ["admin", "teacher"], title: "自定义字段" },
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

const glassOptions: Array<{ key: Glass; label: string; tip: string }> = [
  { key: "light", label: "轻透", tip: "更清爽，面板更实" },
  { key: "frosted", label: "磨砂", tip: "雾面玻璃，层次柔和" },
  { key: "crystal", label: "水晶", tip: "高透明，高光更强" },
];

const transitionOptions: Array<{ key: Transition; label: string; tip: string }> = [
  { key: "fade", label: "淡入", tip: "安静柔和" },
  { key: "slide", label: "滑入", tip: "更有方向感" },
  { key: "scale", label: "缩放", tip: "更有空间感" },
];

const uiText = {
  zh: {
    groups: {
      工作台: "工作台",
      教学: "教学",
      运营: "运营",
      系统: "系统",
    },
    moduleContext: {
      工作台: "工作台",
      教学: "教学工作区",
      运营: "运营工作区",
      系统: "系统设置",
    },
    modules: {
      dashboard: {
        title: "工作台",
        description: "今天必须处理的课程、作业、提醒和账单。",
      },
      schedule: {
        title: "日历排课",
        description: "手动按日期排课，优先发现学生、老师和时间段冲突。",
        primary: "新建课程",
      },
      classes: {
        title: "班级学员",
        description: "把一对一和小班都放进班级/小组模型，后端可直接接 class_group。",
        primary: "新增学员",
      },
      homework: {
        title: "作业中心",
        description: "覆盖发布、可见范围、截止提醒和提交状态，先用 mock 数据跑通教师视角。",
        primary: "发布作业",
      },
      review: {
        title: "批改反馈",
        description: "第一版先支持文字点评、得分和错因标签，AI 批改以后再接入。",
        primary: "开始批改",
      },
      forum: {
        title: "题库论坛",
        description: "老师和学生都能沉淀好题，按学科、年级、知识点和范围管理。",
        primary: "上传题目",
      },
      records: {
        title: "上课记录",
        description: "记录课堂评价、作业情况和下次计划；第一版不要求家长确认记录。",
        primary: "写上课记录",
      },
      reminders: {
        title: "提醒中心",
        description: "先覆盖上课和作业提醒；账单提醒按产品决策暂不做。",
        primary: "新建提醒",
      },
      billing: {
        title: "收费记录",
        description: "按学生/班级统计课时和收款，支付只做记录，不接在线交易。",
        primary: "记录收款",
      },
      monthly: {
        title: "月结 PDF",
        description: "按学生/班级统计课时和收款，生成可发送给家长的月度记录。",
        primary: "生成 PDF",
      },
      permission: {
        title: "权限套餐",
        description: "保留专业版和工作室版差异，角色可见性由登录态和权限决定。",
        primary: "配置套餐",
      },
      fields: {
        title: "自定义字段",
        description: "给学生档案、课程记录和作业批改预留 SaaS 级扩展能力。",
        primary: "新增字段",
      },
    },
    topbar: {
      overline: "登录态工作台",
      search: "搜索课程、学生、作业、题库",
      theme: "主题",
      logout: "退出登录",
    },
    toolbar: {
      filter: "筛选",
      export: "导出",
    },
    drawer: {
      title: "主题配置",
      mode: "主题模式",
      brand: "品牌色",
      layout: "布局模式",
      detail: "布局细节",
      visual: "视觉质感",
      effects: "辅助效果",
    },
    auth: {
      placement: "登录框位置",
      left: "登录框靠左",
      center: "登录框居中",
      right: "登录框靠右",
      sloganBadge: "ZenoX 产品级登录体验",
      sloganTitle: "登录后进入属于当前角色的教学工作台。",
      sloganDesc: "从登录态开始决定权限、导航和首页内容。老师看到排课和批改，家长看到课时和账单，学生看到作业与反馈。",
      title: "欢迎回到 ZenoX",
      subtitle: "请输入账号密码，系统会从数据库识别角色与权限。",
      account: "账号",
      accountPlaceholder: "请输入账号",
      password: "密码",
      passwordPlaceholder: "请输入密码",
      captchaDone: "安全验证已完成",
      captchaHint: "按住滑块，拖到最右侧",
      remember: "记住账号",
      forgot: "忘记密码",
      submit: "登录工作台",
      mobile: "手机验证码",
      wechat: "微信扫码",
      invalid: "账号或密码不正确。演示密码为 123456。",
      captchaRequired: "请先完成安全验证。",
    },
  },
  en: {
    groups: {
      工作台: "Home",
      教学: "Teaching",
      运营: "Operations",
      系统: "System",
    },
    moduleContext: {
      工作台: "Workspace",
      教学: "Teaching Workspace",
      运营: "Operations Workspace",
      系统: "System Settings",
    },
    modules: {
      dashboard: {
        title: "Dashboard",
        description: "Courses, homework, reminders, and billing items that need attention today.",
      },
      schedule: {
        title: "Schedule",
        description: "Manually schedule by date and catch student, teacher, or time conflicts early.",
        primary: "New Lesson",
      },
      classes: {
        title: "Classes & Students",
        description: "Model both one-on-one lessons and small groups as classes for a clean backend contract.",
        primary: "Add Student",
      },
      homework: {
        title: "Homework Center",
        description: "Publish homework, manage visibility, deadlines, reminders, and submission states.",
        primary: "Publish",
      },
      review: {
        title: "Review Feedback",
        description: "Start with text comments, scores, and mistake tags before AI-assisted grading.",
        primary: "Start Review",
      },
      forum: {
        title: "Question Forum",
        description: "Collect high-quality questions by subject, grade, knowledge point, and visibility scope.",
        primary: "Upload Question",
      },
      records: {
        title: "Class Records",
        description: "Capture class feedback, homework status, and the next learning plan.",
        primary: "Write Record",
      },
      reminders: {
        title: "Reminders",
        description: "Cover lesson and homework reminders first; billing reminders are intentionally excluded.",
        primary: "New Reminder",
      },
      billing: {
        title: "Billing",
        description: "Track lessons and payments by student or class without online payment processing.",
        primary: "Record Payment",
      },
      monthly: {
        title: "Monthly PDF",
        description: "Generate monthly lesson records that can be shared with parents.",
        primary: "Generate PDF",
      },
      permission: {
        title: "Plans & Access",
        description: "Keep plan differences explicit and derive visibility from login state and permissions.",
        primary: "Configure Plan",
      },
      fields: {
        title: "Custom Fields",
        description: "Reserve SaaS-grade extension points for student profiles, records, and homework reviews.",
        primary: "Add Field",
      },
    },
    topbar: {
      overline: "Login-based workspace",
      search: "Search lessons, students, homework, questions",
      theme: "Theme",
      logout: "Log out",
    },
    toolbar: {
      filter: "Filter",
      export: "Export",
    },
    drawer: {
      title: "Preferences",
      mode: "Mode",
      brand: "Brand Color",
      layout: "Layout",
      detail: "Layout Details",
      visual: "Visual Effects",
      effects: "Assistive Effects",
    },
    auth: {
      placement: "Login panel position",
      left: "Panel on left",
      center: "Panel centered",
      right: "Panel on right",
      sloganBadge: "Product-grade ZenoX login",
      sloganTitle: "Enter a role-aware teaching workspace after login.",
      sloganDesc: "Permissions, navigation, and dashboard content are derived from login state. Teachers see scheduling and review, parents see billing, and students see homework feedback.",
      title: "Welcome back to ZenoX",
      subtitle: "Sign in with your account. Roles and permissions are resolved by the backend.",
      account: "Account",
      accountPlaceholder: "Enter account",
      password: "Password",
      passwordPlaceholder: "Enter password",
      captchaDone: "Verification complete",
      captchaHint: "Hold and drag the slider to the right",
      remember: "Remember account",
      forgot: "Forgot password",
      submit: "Enter Workspace",
      mobile: "Mobile code",
      wechat: "WeChat QR",
      invalid: "Invalid account or password. Demo password: 123456.",
      captchaRequired: "Please complete the security verification first.",
    },
  },
} satisfies Record<Preferences["language"], {
  groups: Record<ModuleItem["group"], string>;
  moduleContext: Record<ModuleItem["group"], string>;
  modules: Record<ModuleKey, ModuleCopy>;
  topbar: { overline: string; search: string; theme: string; logout: string };
  toolbar: { filter: string; export: string };
  drawer: { title: string; mode: string; brand: string; layout: string; detail: string; visual: string; effects: string };
  auth: {
    placement: string;
    left: string;
    center: string;
    right: string;
    sloganBadge: string;
    sloganTitle: string;
    sloganDesc: string;
    title: string;
    subtitle: string;
    account: string;
    accountPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    captchaDone: string;
    captchaHint: string;
    remember: string;
    forgot: string;
    submit: string;
    mobile: string;
    wechat: string;
    invalid: string;
    captchaRequired: string;
  };
}>;

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
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as AuthUser;
    if (!Array.isArray(parsed.accessCodes) || parsed.accessCodes.length === 0) {
      const fallback = mockAccounts.find((account) => account.username === parsed.username || account.role === parsed.role);
      return fallback ? { ...fallback, ...parsed, accessCodes: fallback.accessCodes } : null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function mapBackendRole(role: BackendRole): Role {
  if (role === "TENANT_OWNER" || role === "PLATFORM_ADMIN") {
    return "admin";
  }
  if (role === "TEACHER" || role === "ASSISTANT") {
    return "teacher";
  }
  return role === "PARENT" ? "parent" : "student";
}

function buildSessionFromLogin(payload: BackendLoginResponse): AuthUser {
  const role = mapBackendRole(payload.user.role);
  const fallback = mockAccounts.find((account) => account.role === role) ?? mockAccounts[0];
  return {
    ...fallback,
    accessCodes: payload.accessCodes,
    accessToken: payload.accessToken,
    avatar: payload.user.displayName.slice(0, 1) || fallback.avatar,
    id: payload.user.id,
    label: fallback.label,
    name: payload.user.displayName,
    refreshToken: payload.refreshToken,
    role,
    studio: "ZenoX Studio",
    tenantId: payload.user.tenantId,
    username: payload.user.username,
  };
}

async function loginWithPassword(username: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    body: JSON.stringify({ password, username }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const payload = (await response.json()) as ApiResponse<BackendLoginResponse>;
  if (!response.ok || payload.code !== 0) {
    throw new Error(payload.message || "Login failed");
  }
  return buildSessionFromLogin(payload.data);
}

async function apiGet<T>(path: string, accessToken?: string) {
  if (!accessToken) {
    throw new Error("登录已过期，请重新登录。");
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const payload = (await response.json()) as ApiResponse<T>;
  if (!response.ok || payload.code !== 0) {
    throw new Error(payload.message || "请求失败");
  }
  return payload.data;
}

async function apiSend<T>(path: string, method: "POST" | "PUT" | "PATCH", accessToken: string | undefined, body?: unknown) {
  if (!accessToken) {
    throw new Error("登录已过期，请重新登录。");
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    method,
  });
  const payload = (await response.json()) as ApiResponse<T>;
  if (!response.ok || payload.code !== 0) {
    throw new Error(payload.message || "请求失败");
  }
  return payload.data;
}

async function apiDownload(path: string, accessToken?: string) {
  if (!accessToken) {
    throw new Error("登录已过期，请重新登录。");
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error("导出失败，请稍后重试。");
  }
  return response.blob();
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

function ModuleToolbar({ labels, primary }: { labels: { filter: string; export: string }; primary: string }) {
  return (
    <div className="moduleToolbar">
      <button className="ghostButton">{labels.filter}</button>
      <button className="ghostButton">{labels.export}</button>
      <button className="blackButton">{primary}</button>
    </div>
  );
}

function formatDateTime(value?: string) {
  if (!value) {
    return "-";
  }
  return new Intl.DateTimeFormat("zh-CN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

function formatTime(value?: string) {
  if (!value) {
    return "--:--";
  }
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function combineDateAndTime(date: string, time: string) {
  return `${date}T${time}:00`;
}

function toLocalDateTimeValue(date: Date) {
  const day = toDateInputValue(date);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${day}T${hours}:${minutes}:${seconds}`;
}

function shiftIsoDateTime(value: string, minutes: number) {
  return toLocalDateTimeValue(new Date(new Date(value).getTime() + minutes * 60_000));
}

function weekDaysFrom(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00`);
  const day = date.getDay() || 7;
  const monday = new Date(date);
  monday.setDate(date.getDate() - day + 1);
  return Array.from({ length: 7 }, (_, index) => {
    const next = new Date(monday);
    next.setDate(monday.getDate() + index);
    return toDateInputValue(next);
  });
}

function lessonStatusLabel(status: string) {
  const labels: Record<string, string> = {
    CANCELLED: "已取消",
    CHECKED_IN: "已签到",
    COMPLETED: "已完成",
    LEAVE_REQUESTED: "请假",
    MAKEUP_PENDING: "待补课",
    SCHEDULED: "待上课",
  };
  return labels[status] ?? status;
}

function homeworkStatusLabel(status: string) {
  const labels: Record<string, string> = {
    CLOSED: "已关闭",
    DRAFT: "草稿",
    PUBLISHED: "已发布",
  };
  return labels[status] ?? status;
}

function dataTone(status: string) {
  if (["COMPLETED", "PUBLISHED"].includes(status)) {
    return "green";
  }
  if (["DRAFT", "SCHEDULED"].includes(status)) {
    return "blue";
  }
  if (["CANCELLED", "CLOSED"].includes(status)) {
    return "red";
  }
  return "amber";
}

function EmptyState({ children }: { children: string }) {
  return <div className="dataState">{children}</div>;
}

function ModuleWorkspace({ authSession, language, module }: { authSession: AuthUser; language: Preferences["language"]; module: ModuleItem }) {
  const Icon = module.icon;
  const text = uiText[language];
  const moduleText: ModuleCopy = text.modules[module.key] ?? { title: module.title, description: "" };
  const toolbarLabels = text.toolbar;
  const [data, setData] = useState<WorkspaceData>({ classes: [], homework: [], lessons: [], students: [] });
  const [dataError, setDataError] = useState("");
  const [dataLoading, setDataLoading] = useState(false);
  const [lessonForm, setLessonForm] = useState({
    classGroupId: "",
    date: toDateInputValue(new Date()),
    deliveryMode: "ONLINE",
    endsAt: "20:30",
    lessonHours: "1.5",
    startsAt: "19:00",
    subject: "数学",
    topic: "",
    unitPrice: "0",
  });
  const [exportMonth, setExportMonth] = useState(toDateInputValue(new Date()).slice(0, 7));
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [scheduleMessage, setScheduleMessage] = useState("");
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);
  const [selectedScheduleDate, setSelectedScheduleDate] = useState(toDateInputValue(new Date()));
  const lessonComposerRef = useRef<HTMLElement>(null);
  const classNameById = useMemo(
    () => new Map(data.classes.map((item) => [item.id, item.name])),
    [data.classes],
  );
  const selectedDateLessons = useMemo(
    () => data.lessons.filter((lesson) => toDateInputValue(new Date(lesson.startsAt)) === selectedScheduleDate),
    [data.lessons, selectedScheduleDate],
  );
  const weekDays = useMemo(() => weekDaysFrom(selectedScheduleDate), [selectedScheduleDate]);

  const refreshScheduleData = async () => {
    const [lessons, classes] = await Promise.all([
      apiGet<ServerLesson[]>("/api/lessons", authSession.accessToken),
      apiGet<ServerClassGroup[]>("/api/classes", authSession.accessToken),
    ]);
    setData((current) => ({ ...current, classes, lessons }));
  };

  useEffect(() => {
    if (!["schedule", "classes", "homework"].includes(module.key)) {
      return;
    }
    let ignore = false;
    const load = async () => {
      setDataError("");
      setDataLoading(true);
      try {
        if (module.key === "schedule") {
          const [lessons, classes] = await Promise.all([
            apiGet<ServerLesson[]>("/api/lessons", authSession.accessToken),
            apiGet<ServerClassGroup[]>("/api/classes", authSession.accessToken),
          ]);
          if (!ignore) {
            setData((current) => ({ ...current, classes, lessons }));
          }
        }
        if (module.key === "classes") {
          const [classes, students] = await Promise.all([
            apiGet<ServerClassGroup[]>("/api/classes", authSession.accessToken),
            apiGet<ServerStudent[]>("/api/students", authSession.accessToken),
          ]);
          if (!ignore) {
            setData((current) => ({ ...current, classes, students }));
          }
        }
        if (module.key === "homework") {
          const [homework, lessons, classes] = await Promise.all([
            apiGet<ServerHomework[]>("/api/homework", authSession.accessToken),
            apiGet<ServerLesson[]>("/api/lessons", authSession.accessToken),
            apiGet<ServerClassGroup[]>("/api/classes", authSession.accessToken),
          ]);
          if (!ignore) {
            setData((current) => ({ ...current, classes, homework, lessons }));
          }
        }
      } catch (error) {
        if (!ignore) {
          setDataError(error instanceof Error ? error.message : "数据加载失败");
        }
      } finally {
        if (!ignore) {
          setDataLoading(false);
        }
      }
    };
    void load();
    return () => {
      ignore = true;
    };
  }, [authSession.accessToken, module.key]);

  const handleCreateLesson = async (event: FormEvent) => {
    event.preventDefault();
    if (!lessonForm.classGroupId) {
      setScheduleMessage("请先选择班级或 1v1 小组。");
      return;
    }
    setScheduleSubmitting(true);
    setScheduleMessage("");
    try {
      await apiSend<ServerLesson>("/api/lessons", "POST", authSession.accessToken, {
        classGroupId: Number(lessonForm.classGroupId),
        deliveryMode: lessonForm.deliveryMode,
        endsAt: combineDateAndTime(lessonForm.date, lessonForm.endsAt),
        lessonHours: Number(lessonForm.lessonHours),
        startsAt: combineDateAndTime(lessonForm.date, lessonForm.startsAt),
        subject: lessonForm.subject,
        topic: lessonForm.topic,
        unitPrice: Number(lessonForm.unitPrice),
      });
      setSelectedScheduleDate(lessonForm.date);
      setLessonForm((current) => ({ ...current, topic: "" }));
      setScheduleMessage("排课成功，已写入数据库。");
      await refreshScheduleData();
    } catch (error) {
      setScheduleMessage(error instanceof Error ? error.message : "排课失败");
    } finally {
      setScheduleSubmitting(false);
    }
  };

  const handleDelayLesson = async (lesson: ServerLesson) => {
    setScheduleSubmitting(true);
    setScheduleMessage("");
    try {
      await apiSend<ServerLesson>(`/api/lessons/${lesson.id}/reschedule`, "PUT", authSession.accessToken, {
        endsAt: shiftIsoDateTime(lesson.endsAt, 30),
        startsAt: shiftIsoDateTime(lesson.startsAt, 30),
      });
      setScheduleMessage("已顺延 30 分钟，并重新检查冲突。");
      await refreshScheduleData();
    } catch (error) {
      setScheduleMessage(error instanceof Error ? error.message : "调课失败");
    } finally {
      setScheduleSubmitting(false);
    }
  };

  const handleCancelLesson = async (lesson: ServerLesson) => {
    setScheduleSubmitting(true);
    setScheduleMessage("");
    try {
      await apiSend<ServerLesson>(`/api/lessons/${lesson.id}/cancel`, "PATCH", authSession.accessToken);
      setScheduleMessage("课程已取消。");
      await refreshScheduleData();
    } catch (error) {
      setScheduleMessage(error instanceof Error ? error.message : "取消失败");
    } finally {
      setScheduleSubmitting(false);
    }
  };

  const focusLessonComposer = () => {
    lessonComposerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setScheduleMessage("请填写课程信息，保存后会自动检查冲突。");
  };

  const handleExportLessons = async () => {
    setExporting(true);
    setScheduleMessage("");
    try {
      const blob = await apiDownload(`/api/lessons/export?month=${encodeURIComponent(exportMonth)}`, authSession.accessToken);
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `ZenoX-课程记录-${exportMonth}.xlsx`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
      setScheduleMessage(`已导出 ${exportMonth} 的课程记录 Excel。`);
      setExportOpen(false);
    } catch (error) {
      setScheduleMessage(error instanceof Error ? error.message : "导出失败");
    } finally {
      setExporting(false);
    }
  };

  if (module.key === "schedule") {
    return (
      <section className="moduleView">
        <article className="panel moduleHeader glowCard">
          <div className="moduleTitle">
            <Icon size={26} />
            <div>
              <p className="overline">Lesson Calendar</p>
              <h2>{moduleText.title}</h2>
              <span>{moduleText.description}</span>
            </div>
          </div>
          <div className="moduleToolbar compact">
            <button className="ghostButton" onClick={() => setExportOpen((current) => !current)} type="button">导出 Excel</button>
            <button className="blackButton" onClick={focusLessonComposer} type="button">{moduleText.primary ?? "新建课程"}</button>
          </div>
        </article>
        {exportOpen ? (
          <article className="panel exportPanel">
            <div>
              <p className="overline">Export</p>
              <strong>选择导出月份</strong>
              <span>导出该月份内所有课程记录，包含时间、班级、课时、单价、金额和状态。</span>
            </div>
            <input onChange={(event) => setExportMonth(event.target.value)} type="month" value={exportMonth} />
            <button className="blackButton" disabled={exporting} onClick={() => void handleExportLessons()} type="button">
              {exporting ? "导出中..." : "确认导出"}
            </button>
          </article>
        ) : null}
        <div className="moduleGrid scheduleGrid">
          <article className="panel scheduleBoard">
            <div className="boardHeader">
              <strong>{selectedScheduleDate}</strong>
              <input
                className="datePicker"
                onChange={(event) => {
                  setSelectedScheduleDate(event.target.value);
                  setLessonForm((current) => ({ ...current, date: event.target.value }));
                }}
                type="date"
                value={selectedScheduleDate}
              />
            </div>
            <div className="weekStrip">
              {weekDays.map((day) => (
                <button className={day === selectedScheduleDate ? "active" : ""} key={day} onClick={() => setSelectedScheduleDate(day)} type="button">
                  <span>{new Intl.DateTimeFormat("zh-CN", { weekday: "short" }).format(new Date(`${day}T00:00:00`))}</span>
                  <strong>{day.slice(5)}</strong>
                </button>
              ))}
            </div>
            {dataLoading ? <EmptyState>正在读取后端排课数据...</EmptyState> : null}
            {dataError ? <EmptyState>{dataError}</EmptyState> : null}
            {!dataLoading && !dataError && selectedDateLessons.length === 0 ? <EmptyState>当天暂无课程，可以从右侧创建新课。</EmptyState> : null}
            {!dataLoading && !dataError ? selectedDateLessons.map((lesson) => (
              <div className="scheduleRow" key={`${lesson.id}-${lesson.startsAt}`}>
                <time>{formatTime(lesson.startsAt)}<small>{formatTime(lesson.endsAt)}</small></time>
                <div>
                  <strong>{lesson.classGroupName ?? classNameById.get(lesson.classGroupId ?? 0) ?? "未绑定班级"}</strong>
                  <small>{lesson.subject ?? "未设置科目"} · {lesson.topic ?? "未填写主题"}</small>
                  <span>{lesson.studentCount ?? 0} 名学生 · {lesson.lessonHours ?? 1} 课时 · {lesson.deliveryMode ?? "ONLINE"}</span>
                </div>
                <div className="lessonActions">
                  <ModuleStatus tone={dataTone(lesson.status)}>{lessonStatusLabel(lesson.status)}</ModuleStatus>
                  <button className="ghostButton" disabled={scheduleSubmitting || lesson.status === "CANCELLED"} onClick={() => void handleDelayLesson(lesson)} type="button">顺延</button>
                  <button className="ghostButton danger" disabled={scheduleSubmitting || lesson.status === "CANCELLED"} onClick={() => void handleCancelLesson(lesson)} type="button">取消</button>
                </div>
              </div>
            )) : null}
          </article>
          <article className="panel lessonComposer" ref={lessonComposerRef}>
            <p className="overline">Create Lesson</p>
            <h3>新建课程</h3>
            <form onSubmit={handleCreateLesson}>
              <label>
                <span>班级 / 1v1 小组</span>
                <select
                  onChange={(event) => {
                    const selectedClass = data.classes.find((item) => String(item.id) === event.target.value);
                    setLessonForm((current) => ({
                      ...current,
                      classGroupId: event.target.value,
                      subject: selectedClass?.subject ?? current.subject,
                    }));
                  }}
                  required
                  value={lessonForm.classGroupId}
                >
                  <option value="">请选择</option>
                  {data.classes.map((classGroup) => (
                    <option key={classGroup.id} value={classGroup.id}>{classGroup.name}</option>
                  ))}
                </select>
              </label>
              <div className="formPair">
                <label>
                  <span>日期</span>
                  <input onChange={(event) => setLessonForm((current) => ({ ...current, date: event.target.value }))} type="date" value={lessonForm.date} />
                </label>
                <label>
                  <span>上课方式</span>
                  <select onChange={(event) => setLessonForm((current) => ({ ...current, deliveryMode: event.target.value }))} value={lessonForm.deliveryMode}>
                    <option value="ONLINE">线上</option>
                    <option value="OFFLINE">线下</option>
                  </select>
                </label>
              </div>
              <div className="formPair">
                <label>
                  <span>开始</span>
                  <input onChange={(event) => setLessonForm((current) => ({ ...current, startsAt: event.target.value }))} type="time" value={lessonForm.startsAt} />
                </label>
                <label>
                  <span>结束</span>
                  <input onChange={(event) => setLessonForm((current) => ({ ...current, endsAt: event.target.value }))} type="time" value={lessonForm.endsAt} />
                </label>
              </div>
              <label>
                <span>课程主题</span>
                <input onChange={(event) => setLessonForm((current) => ({ ...current, topic: event.target.value }))} placeholder="例如：二次函数压轴题" value={lessonForm.topic} />
              </label>
              <div className="formPair">
                <label>
                  <span>科目</span>
                  <input onChange={(event) => setLessonForm((current) => ({ ...current, subject: event.target.value }))} value={lessonForm.subject} />
                </label>
                <label>
                  <span>课时</span>
                  <input min="0.5" onChange={(event) => setLessonForm((current) => ({ ...current, lessonHours: event.target.value }))} step="0.5" type="number" value={lessonForm.lessonHours} />
                </label>
              </div>
              <label>
                <span>单价</span>
                <input min="0" onChange={(event) => setLessonForm((current) => ({ ...current, unitPrice: event.target.value }))} step="10" type="number" value={lessonForm.unitPrice} />
              </label>
              {scheduleMessage ? <div className="scheduleMessage">{scheduleMessage}</div> : null}
              <button className="blackButton" disabled={scheduleSubmitting} type="submit">
                {scheduleSubmitting ? "处理中..." : "保存排课"}
              </button>
            </form>
          </article>
          <article className="panel insightPanel">
            <p className="overline">Conflict Guard</p>
            <h3>排课规则</h3>
            <strong>{selectedDateLessons.length} / {data.lessons.length}</strong>
            <span>系统会阻止老师时间冲突、班级时间冲突，以及同一学生跨班级同时上课。取消课程后，该时间段可重新排课。</span>
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
              <h2>{moduleText.title}</h2>
              <span>{moduleText.description}</span>
            </div>
          </div>
          <ModuleToolbar labels={toolbarLabels} primary={moduleText.primary ?? ""} />
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
              {dataLoading ? <EmptyState>正在读取后端班级数据...</EmptyState> : null}
              {dataError ? <EmptyState>{dataError}</EmptyState> : null}
              {!dataLoading && !dataError && data.classes.length === 0 ? <EmptyState>暂无班级数据</EmptyState> : null}
              {!dataLoading && !dataError ? data.classes.map((card) => (
                <div className="businessCard" key={card.id}>
                  <strong>{card.name}</strong>
                  <span>{card.grade ?? "未设置年级"} · {card.subject ?? "未设置科目"}</span>
                  <small>{card.description ?? "暂无班级说明"}</small>
                  <em>来自数据库 class_group</em>
                </div>
              )) : null}
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
              {dataLoading ? <EmptyState>正在读取后端学员数据...</EmptyState> : null}
              {dataError ? <EmptyState>{dataError}</EmptyState> : null}
              {!dataLoading && !dataError && data.students.length === 0 ? <EmptyState>暂无学员数据</EmptyState> : null}
              {!dataLoading && !dataError ? data.students.map((student) => (
                <div className="studentCard" key={student.id}>
                  <strong>{student.name}</strong>
                  <span>{student.grade ?? "未设置年级"} · {student.subject ?? "未设置科目"}</span>
                  <small>薄弱点：{student.weaknessNote ?? "暂无记录"}</small>
                  <small>剩余：{student.remainingLessons ?? 0} 课时</small>
                  <em>{student.parentName ?? "未绑定家长"}</em>
                </div>
              )) : null}
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
              <h2>{moduleText.title}</h2>
              <span>{moduleText.description}</span>
            </div>
          </div>
          <ModuleToolbar labels={toolbarLabels} primary={moduleText.primary ?? ""} />
        </article>
        <div className="pipelineGrid">
          {dataLoading ? <article className="panel pipelineColumn"><EmptyState>正在读取后端作业数据...</EmptyState></article> : null}
          {dataError ? <article className="panel pipelineColumn"><EmptyState>{dataError}</EmptyState></article> : null}
          {!dataLoading && !dataError && data.homework.length === 0 ? <article className="panel pipelineColumn"><EmptyState>暂无作业数据</EmptyState></article> : null}
          {!dataLoading && !dataError ? data.homework.map((item) => {
            const lesson = data.lessons.find((lessonItem) => lessonItem.id === item.lessonId);
            const target = lesson ? classNameById.get(lesson.classGroupId ?? 0) : "未绑定课程";
            return (
            <article className="panel pipelineColumn" key={item.id}>
              <p className="overline">{homeworkStatusLabel(item.status)}</p>
              <h3>{item.title}</h3>
              <span>{target ?? "未绑定班级"}</span>
              <small>{item.content ?? "暂无作业内容"}</small>
              <div>
                <ModuleStatus tone={dataTone(item.status)}>{item.dueAt ? formatDateTime(item.dueAt) : "无截止时间"}</ModuleStatus>
                <ModuleStatus tone="violet">来自数据库 homework</ModuleStatus>
              </div>
            </article>
            );
          }) : null}
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
              <h2>{moduleText.title}</h2>
              <span>{moduleText.description}</span>
            </div>
          </div>
          <ModuleToolbar labels={toolbarLabels} primary={moduleText.primary ?? ""} />
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
              <h2>{moduleText.title}</h2>
              <span>{moduleText.description}</span>
            </div>
          </div>
          <ModuleToolbar labels={toolbarLabels} primary={moduleText.primary ?? ""} />
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
              <h2>{moduleText.title}</h2>
              <span>{moduleText.description}</span>
            </div>
          </div>
          <ModuleToolbar labels={toolbarLabels} primary={moduleText.primary ?? ""} />
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
              <h2>{moduleText.title}</h2>
              <span>{moduleText.description}</span>
            </div>
          </div>
          <ModuleToolbar labels={toolbarLabels} primary={moduleText.primary ?? ""} />
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
              <h2>{moduleText.title}</h2>
              <span>{moduleText.description}</span>
            </div>
          </div>
          <ModuleToolbar labels={toolbarLabels} primary={moduleText.primary ?? ""} />
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
              <h2>{moduleText.title}</h2>
              <span>{moduleText.description}</span>
            </div>
          </div>
          <ModuleToolbar labels={toolbarLabels} primary={moduleText.primary ?? ""} />
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
              <h2>{moduleText.title}</h2>
              <span>{moduleText.description}</span>
            </div>
          </div>
          <ModuleToolbar labels={toolbarLabels} primary={moduleText.primary ?? ""} />
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
          <h2>{moduleText.title}</h2>
          <span>{moduleText.description}</span>
        </div>
      </article>
    </section>
  );
}

function LoginView({
  onOpenPreferences,
  onLogin,
  preferences,
  updatePreference,
}: {
  onOpenPreferences: () => void;
  onLogin: (user: AuthUser) => void;
  preferences: Preferences;
  updatePreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
}) {
  const rememberedUsername = window.localStorage.getItem(REMEMBER_USERNAME_KEY) ?? mockAccounts[0].username;
  const [username, setUsername] = useState(rememberedUsername);
  const [password, setPassword] = useState("123456");
  const [rememberMe, setRememberMe] = useState(Boolean(rememberedUsername));
  const [authPanel, setAuthPanel] = useState<AuthPanelPlacement>("right");
  const [captchaReady, setCaptchaReady] = useState(false);
  const [error, setError] = useState("");
  const [isDraggingCaptcha, setIsDraggingCaptcha] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sliderProgress, setSliderProgress] = useState(0);
  const sliderTrackRef = useRef<HTMLDivElement>(null);
  const authText = uiText[preferences.language].auth;
  const credentialNote = preferences.language === "zh"
    ? "演示账号：zcx、teacher、student、parent；密码均为 123456。"
    : "Demo accounts: zcx, teacher, student, parent. Password: 123456.";

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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!captchaReady) {
      setError(authText.captchaRequired);
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      const account = await loginWithPassword(username.trim(), password);
      if (rememberMe) {
        window.localStorage.setItem(REMEMBER_USERNAME_KEY, account.username);
      } else {
        window.localStorage.removeItem(REMEMBER_USERNAME_KEY);
      }
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(account));
      onLogin(account);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : authText.invalid);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={`authShell auth-${authPanel}`}>
      <div className="authToolbar">
        <div className="authPlacementSwitch" aria-label={authText.placement}>
          {(["left", "center", "right"] as AuthPanelPlacement[]).map((placement) => (
            <button
              className={authPanel === placement ? "active" : ""}
              key={placement}
              onClick={() => setAuthPanel(placement)}
              title={placement === "left" ? authText.left : placement === "center" ? authText.center : authText.right}
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
        <button className="blackButton" onClick={onOpenPreferences} type="button">
          <Palette size={17} />
          {uiText[preferences.language].topbar.theme}
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
          <span className="chip">{authText.sloganBadge}</span>
          <h1>{authText.sloganTitle}</h1>
          <p>{authText.sloganDesc}</p>
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
          <h2>{authText.title}</h2>
          <span>{authText.subtitle}</span>
          <small>{credentialNote}</small>
        </div>

        <form className="authForm" onSubmit={handleSubmit}>
          <label>
            <span>{authText.account}</span>
            <div>
              <UserRound size={18} />
              <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder={authText.accountPlaceholder} />
            </div>
          </label>
          <label>
            <span>{authText.password}</span>
            <div>
              <KeyRound size={18} />
              <input value={password} onChange={(event) => setPassword(event.target.value)} placeholder={authText.passwordPlaceholder} type="password" />
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
            <span className="sliderText">{captchaReady ? authText.captchaDone : authText.captchaHint}</span>
            <span className="sliderHandle" style={{ left: `calc(${sliderProgress}% - ${sliderProgress * 0.46}px)` }}>
              {captchaReady ? <CheckCircle2 size={18} /> : <ArrowRight size={18} />}
            </span>
          </div>

          <div className="authOptions">
            <label>
              <input checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} type="checkbox" />
              {authText.remember}
            </label>
            <button type="button">{authText.forgot}</button>
          </div>

          {error ? <p className="authError">{error}</p> : null}

          <button className="blackButton authSubmit" disabled={isSubmitting} type="submit">
            {isSubmitting ? "登录中..." : authText.submit}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="authAltActions">
          <button className="ghostButton" type="button">
            <Smartphone size={17} />
            {authText.mobile}
          </button>
          <button className="ghostButton" type="button">
            <QrCode size={17} />
            {authText.wechat}
          </button>
        </div>
      </article>
    </section>
  );
}

function PreferencesDrawer({
  drawerOpen,
  onClose,
  preferences,
  updatePreference,
}: {
  drawerOpen: boolean;
  onClose: () => void;
  preferences: Preferences;
  updatePreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
}) {
  const text = uiText[preferences.language];

  return (
    <>
      <div className={drawerOpen ? "drawerMask open" : "drawerMask"} onClick={onClose} />
      <aside className={drawerOpen ? "themeDrawer open" : "themeDrawer"} aria-label={text.drawer.title}>
        <header>
          <div>
            <p className="overline">Preferences</p>
            <h2>{text.drawer.title}</h2>
          </div>
          <button className="iconButton" onClick={onClose}>
            <X size={18} />
          </button>
        </header>

        <section className="settingGroup">
          <label>{text.drawer.mode}</label>
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
          <label>{text.drawer.brand}</label>
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
          <label>{text.drawer.layout}</label>
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
          <label>{text.drawer.detail}</label>
          <div className="detailPresets">
            <button className={preferences.collapsed ? "detailPreset active collapsed" : "detailPreset collapsed"} onClick={() => updatePreference("collapsed", !preferences.collapsed)}>
              <span className="detailPreview sidebarPreview">
                <i />
                <b />
                <em />
              </span>
              <strong>侧栏状态</strong>
              <small>{preferences.collapsed ? "图标窄栏" : "完整侧栏"}</small>
            </button>
            <button className={preferences.density === "compact" ? "detailPreset active compact" : "detailPreset comfortable"} onClick={() => updatePreference("density", preferences.density === "comfortable" ? "compact" : "comfortable")}>
              <span className="detailPreview densityPreview">
                <i />
                <b />
                <em />
              </span>
              <strong>内容密度</strong>
              <small>{preferences.density === "comfortable" ? "舒适留白" : "紧凑高效"}</small>
            </button>
            <button className={preferences.contentWidth === "boxed" ? "detailPreset active boxed" : "detailPreset fluid"} onClick={() => updatePreference("contentWidth", preferences.contentWidth === "fluid" ? "boxed" : "fluid")}>
              <span className="detailPreview widthPreview">
                <i />
                <b />
              </span>
              <strong>内容宽度</strong>
              <small>{preferences.contentWidth === "fluid" ? "铺满屏幕" : "居中定宽"}</small>
            </button>
            <button className={preferences.navStyle === "plain" ? "detailPreset active plain" : "detailPreset glassNav"} onClick={() => updatePreference("navStyle", preferences.navStyle === "glass" ? "plain" : "glass")}>
              <span className="detailPreview navPreview">
                <i />
                <b />
                <em />
              </span>
              <strong>导航风格</strong>
              <small>{preferences.navStyle === "glass" ? "玻璃质感" : "极简清单"}</small>
            </button>
            <button className={`detailPreset active radiusChoice ${preferences.radius}`} onClick={() => updatePreference("radius", preferences.radius === "round" ? "soft" : preferences.radius === "soft" ? "pill" : "round")}>
              <span className="detailPreview radiusPreview">
                <i />
                <b />
                <em />
              </span>
              <strong>圆角风格</strong>
              <small>{preferences.radius === "round" ? "圆润" : preferences.radius === "soft" ? "轻柔" : "胶囊"}</small>
            </button>
          </div>
        </section>

        <section className="settingGroup">
          <label>{text.drawer.visual}</label>
          <div className="effectPresets glassPresets">
            {glassOptions.map((glass) => (
              <button className={preferences.glass === glass.key ? `effectPreset active ${glass.key}` : `effectPreset ${glass.key}`} key={glass.key} onClick={() => updatePreference("glass", glass.key)}>
                <span className="effectPreview">
                  <i />
                  <b />
                </span>
                <strong>{glass.label}</strong>
                <small>{glass.tip}</small>
              </button>
            ))}
          </div>
          <div className="effectPresets motionPresets">
            {transitionOptions.map((transition) => (
              <button className={preferences.transition === transition.key ? `effectPreset active ${transition.key}` : `effectPreset ${transition.key}`} key={transition.key} onClick={() => updatePreference("transition", transition.key)}>
                <span className="motionPreview">
                  <i />
                  <b />
                  <em />
                </span>
                <strong>{transition.label}</strong>
                <small>{transition.tip}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="settingGroup">
          <label>{text.drawer.effects}</label>
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
    </>
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
    () => modules.filter((item) => authSession && authSession.accessCodes.includes(item.permissionCode)),
    [authSession],
  );

  const moduleGroups = useMemo(() => groupModules(visibleModules), [visibleModules]);
  const activeModule = visibleModules.find((item) => item.key === activeKey) ?? visibleModules[0] ?? modules[0];
  const text = uiText[preferences.language];

  useEffect(() => {
    if (authSession && visibleModules.length > 0 && !visibleModules.some((item) => item.key === activeKey)) {
      setActiveKey(visibleModules[0].key);
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
    const firstVisibleModule = modules.find((item) => user.accessCodes.includes(item.permissionCode));
    setAuthSession(user);
    setActiveKey(firstVisibleModule?.key ?? user.homePath);
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
        <LoginView onOpenPreferences={() => setDrawerOpen(true)} onLogin={handleLogin} preferences={preferences} updatePreference={updatePreference} />
        <PreferencesDrawer drawerOpen={drawerOpen} onClose={() => setDrawerOpen(false)} preferences={preferences} updatePreference={updatePreference} />
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

        <nav className="navGroups" aria-label={preferences.language === "zh" ? "功能模块" : "Modules"}>
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
                      <span>{text.groups[groupKey]}</span>
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
                            title={text.modules[item.key]?.title ?? item.title}
                          >
                            <Icon size={18} />
                            <span>{text.modules[item.key]?.title ?? item.title}</span>
                            {item.badge ? <em>{preferences.language === "en" && item.badge === "冲突" ? "Conflict" : item.badge}</em> : null}
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
              title={preferences.language === "zh" ? "折叠菜单" : "Toggle sidebar"}
            >
              {preferences.collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
            </button>
            <div>
              <p className="overline">{text.topbar.overline}</p>
              <h1>{activeKey === "dashboard" ? text.modules.dashboard.title : text.moduleContext[activeModule.group]}</h1>
            </div>
          </div>

          <div className="topActions">
            <label className="searchBox">
              <Search size={17} />
              <input placeholder={text.topbar.search} />
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
              {text.topbar.theme}
            </button>
            <button className="iconButton" onClick={handleLogout} title={text.topbar.logout}>
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {activeKey === "dashboard" ? (
          <section className="dashboardView" key={`dashboard-${preferences.transition}`}>
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
          <ModuleWorkspace authSession={authSession} key={`${activeModule.key}-${preferences.transition}-${preferences.language}`} language={preferences.language} module={activeModule} />
        )}
      </main>

      <div className={drawerOpen ? "drawerMask open" : "drawerMask"} onClick={() => setDrawerOpen(false)} />
      <aside className={drawerOpen ? "themeDrawer open" : "themeDrawer"} aria-label={text.drawer.title}>
        <header>
          <div>
            <p className="overline">Preferences</p>
            <h2>{text.drawer.title}</h2>
          </div>
          <button className="iconButton" onClick={() => setDrawerOpen(false)}>
            <X size={18} />
          </button>
        </header>

        <section className="settingGroup">
          <label>{text.drawer.mode}</label>
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
          <label>{text.drawer.brand}</label>
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
          <label>{text.drawer.layout}</label>
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
          <label>{text.drawer.detail}</label>
          <div className="detailPresets">
            <button className={preferences.collapsed ? "detailPreset active collapsed" : "detailPreset collapsed"} onClick={() => updatePreference("collapsed", !preferences.collapsed)}>
              <span className="detailPreview sidebarPreview">
                <i />
                <b />
                <em />
              </span>
              <strong>侧栏状态</strong>
              <small>{preferences.collapsed ? "图标窄栏" : "完整侧栏"}</small>
            </button>
            <button className={preferences.density === "compact" ? "detailPreset active compact" : "detailPreset comfortable"} onClick={() => updatePreference("density", preferences.density === "comfortable" ? "compact" : "comfortable")}>
              <span className="detailPreview densityPreview">
                <i />
                <b />
                <em />
              </span>
              <strong>内容密度</strong>
              <small>{preferences.density === "comfortable" ? "舒适留白" : "紧凑高效"}</small>
            </button>
            <button className={preferences.contentWidth === "boxed" ? "detailPreset active boxed" : "detailPreset fluid"} onClick={() => updatePreference("contentWidth", preferences.contentWidth === "fluid" ? "boxed" : "fluid")}>
              <span className="detailPreview widthPreview">
                <i />
                <b />
              </span>
              <strong>内容宽度</strong>
              <small>{preferences.contentWidth === "fluid" ? "铺满屏幕" : "居中定宽"}</small>
            </button>
            <button className={preferences.navStyle === "plain" ? "detailPreset active plain" : "detailPreset glassNav"} onClick={() => updatePreference("navStyle", preferences.navStyle === "glass" ? "plain" : "glass")}>
              <span className="detailPreview navPreview">
                <i />
                <b />
                <em />
              </span>
              <strong>导航风格</strong>
              <small>{preferences.navStyle === "glass" ? "玻璃质感" : "极简清单"}</small>
            </button>
            <button className={`detailPreset active radiusChoice ${preferences.radius}`} onClick={() => updatePreference("radius", preferences.radius === "round" ? "soft" : preferences.radius === "soft" ? "pill" : "round")}>
              <span className="detailPreview radiusPreview">
                <i />
                <b />
                <em />
              </span>
              <strong>圆角风格</strong>
              <small>{preferences.radius === "round" ? "圆润" : preferences.radius === "soft" ? "轻柔" : "胶囊"}</small>
            </button>
          </div>
        </section>

        <section className="settingGroup">
          <label>{text.drawer.visual}</label>
          <div className="effectPresets glassPresets">
            {glassOptions.map((glass) => (
              <button className={preferences.glass === glass.key ? `effectPreset active ${glass.key}` : `effectPreset ${glass.key}`} key={glass.key} onClick={() => updatePreference("glass", glass.key)}>
                <span className="effectPreview">
                  <i />
                  <b />
                </span>
                <strong>{glass.label}</strong>
                <small>{glass.tip}</small>
              </button>
            ))}
          </div>
          <div className="effectPresets motionPresets">
            {transitionOptions.map((transition) => (
              <button className={preferences.transition === transition.key ? `effectPreset active ${transition.key}` : `effectPreset ${transition.key}`} key={transition.key} onClick={() => updatePreference("transition", transition.key)}>
                <span className="motionPreview">
                  <i />
                  <b />
                  <em />
                </span>
                <strong>{transition.label}</strong>
                <small>{transition.tip}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="settingGroup">
          <label>{text.drawer.effects}</label>
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
