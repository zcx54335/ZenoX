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
  Clock3,
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
  PlusCircle,
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
type AuthPanelPlacement = "left" | "right";
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
  | "students"
  | "teachers"
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
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8081";

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
  classNames?: string;
  grade?: string;
  id: string;
  name: string;
  parentName?: string;
  parentPhone?: string;
  remainingLessons?: number;
  school?: string;
  subject?: string;
  weaknessNote?: string;
};

type ServerClassGroup = {
  description?: string;
  grade?: string;
  id: string;
  name: string;
  studentCount?: number;
  subject?: string;
  teacherNames?: string;
};

type ServerTeacher = {
  displayName: string;
  phone?: string;
  role: string;
  subject?: string;
  userId: string;
};

type ManagedTeacher = ServerTeacher & {
  bio?: string;
  classNames?: string;
  profileId?: string;
  username: string;
};

type ClassRosterResponse = {
  availableStudents: ServerStudent[];
  availableTeachers: ServerTeacher[];
  classGroup: ServerClassGroup;
  students: ServerStudent[];
  teachers: ServerTeacher[];
};

type ServerLesson = {
  classGroupId?: string;
  classGroupName?: string;
  deliveryMode?: string;
  endsAt: string;
  id: string;
  lessonHours?: number;
  studentCount?: number;
  startsAt: string;
  status: string;
  subject?: string;
  topic?: string;
  unitPrice?: number;
};

type ServerHomework = {
  attachmentCount?: number;
  classGroupName?: string;
  content?: string;
  dueAt?: string;
  id: string;
  lessonId?: string;
  reviewCount?: number;
  status: string;
  studentId?: string;
  studentName?: string;
  submissionCount?: number;
  title: string;
};

type ServerReview = {
  comment?: string;
  homeworkId: string;
  homeworkTitle: string;
  mistakeTags?: string;
  reviewedAt?: string;
  score?: number;
  status: string;
  studentId: string;
  studentName: string;
  submissionId: string;
  submittedAt?: string;
};

type ServerQuestion = {
  attachmentCount?: number;
  commentCount?: number;
  creatorName?: string;
  difficulty?: string;
  favoriteCount?: number;
  grade?: string;
  id: string;
  knowledgePoint?: string;
  likeCount?: number;
  scope?: string;
  subject?: string;
  title: string;
};

type ServerRecord = {
  attendanceId: string;
  classGroupName?: string;
  lessonId: string;
  startsAt: string;
  status: string;
  studentId: string;
  studentName: string;
  teacherComment?: string;
  topic?: string;
};

type ServerReminder = {
  category: string;
  channel?: string;
  content?: string;
  id: string;
  scheduledAt: string;
  status: string;
  title: string;
};

type ServerBilling = {
  cycleId: string;
  cycleMonth: string;
  itemCount?: number;
  parentName?: string;
  parentPhone?: string;
  paidAmount?: number;
  status: string;
  studentId: string;
  studentName: string;
  totalAmount: number;
  unpaidAmount?: number;
};

type BillingItemDetail = {
  amount: number;
  id: string;
  lessonHours?: number;
  lessonId?: string;
  lessonStartsAt?: string;
  title: string;
  unitPrice?: number;
};

type PaymentRecordDetail = {
  amount: number;
  id: string;
  method?: string;
  note?: string;
  paidAt: string;
};

type BillingCycleDetail = ServerBilling & {
  items: BillingItemDetail[];
  payments: PaymentRecordDetail[];
};

type ServerTodo = {
  category: string;
  detail?: string;
  dueAt?: string;
  label: string;
  priority: "high" | "medium" | "low";
};

type WorkspaceData = {
  billing: ServerBilling[];
  classes: ServerClassGroup[];
  homework: ServerHomework[];
  lessons: ServerLesson[];
  questions: ServerQuestion[];
  records: ServerRecord[];
  reminders: ServerReminder[];
  reviews: ServerReview[];
  students: ServerStudent[];
  todos: ServerTodo[];
};

const emptyWorkspaceData: WorkspaceData = {
  billing: [],
  classes: [],
  homework: [],
  lessons: [],
  questions: [],
  records: [],
  reminders: [],
  reviews: [],
  students: [],
  todos: [],
};

const mockAccounts: AuthUser[] = [
  {
    accessCodes: ["dashboard:view", "lesson:view", "lesson:manage", "student:view", "student:manage", "teacher:manage", "homework:view", "homework:manage", "homework:review", "billing:export", "system:admin"],
    avatar: "赵",
    homePath: "dashboard",
    label: "管理员 / 工作室负责人",
    name: "赵辰雄",
    role: "admin",
    studio: "ZenoX Studio",
    username: "zcx",
  },
  {
    accessCodes: ["dashboard:view", "lesson:view", "lesson:manage", "student:view", "homework:view", "homework:manage", "homework:review", "question:view", "record:view", "reminder:view", "billing:view"],
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
  { group: "教学", icon: Users, key: "classes", permissionCode: "student:view", roles: ["admin", "teacher"], title: "班级管理" },
  { group: "教学", icon: UploadCloud, key: "homework", permissionCode: "homework:view", roles: ["admin", "teacher", "student", "parent"], title: "作业中心", badge: "18" },
  { group: "教学", icon: Tags, key: "review", permissionCode: "homework:review", roles: ["admin", "teacher", "student", "parent"], title: "批改反馈" },
  { group: "教学", icon: BookOpen, key: "forum", permissionCode: "question:view", roles: ["admin", "teacher", "student"], title: "题库论坛" },
  { group: "教学", icon: ClipboardCheck, key: "records", permissionCode: "record:view", roles: ["admin", "teacher", "student", "parent"], title: "上课记录" },
  { group: "运营", icon: Bell, key: "reminders", permissionCode: "reminder:view", roles: ["admin", "teacher", "student", "parent"], title: "提醒中心" },
  { group: "运营", icon: CircleDollarSign, key: "billing", permissionCode: "billing:view", roles: ["admin", "teacher", "parent"], title: "收费记录" },
  { group: "运营", icon: ReceiptText, key: "monthly", permissionCode: "billing:export", roles: ["admin", "teacher", "parent"], title: "月结 PDF" },
  { group: "系统", icon: GraduationCap, key: "students", permissionCode: "student:manage", roles: ["admin"], title: "学员管理" },
  { group: "系统", icon: UserRound, key: "teachers", permissionCode: "teacher:manage", roles: ["admin"], title: "老师管理" },
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
  mode: "dark",
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
        title: "班级管理",
        description: "只负责把已有学员和老师绑定到班级/小组，不在这里新增基础档案。",
        primary: "绑定成员",
      },
      students: {
        title: "学员管理",
        description: "管理员维护学员基础档案、家长信息、剩余课时和薄弱点。",
        primary: "新增学员",
      },
      teachers: {
        title: "老师管理",
        description: "管理员维护授课老师账号、科目、联系方式和任课关系。",
        primary: "新增老师",
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
        title: "Class Management",
        description: "Bind existing students and teachers to classes without creating base profiles here.",
        primary: "Bind Members",
      },
      students: {
        title: "Student Management",
        description: "Admins maintain student profiles, parent contacts, remaining lessons, and weakness notes.",
        primary: "Add Student",
      },
      teachers: {
        title: "Teacher Management",
        description: "Admins maintain teacher accounts, subjects, contacts, and class assignments.",
        primary: "Add Teacher",
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

async function apiDelete<T>(path: string, accessToken?: string) {
  if (!accessToken) {
    throw new Error("登录已过期，请重新登录。");
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    method: "DELETE",
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

function Skeleton({ shellClassName }: { shellClassName: string }) {
  return (
    <div className={`bootScreen ${shellClassName.replace("zenoxApp", "")}`}>
      <div className="bootBackdrop" aria-hidden="true">
        <span className="bootDotGrid" />
        <span className="bootGlow one" />
        <span className="bootGlow two" />
        <span className="bootWave" />
      </div>
      <div className="bootFrame" aria-hidden="true">
        <span />
      </div>
      <div className="bootCenter" role="status" aria-live="polite">
        <div className="bootLogo">
          <GraduationCap size={30} />
          <i />
        </div>
        <strong>ZenoX</strong>
        <p>正在唤醒你的教学工作台</p>
        <div className="bootSteps">
          <span>同步主题偏好</span>
          <span>识别登录状态</span>
          <span>准备模块权限</span>
        </div>
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

function addDays(dateValue: string, days: number) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
}

function addMonths(dateValue: string, months: number) {
  const date = new Date(`${dateValue.slice(0, 7)}-01T00:00:00`);
  date.setMonth(date.getMonth() + months);
  return toDateInputValue(date);
}

function calendarDaysForMonth(monthValue: string) {
  const monthStart = new Date(`${monthValue.slice(0, 7)}-01T00:00:00`);
  const firstCell = new Date(monthStart);
  firstCell.setDate(1 - monthStart.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstCell);
    date.setDate(firstCell.getDate() + index);
    return toDateInputValue(date);
  });
}

function dateRangeDays(fromDate: string, toDate: string) {
  const start = new Date(`${fromDate}T00:00:00`);
  const end = new Date(`${toDate}T00:00:00`);
  const days: string[] = [];
  const current = new Date(start);
  while (current <= end) {
    days.push(toDateInputValue(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

function formatDateLabel(dateValue: string, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("zh-CN", options ?? {
    day: "2-digit",
    month: "long",
    weekday: "short",
    year: "numeric",
  }).format(new Date(`${dateValue}T00:00:00`));
}

function formatCompactDate(dateValue: string) {
  return new Intl.DateTimeFormat("zh-CN", { day: "2-digit", month: "2-digit" }).format(new Date(`${dateValue}T00:00:00`));
}

function formatMonthTitle(dateValue: string) {
  return new Intl.DateTimeFormat("zh-CN", { month: "long", year: "numeric" }).format(new Date(`${dateValue.slice(0, 7)}-01T00:00:00`));
}

function formatExportRangeLabel(fromDate: string, toDate: string) {
  const labelOptions: Intl.DateTimeFormatOptions = { day: "2-digit", month: "long", weekday: "short", year: "numeric" };
  if (fromDate === toDate) {
    return `${formatDateLabel(fromDate, labelOptions)} 当天`;
  }
  return `${formatDateLabel(fromDate, { day: "2-digit", month: "2-digit" })} - ${formatDateLabel(toDate, { day: "2-digit", month: "2-digit", year: "numeric" })}`;
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

const calendarWeekdays = ["日", "一", "二", "三", "四", "五", "六"];

function ExportRangeCalendar({
  fromDate,
  month,
  onClose,
  onMonthChange,
  onSelectDate,
  selecting,
  toDate,
  usage = "export",
}: {
  fromDate: string;
  month: string;
  onClose: () => void;
  onMonthChange: (month: string) => void;
  onSelectDate: (date: string) => void;
  selecting: "start" | "end";
  toDate: string;
  usage?: "export" | "schedule";
}) {
  const days = calendarDaysForMonth(month);
  const visibleMonth = month.slice(0, 7);
  const today = toDateInputValue(new Date());
  const endHint = usage === "export"
    ? "请选择结束日期；再次点击同一天，将只导出当天。"
    : "请选择结束日期；再次点击同一天，将只展示当天排课。";
  const startHint = usage === "export" ? "点击日期开始选择导出区间。" : "点击日期开始选择排课展示区间。";

  return (
    <div className="rangeCalendarPopover schedulePopoverSurface">
      <div className="rangeCalendarTop">
        <div>
          <p className="overline">Date Range</p>
          <strong>{formatMonthTitle(month)}</strong>
        </div>
        <div className="calendarNav">
          <button aria-label="上个月" onClick={() => onMonthChange(addMonths(month, -1))} type="button">
            <ChevronRight size={16} />
          </button>
          <button aria-label="下个月" onClick={() => onMonthChange(addMonths(month, 1))} type="button">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="rangeCalendarHint">
        {selecting === "end" ? endHint : startHint}
      </div>
      <div className="rangeWeekdays">
        {calendarWeekdays.map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="rangeCalendarGrid">
        {days.map((day) => {
          const isOutside = day.slice(0, 7) !== visibleMonth;
          const isStart = day === fromDate;
          const isEnd = day === toDate;
          const isInRange = day > fromDate && day < toDate;
          const className = [
            "rangeDay",
            isOutside ? "outside" : "",
            isInRange ? "inRange" : "",
            isStart ? "rangeStart" : "",
            isEnd ? "rangeEnd" : "",
            day === today ? "today" : "",
          ].filter(Boolean).join(" ");

          return (
            <button
              aria-pressed={isStart || isEnd || isInRange}
              className={className}
              key={day}
              onClick={() => onSelectDate(day)}
              type="button"
            >
              <span>{new Date(`${day}T00:00:00`).getDate()}</span>
            </button>
          );
        })}
      </div>
      <div className="rangeCalendarFooter">
        <span>{formatExportRangeLabel(fromDate, toDate)}</span>
        <button onClick={onClose} type="button">确认区间</button>
      </div>
    </div>
  );
}

function SingleDateCalendar({
  date,
  dayCounts,
  month,
  onClose,
  onMonthChange,
  onSelectDate,
}: {
  date: string;
  dayCounts?: Map<string, number>;
  month: string;
  onClose: () => void;
  onMonthChange: (month: string) => void;
  onSelectDate: (date: string) => void;
}) {
  const days = calendarDaysForMonth(month);
  const visibleMonth = month.slice(0, 7);
  const today = toDateInputValue(new Date());

  return (
    <div className="rangeCalendarPopover singleCalendarPopover schedulePopoverSurface">
      <div className="rangeCalendarTop">
        <div>
          <p className="overline">Calendar</p>
          <strong>{formatMonthTitle(month)}</strong>
        </div>
        <div className="calendarNav">
          <button aria-label="上个月" onClick={() => onMonthChange(addMonths(month, -1))} type="button">
            <ChevronRight size={16} />
          </button>
          <button aria-label="下个月" onClick={() => onMonthChange(addMonths(month, 1))} type="button">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="rangeCalendarHint">点击日期切换当天排课；日期下方数字代表当天课程数。</div>
      <div className="rangeWeekdays">
        {calendarWeekdays.map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="rangeCalendarGrid">
        {days.map((day) => {
          const count = dayCounts?.get(day) ?? 0;
          const className = [
            "rangeDay",
            "singleDay",
            day.slice(0, 7) !== visibleMonth ? "outside" : "",
            day === date ? "rangeStart rangeEnd" : "",
            day === today ? "today" : "",
            count > 0 ? "hasLessons" : "",
          ].filter(Boolean).join(" ");

          return (
            <button
              aria-pressed={day === date}
              className={className}
              key={day}
              onClick={() => {
                onSelectDate(day);
                onClose();
              }}
              type="button"
            >
              <span>{new Date(`${day}T00:00:00`).getDate()}</span>
              {count > 0 ? <em>{count}</em> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TimePickerPopover({
  onClose,
  onSelect,
  value,
}: {
  onClose: () => void;
  onSelect: (value: string) => void;
  value: string;
}) {
  const hours = Array.from({ length: 16 }, (_, index) => String(index + 7).padStart(2, "0"));
  const minutes = ["00", "15", "30", "45"];
  const [activeHour, activeMinute] = value.split(":");

  return (
    <div className="timePickerPopover schedulePopoverSurface">
      <div className="timePickerTop">
        <div>
          <p className="overline">Time</p>
          <strong>{value}</strong>
        </div>
        <button onClick={onClose} type="button">完成</button>
      </div>
      <div className="timePickerGrid hours">
        {hours.map((hour) => (
          <button
            className={hour === activeHour ? "active" : ""}
            key={hour}
            onClick={() => onSelect(`${hour}:${activeMinute ?? "00"}`)}
            type="button"
          >
            {hour}
          </button>
        ))}
      </div>
      <div className="timePickerGrid minutes">
        {minutes.map((minute) => (
          <button
            className={minute === activeMinute ? "active" : ""}
            key={minute}
            onClick={() => onSelect(`${activeHour ?? "19"}:${minute}`)}
            type="button"
          >
            {minute}
          </button>
        ))}
      </div>
    </div>
  );
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

function billingStatusLabel(status: string) {
  const labels: Record<string, string> = {
    CANCELLED: "已取消",
    CONFIRMED: "已确认",
    DRAFT: "待收款",
    PAID: "已结清",
    PARTIALLY_PAID: "部分收款",
    PENDING_CONFIRMATION: "待确认",
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

type GlassSelectOption = {
  description?: string;
  label: string;
  value: string;
};

function GlassSelect({
  icon: Icon,
  isOpen,
  onChange,
  onToggle,
  options,
  placeholder,
  value,
}: {
  icon: LucideIcon;
  isOpen: boolean;
  onChange: (value: string) => void;
  onToggle: () => void;
  options: GlassSelectOption[];
  placeholder: string;
  value: string;
}) {
  const selected = options.find((option) => option.value === value);

  return (
    <div className={`glassSelect popupField ${isOpen ? "isOpen" : ""}`}>
      <button
        aria-expanded={isOpen}
        className={`glassSelectTrigger ${isOpen ? "active" : ""}`}
        onClick={onToggle}
        type="button"
      >
        <span className="glassSelectIcon">
          <Icon size={18} />
        </span>
        <span className="glassSelectText">
          <small>{selected?.description ?? placeholder}</small>
          <strong>{selected?.label ?? placeholder}</strong>
        </span>
        <ChevronDown size={17} />
      </button>
      {isOpen ? (
        <div className="glassSelectMenu schedulePopoverSurface">
          {options.map((option) => {
            const active = option.value === value;
            return (
              <button
                className={active ? "glassSelectOption active" : "glassSelectOption"}
                key={option.value}
                onClick={() => onChange(option.value)}
                type="button"
              >
                <span>
                  <strong>{option.label}</strong>
                  {option.description ? <small>{option.description}</small> : null}
                </span>
                {active ? <CheckCircle2 size={18} /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function ModuleWorkspace({
  authSession,
  language,
  module,
  onWorkspaceDataChange,
  workspaceData,
}: {
  authSession: AuthUser;
  language: Preferences["language"];
  module: ModuleItem;
  onWorkspaceDataChange: (data: WorkspaceData) => void;
  workspaceData: WorkspaceData;
}) {
  const Icon = module.icon;
  const text = uiText[language];
  const moduleText: ModuleCopy = text.modules[module.key] ?? { title: module.title, description: "" };
  const toolbarLabels = text.toolbar;
  const [data, setData] = useState<WorkspaceData>(workspaceData);
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
  const todayDate = toDateInputValue(new Date());
  const [exportFromDate, setExportFromDate] = useState(todayDate);
  const [exportToDate, setExportToDate] = useState(todayDate);
  const [exportPickerMonth, setExportPickerMonth] = useState(todayDate);
  const [exportSelecting, setExportSelecting] = useState<"start" | "end">("start");
  const [exportCalendarOpen, setExportCalendarOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [scheduleCalendarOpen, setScheduleCalendarOpen] = useState(false);
  const initialScheduleRange = weekDaysFrom(todayDate);
  const [scheduleFromDate, setScheduleFromDate] = useState(initialScheduleRange[0]);
  const [scheduleToDate, setScheduleToDate] = useState(initialScheduleRange[6]);
  const [scheduleRangeSelecting, setScheduleRangeSelecting] = useState<"start" | "end">("start");
  const [schedulePickerMonth, setSchedulePickerMonth] = useState(todayDate);
  const [lessonDateCalendarOpen, setLessonDateCalendarOpen] = useState(false);
  const [lessonDatePickerMonth, setLessonDatePickerMonth] = useState(todayDate);
  const [openTimePicker, setOpenTimePicker] = useState<"start" | "end" | null>(null);
  const [openSelect, setOpenSelect] = useState<"class" | "delivery" | "rosterStudent" | "rosterTeacher" | "paymentMethod" | null>(null);
  const [exporting, setExporting] = useState(false);
  const [scheduleMessage, setScheduleMessage] = useState("");
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);
  const [selectedScheduleDate, setSelectedScheduleDate] = useState(toDateInputValue(new Date()));
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [classRoster, setClassRoster] = useState<ClassRosterResponse | null>(null);
  const [rosterLoading, setRosterLoading] = useState(false);
  const [rosterMessage, setRosterMessage] = useState("");
  const [selectedStudentToAdd, setSelectedStudentToAdd] = useState("");
  const [selectedTeacherToAdd, setSelectedTeacherToAdd] = useState("");
  const [pendingCrossClassStudentId, setPendingCrossClassStudentId] = useState<string | null>(null);
  const [rosterSubmitting, setRosterSubmitting] = useState(false);
  const [studentForm, setStudentForm] = useState({
    grade: "",
    name: "",
    parentName: "",
    parentPhone: "",
    remainingLessons: "0",
    school: "",
    subject: "",
    weaknessNote: "",
  });
  const [studentMessage, setStudentMessage] = useState("");
  const [studentSubmitting, setStudentSubmitting] = useState(false);
  const [teachers, setTeachers] = useState<ManagedTeacher[]>([]);
  const [teacherForm, setTeacherForm] = useState({
    bio: "",
    displayName: "",
    password: "123456",
    phone: "",
    subject: "",
    username: "",
  });
  const [teacherMessage, setTeacherMessage] = useState("");
  const [teacherLoading, setTeacherLoading] = useState(false);
  const [teacherSubmitting, setTeacherSubmitting] = useState(false);
  const [selectedBillingId, setSelectedBillingId] = useState<string | null>(null);
  const [billingDetail, setBillingDetail] = useState<BillingCycleDetail | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingSubmitting, setBillingSubmitting] = useState(false);
  const [billingMessage, setBillingMessage] = useState("");
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "WECHAT",
    note: "",
    paidAt: `${todayDate}T${new Date().toTimeString().slice(0, 5)}`,
  });
  const lessonComposerRef = useRef<HTMLElement>(null);
  const classNameById = useMemo(
    () => new Map(data.classes.map((item) => [item.id, item.name])),
    [data.classes],
  );
  const scheduleRangeDays = useMemo(() => dateRangeDays(scheduleFromDate, scheduleToDate), [scheduleFromDate, scheduleToDate]);
  const scheduleRangeLessons = useMemo(
    () => data.lessons.filter((lesson) => {
      const date = toDateInputValue(new Date(lesson.startsAt));
      return date >= scheduleFromDate && date <= scheduleToDate;
    }),
    [data.lessons, scheduleFromDate, scheduleToDate],
  );
  const lessonCountByDate = useMemo(() => {
    const counts = new Map<string, number>();
    data.lessons.forEach((lesson) => {
      const date = toDateInputValue(new Date(lesson.startsAt));
      counts.set(date, (counts.get(date) ?? 0) + 1);
    });
    return counts;
  }, [data.lessons]);
  const selectedRangeAmount = useMemo(
    () => scheduleRangeLessons.reduce((sum, lesson) => sum + (lesson.lessonHours ?? 0) * (lesson.unitPrice ?? 0), 0),
    [scheduleRangeLessons],
  );
  const classOptions = useMemo<GlassSelectOption[]>(
    () => [
      { description: "选择班级或 1v1 小组", label: "请选择", value: "" },
      ...data.classes.map((classGroup) => ({
        description: classGroup.subject ?? "课程小组",
        label: classGroup.name,
        value: String(classGroup.id),
      })),
    ],
    [data.classes],
  );
  const rosterStudentOptions = useMemo<GlassSelectOption[]>(
    () => [
      { description: "从已有学生中选择", label: "选择学生", value: "" },
      ...(classRoster?.availableStudents ?? []).map((student) => ({
        description: student.classNames ? `已在：${student.classNames}` : `${student.grade ?? "未设置年级"} · 暂未入班`,
        label: student.name,
        value: String(student.id),
      })),
    ],
    [classRoster?.availableStudents],
  );
  const rosterTeacherOptions = useMemo<GlassSelectOption[]>(
    () => [
      { description: "从已有老师中选择", label: "选择老师", value: "" },
      ...(classRoster?.availableTeachers ?? []).map((teacher) => ({
        description: teacher.subject ?? (teacher.role === "TENANT_OWNER" ? "工作室负责人" : "授课老师"),
        label: teacher.displayName,
        value: String(teacher.userId),
      })),
    ],
    [classRoster?.availableTeachers],
  );
  const deliveryOptions: GlassSelectOption[] = [
    { description: "腾讯会议 / 在线课堂", label: "线上", value: "ONLINE" },
    { description: "到店 / 上门授课", label: "线下", value: "OFFLINE" },
  ];

  const closeFloatingControls = () => {
    setExportCalendarOpen(false);
    setScheduleCalendarOpen(false);
    setLessonDateCalendarOpen(false);
    setOpenTimePicker(null);
    setOpenSelect(null);
  };

  const openOnlySelect = (select: "class" | "delivery" | "rosterStudent" | "rosterTeacher") => {
    setExportCalendarOpen(false);
    setScheduleCalendarOpen(false);
    setLessonDateCalendarOpen(false);
    setOpenTimePicker(null);
    setOpenSelect((current) => current === select ? null : select);
  };

  const openOnlyTimePicker = (picker: "start" | "end") => {
    setExportCalendarOpen(false);
    setScheduleCalendarOpen(false);
    setLessonDateCalendarOpen(false);
    setOpenSelect(null);
    setOpenTimePicker((current) => current === picker ? null : picker);
  };

  const refreshScheduleData = async () => {
    const nextWorkspaceData = await apiGet<WorkspaceData>("/api/workspace", authSession.accessToken);
    setData(nextWorkspaceData);
    onWorkspaceDataChange(nextWorkspaceData);
  };

  const loadClassRoster = async (classGroupId: string) => {
    setRosterLoading(true);
    setRosterMessage("");
    try {
      const roster = await apiGet<ClassRosterResponse>(`/api/classes/${classGroupId}/roster`, authSession.accessToken);
      setClassRoster(roster);
      setSelectedStudentToAdd("");
      setSelectedTeacherToAdd("");
      setPendingCrossClassStudentId(null);
    } catch (error) {
      setRosterMessage(error instanceof Error ? error.message : "班级成员读取失败");
    } finally {
      setRosterLoading(false);
    }
  };

  const refreshRosterAndWorkspace = async (roster: ClassRosterResponse) => {
    setClassRoster(roster);
    setSelectedStudentToAdd("");
    setSelectedTeacherToAdd("");
    setPendingCrossClassStudentId(null);
    await refreshScheduleData();
  };

  const handleAddClassStudent = async (confirmCrossClass = false) => {
    if (!selectedClassId || !selectedStudentToAdd) {
      setRosterMessage("请先选择班级和学生。");
      return;
    }
    setRosterSubmitting(true);
    setRosterMessage("");
    try {
      const roster = await apiSend<ClassRosterResponse>(
        `/api/classes/${selectedClassId}/students`,
        "POST",
        authSession.accessToken,
        { confirmCrossClass, studentId: selectedStudentToAdd },
      );
      await refreshRosterAndWorkspace(roster);
      setRosterMessage("学生已加入当前班级。");
    } catch (error) {
      const message = error instanceof Error ? error.message : "添加学生失败";
      const selectedStudent = classRoster?.availableStudents.find((student) => String(student.id) === selectedStudentToAdd);
      if (message.includes("其他班级") && selectedStudent) {
        setPendingCrossClassStudentId(selectedStudent.id);
        setRosterMessage(`${selectedStudent.name} 已在 ${selectedStudent.classNames ?? "其他班级"}，确认后仍可加入。`);
      } else {
        setRosterMessage(message);
      }
    } finally {
      setRosterSubmitting(false);
    }
  };

  const handleRemoveClassStudent = async (studentId: string) => {
    if (!selectedClassId) {
      return;
    }
    setRosterSubmitting(true);
    setRosterMessage("");
    try {
      const roster = await apiDelete<ClassRosterResponse>(`/api/classes/${selectedClassId}/students/${studentId}`, authSession.accessToken);
      await refreshRosterAndWorkspace(roster);
      setRosterMessage("学生已从当前班级移除，历史上课记录已保留。");
    } catch (error) {
      setRosterMessage(error instanceof Error ? error.message : "移除学生失败");
    } finally {
      setRosterSubmitting(false);
    }
  };

  const handleAddClassTeacher = async () => {
    if (!selectedClassId || !selectedTeacherToAdd) {
      setRosterMessage("请先选择班级和老师。");
      return;
    }
    setRosterSubmitting(true);
    setRosterMessage("");
    try {
      const roster = await apiSend<ClassRosterResponse>(
        `/api/classes/${selectedClassId}/teachers`,
        "POST",
        authSession.accessToken,
        { teacherUserId: selectedTeacherToAdd },
      );
      await refreshRosterAndWorkspace(roster);
      setRosterMessage("老师已加入当前班级。");
    } catch (error) {
      setRosterMessage(error instanceof Error ? error.message : "添加老师失败");
    } finally {
      setRosterSubmitting(false);
    }
  };

  const handleRemoveClassTeacher = async (teacherUserId: string) => {
    if (!selectedClassId) {
      return;
    }
    setRosterSubmitting(true);
    setRosterMessage("");
    try {
      const roster = await apiDelete<ClassRosterResponse>(`/api/classes/${selectedClassId}/teachers/${teacherUserId}`, authSession.accessToken);
      await refreshRosterAndWorkspace(roster);
      setRosterMessage("老师已从当前班级移除。");
    } catch (error) {
      setRosterMessage(error instanceof Error ? error.message : "移除老师失败");
    } finally {
      setRosterSubmitting(false);
    }
  };

  const loadTeachers = async () => {
    setTeacherLoading(true);
    setTeacherMessage("");
    try {
      const nextTeachers = await apiGet<ManagedTeacher[]>("/api/teachers", authSession.accessToken);
      setTeachers(nextTeachers);
    } catch (error) {
      setTeacherMessage(error instanceof Error ? error.message : "老师数据读取失败");
    } finally {
      setTeacherLoading(false);
    }
  };

  const handleCreateStudent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!studentForm.name.trim()) {
      setStudentMessage("请填写学员姓名。");
      return;
    }
    setStudentSubmitting(true);
    setStudentMessage("");
    try {
      await apiSend<ServerStudent>("/api/students", "POST", authSession.accessToken, {
        grade: studentForm.grade,
        name: studentForm.name,
        parentName: studentForm.parentName,
        parentPhone: studentForm.parentPhone,
        remainingLessons: Number(studentForm.remainingLessons || 0),
        school: studentForm.school,
        subject: studentForm.subject,
        weaknessNote: studentForm.weaknessNote,
      });
      setStudentForm({ grade: "", name: "", parentName: "", parentPhone: "", remainingLessons: "0", school: "", subject: "", weaknessNote: "" });
      await refreshScheduleData();
      setStudentMessage("学员已新增，可以在班级管理里选择加入班级。");
    } catch (error) {
      setStudentMessage(error instanceof Error ? error.message : "新增学员失败");
    } finally {
      setStudentSubmitting(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    setStudentSubmitting(true);
    setStudentMessage("");
    try {
      await apiDelete<void>(`/api/students/${studentId}`, authSession.accessToken);
      await refreshScheduleData();
      setStudentMessage("学员已删除，并已从当前班级关系中移除。");
    } catch (error) {
      setStudentMessage(error instanceof Error ? error.message : "删除学员失败");
    } finally {
      setStudentSubmitting(false);
    }
  };

  const handleCreateTeacher = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!teacherForm.username.trim() || !teacherForm.displayName.trim()) {
      setTeacherMessage("请填写老师账号和姓名。");
      return;
    }
    setTeacherSubmitting(true);
    setTeacherMessage("");
    try {
      await apiSend<ManagedTeacher>("/api/teachers", "POST", authSession.accessToken, teacherForm);
      setTeacherForm({ bio: "", displayName: "", password: "123456", phone: "", subject: "", username: "" });
      await loadTeachers();
      await refreshScheduleData();
      setTeacherMessage("老师已新增，可以在班级管理里设为负责老师。");
    } catch (error) {
      setTeacherMessage(error instanceof Error ? error.message : "新增老师失败");
    } finally {
      setTeacherSubmitting(false);
    }
  };

  const handleDeleteTeacher = async (teacherUserId: string) => {
    setTeacherSubmitting(true);
    setTeacherMessage("");
    try {
      await apiDelete<void>(`/api/teachers/${teacherUserId}`, authSession.accessToken);
      await loadTeachers();
      await refreshScheduleData();
      setTeacherMessage("老师已删除，并已解除当前班级绑定。");
    } catch (error) {
      setTeacherMessage(error instanceof Error ? error.message : "删除老师失败");
    } finally {
      setTeacherSubmitting(false);
    }
  };

  const refreshBillingDetailAndWorkspace = async (detail?: BillingCycleDetail) => {
    if (detail) {
      setBillingDetail(detail);
      setSelectedBillingId(detail.cycleId);
    } else if (selectedBillingId) {
      const nextDetail = await apiGet<BillingCycleDetail>(`/api/billing/${selectedBillingId}`, authSession.accessToken);
      setBillingDetail(nextDetail);
    }
    await refreshScheduleData();
  };

  const handleRecordPayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedBillingId) {
      return;
    }
    const amount = Number(paymentForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setBillingMessage("请输入正确的收款金额。");
      return;
    }
    setBillingSubmitting(true);
    setBillingMessage("");
    try {
      const detail = await apiSend<BillingCycleDetail>(`/api/billing/${selectedBillingId}/payments`, "POST", authSession.accessToken, {
        amount,
        method: paymentForm.method,
        note: paymentForm.note,
        paidAt: paymentForm.paidAt ? `${paymentForm.paidAt}:00` : undefined,
      });
      setPaymentForm((current) => ({
        ...current,
        amount: detail.unpaidAmount && detail.unpaidAmount > 0 ? String(detail.unpaidAmount) : "",
        note: "",
      }));
      await refreshBillingDetailAndWorkspace(detail);
      setBillingMessage("收款已记录，账单状态已自动更新。");
    } catch (error) {
      setBillingMessage(error instanceof Error ? error.message : "记录收款失败");
    } finally {
      setBillingSubmitting(false);
    }
  };

  const handleUndoPayment = async (paymentId: string) => {
    setBillingSubmitting(true);
    setBillingMessage("");
    try {
      const detail = await apiDelete<BillingCycleDetail>(`/api/billing/payments/${paymentId}`, authSession.accessToken);
      await refreshBillingDetailAndWorkspace(detail);
      setBillingMessage("该笔收款已撤销，账单金额已重新计算。");
    } catch (error) {
      setBillingMessage(error instanceof Error ? error.message : "撤销收款失败");
    } finally {
      setBillingSubmitting(false);
    }
  };

  const handleDownloadBillingStatement = async () => {
    if (!selectedBillingId) {
      return;
    }
    setBillingSubmitting(true);
    setBillingMessage("");
    try {
      const blob = await apiDownload(`/api/billing/${selectedBillingId}/statement.pdf`, authSession.accessToken);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      const detail = billingDetail ?? data.billing.find((item) => item.cycleId === selectedBillingId);
      anchor.download = `ZenoX-${detail?.studentName ?? "student"}-${detail?.cycleMonth?.slice(0, 7) ?? selectedBillingId}-月结单.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
      setBillingMessage("月结单已生成。");
    } catch (error) {
      setBillingMessage(error instanceof Error ? error.message : "月结单生成失败");
    } finally {
      setBillingSubmitting(false);
    }
  };

  useEffect(() => {
    setData(workspaceData);
  }, [workspaceData]);

  useEffect(() => {
    if (module.key !== "classes" || data.classes.length === 0) {
      return;
    }
    if (!selectedClassId || !data.classes.some((item) => item.id === selectedClassId)) {
      setSelectedClassId(data.classes[0].id);
    }
  }, [data.classes, module.key, selectedClassId]);

  useEffect(() => {
    if (module.key !== "classes" || !selectedClassId) {
      return;
    }
    void loadClassRoster(selectedClassId);
  }, [module.key, selectedClassId]);

  useEffect(() => {
    if (module.key !== "teachers") {
      return;
    }
    void loadTeachers();
  }, [module.key]);

  useEffect(() => {
    if ((module.key !== "billing" && module.key !== "monthly") || data.billing.length === 0) {
      setSelectedBillingId(null);
      setBillingDetail(null);
      return;
    }
    if (!selectedBillingId || !data.billing.some((item) => item.cycleId === selectedBillingId)) {
      setSelectedBillingId(data.billing[0].cycleId);
    }
  }, [data.billing, module.key, selectedBillingId]);

  useEffect(() => {
    if ((module.key !== "billing" && module.key !== "monthly") || !selectedBillingId) {
      return;
    }
    let ignore = false;
    const load = async () => {
      setBillingLoading(true);
      setBillingMessage("");
      try {
        const detail = await apiGet<BillingCycleDetail>(`/api/billing/${selectedBillingId}`, authSession.accessToken);
        if (!ignore) {
          setBillingDetail(detail);
          setPaymentForm((current) => ({
            ...current,
            amount: detail.unpaidAmount && detail.unpaidAmount > 0 ? String(detail.unpaidAmount) : "",
          }));
        }
      } catch (error) {
        if (!ignore) {
          setBillingMessage(error instanceof Error ? error.message : "账单详情读取失败");
        }
      } finally {
        if (!ignore) {
          setBillingLoading(false);
        }
      }
    };
    void load();
    return () => {
      ignore = true;
    };
  }, [authSession.accessToken, module.key, selectedBillingId]);

  useEffect(() => {
    if (!["schedule", "classes", "students", "teachers", "homework", "review", "forum", "records", "reminders", "billing", "monthly"].includes(module.key)) {
      return;
    }
    const hasWorkspaceData = workspaceData.classes.length > 0
      || workspaceData.students.length > 0
      || workspaceData.lessons.length > 0
      || workspaceData.homework.length > 0
      || workspaceData.todos.length > 0;
    if (hasWorkspaceData) {
      setData(workspaceData);
      setDataError("");
      setDataLoading(false);
      return;
    }
    let ignore = false;
    const load = async () => {
      setDataError("");
      setDataLoading(true);
      try {
        const workspaceData = await apiGet<WorkspaceData>("/api/workspace", authSession.accessToken);
        if (!ignore) {
          setData(workspaceData);
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

  useEffect(() => {
    const handleOutsidePointerDown = (event: Event) => {
      if (!(event.target instanceof Element)) {
        return;
      }
      if (event.target.closest(".popupField") || event.target.closest(".themeDrawer")) {
        return;
      }
      closeFloatingControls();
    };

    document.addEventListener("pointerdown", handleOutsidePointerDown);
    return () => document.removeEventListener("pointerdown", handleOutsidePointerDown);
  });

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
        classGroupId: lessonForm.classGroupId || null,
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

  const handleCompleteLesson = async (lesson: ServerLesson) => {
    setScheduleSubmitting(true);
    setScheduleMessage("");
    try {
      await apiSend<ServerLesson>(`/api/lessons/${lesson.id}/complete`, "PATCH", authSession.accessToken);
      setScheduleMessage("课程已完成，已自动生成上课记录、扣减学生课时，并同步生成当月账单明细。");
      await refreshScheduleData();
    } catch (error) {
      setScheduleMessage(error instanceof Error ? error.message : "完成课程失败");
    } finally {
      setScheduleSubmitting(false);
    }
  };

  const handleUndoCompleteLesson = async (lesson: ServerLesson) => {
    setScheduleSubmitting(true);
    setScheduleMessage("");
    try {
      await apiSend<ServerLesson>(`/api/lessons/${lesson.id}/undo-complete`, "PATCH", authSession.accessToken);
      setScheduleMessage("已撤销完成：学生课时已回补，本节课产生的账单明细已移除并重新计算。");
      await refreshScheduleData();
    } catch (error) {
      setScheduleMessage(error instanceof Error ? error.message : "撤销完成失败");
    } finally {
      setScheduleSubmitting(false);
    }
  };

  const focusLessonComposer = () => {
    lessonComposerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setScheduleMessage("请填写课程信息，保存后会自动检查冲突。");
  };

  const selectScheduleDate = (date: string) => {
    setSelectedScheduleDate(date);
    setSchedulePickerMonth(date);
    setLessonForm((current) => ({ ...current, date }));
  };

  const handleSelectScheduleRangeDate = (date: string) => {
    setSchedulePickerMonth(date);
    if (scheduleRangeSelecting === "start") {
      setScheduleFromDate(date);
      setScheduleToDate(date);
      setSelectedScheduleDate(date);
      setScheduleRangeSelecting("end");
      return;
    }
    if (date < scheduleFromDate) {
      setScheduleFromDate(date);
      setScheduleToDate(scheduleFromDate);
      setSelectedScheduleDate(date);
    } else {
      setScheduleToDate(date);
      setSelectedScheduleDate(scheduleFromDate);
    }
    setScheduleRangeSelecting("start");
  };

  const selectLessonFormDate = (date: string) => {
    setLessonDatePickerMonth(date);
    setSelectedScheduleDate(date);
    setLessonForm((current) => ({ ...current, date }));
  };

  const handleSelectExportDate = (date: string) => {
    setExportPickerMonth(date);
    if (exportSelecting === "start") {
      setExportFromDate(date);
      setExportToDate(date);
      setExportSelecting("end");
      return;
    }
    if (date < exportFromDate) {
      setExportFromDate(date);
      setExportToDate(exportFromDate);
    } else {
      setExportToDate(date);
    }
    setExportSelecting("start");
  };

  const handleExportLessons = async () => {
    if (!exportFromDate || !exportToDate) {
      setScheduleMessage("请选择导出开始和结束日期。");
      return;
    }
    if (exportFromDate > exportToDate) {
      setScheduleMessage("导出开始日期不能晚于结束日期。");
      return;
    }
    setExporting(true);
    setScheduleMessage("");
    try {
      const query = new URLSearchParams({ from: exportFromDate, to: exportToDate }).toString();
      const blob = await apiDownload(`/api/lessons/export?${query}`, authSession.accessToken);
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `ZenoX-课程记录-${exportFromDate}_至_${exportToDate}.xlsx`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
      setScheduleMessage(`已导出 ${exportFromDate} 至 ${exportToDate} 的课程记录 Excel。`);
      setExportOpen(false);
    } catch (error) {
      setScheduleMessage(error instanceof Error ? error.message : "导出失败");
    } finally {
      setExporting(false);
    }
  };

  if (module.key === "schedule") {
    return (
      <section className="moduleView scheduleModuleView">
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
            <button
              className="ghostButton"
              onClick={() => {
                setExportOpen((current) => !current);
                setExportCalendarOpen(false);
                setScheduleCalendarOpen(false);
                setLessonDateCalendarOpen(false);
                setOpenTimePicker(null);
                setOpenSelect(null);
              }}
              type="button"
            >
              导出 Excel
            </button>
            <button className="blackButton" onClick={focusLessonComposer} type="button">{moduleText.primary ?? "新建课程"}</button>
          </div>
        </article>
        {exportOpen ? (
          <article className="panel exportPanel">
            <div>
              <p className="overline">Export</p>
              <strong>导出课程记录</strong>
              <span>点击日历选择导出区间；开始和结束同一天时，只导出当天课程。</span>
            </div>
            <div className={`exportRangePicker popupField ${exportCalendarOpen ? "isOpen" : ""}`}>
              <button
                className={`rangeTrigger ${exportCalendarOpen ? "active" : ""}`}
                onClick={() => {
                  setScheduleCalendarOpen(false);
                  setLessonDateCalendarOpen(false);
                  setOpenTimePicker(null);
                  setOpenSelect(null);
                  setExportCalendarOpen((current) => !current);
                }}
                type="button"
              >
                <CalendarDays size={20} />
                <span>
                  <small>导出日期</small>
                  <strong>{formatExportRangeLabel(exportFromDate, exportToDate)}</strong>
                </span>
                <ChevronDown size={17} />
              </button>
              {exportCalendarOpen ? (
                <ExportRangeCalendar
                  fromDate={exportFromDate}
                  month={exportPickerMonth}
                  onClose={() => setExportCalendarOpen(false)}
                  onMonthChange={setExportPickerMonth}
                  onSelectDate={handleSelectExportDate}
                  selecting={exportSelecting}
                  toDate={exportToDate}
                />
              ) : null}
            </div>
            <button className="blackButton" disabled={exporting} onClick={() => void handleExportLessons()} type="button">
              {exporting ? "导出中..." : "导出 Excel"}
            </button>
          </article>
        ) : null}
        <div className="moduleGrid scheduleGrid">
          <article className="panel scheduleBoard">
            <div className="boardHeader">
              <div>
                <p className="overline">Schedule Range</p>
                <strong>{formatExportRangeLabel(scheduleFromDate, scheduleToDate)}</strong>
                <span>{scheduleRangeDays.length} 天 · {scheduleRangeLessons.length} 节课</span>
              </div>
              <div className={`calendarField scheduleCalendarField popupField ${scheduleCalendarOpen ? "isOpen" : ""}`}>
                <button
                  className={`rangeTrigger compactDateTrigger ${scheduleCalendarOpen ? "active" : ""}`}
                  onClick={() => {
                    setExportCalendarOpen(false);
                    setLessonDateCalendarOpen(false);
                    setOpenTimePicker(null);
                    setOpenSelect(null);
                    setScheduleCalendarOpen((current) => !current);
                  }}
                  type="button"
                >
                  <CalendarDays size={18} />
                  <span>
                    <small>展示范围</small>
                    <strong>{formatExportRangeLabel(scheduleFromDate, scheduleToDate)}</strong>
                  </span>
                  <ChevronDown size={17} />
                </button>
                {scheduleCalendarOpen ? (
                  <ExportRangeCalendar
                    fromDate={scheduleFromDate}
                    month={schedulePickerMonth}
                    onClose={() => setScheduleCalendarOpen(false)}
                    onMonthChange={setSchedulePickerMonth}
                    onSelectDate={handleSelectScheduleRangeDate}
                    selecting={scheduleRangeSelecting}
                    toDate={scheduleToDate}
                    usage="schedule"
                  />
                ) : null}
              </div>
            </div>
            <div className="scheduleStats">
              <div>
                <span>区间天数</span>
                <strong>{scheduleRangeDays.length}</strong>
              </div>
              <div>
                <span>区间课程</span>
                <strong>{scheduleRangeLessons.length}</strong>
              </div>
              <div>
                <span>预计金额</span>
                <strong>¥{selectedRangeAmount.toLocaleString("zh-CN")}</strong>
              </div>
            </div>
            <div className="weekStrip">
              {scheduleRangeDays.map((day) => (
                <button className={day === selectedScheduleDate ? "active" : ""} key={day} onClick={() => selectScheduleDate(day)} type="button">
                  <span>{new Intl.DateTimeFormat("zh-CN", { weekday: "short" }).format(new Date(`${day}T00:00:00`))}</span>
                  <strong>{new Date(`${day}T00:00:00`).getDate()}</strong>
                  <em>{data.lessons.filter((lesson) => toDateInputValue(new Date(lesson.startsAt)) === day).length || "空"}</em>
                </button>
              ))}
            </div>
            {dataLoading ? <EmptyState>正在读取后端排课数据...</EmptyState> : null}
            {dataError ? <EmptyState>{dataError}</EmptyState> : null}
            {!dataLoading && !dataError && scheduleRangeLessons.length === 0 ? <EmptyState>所选区间暂无课程，可以从右侧创建新课。</EmptyState> : null}
            {!dataLoading && !dataError ? scheduleRangeLessons.map((lesson) => (
              <div className="scheduleRow" key={`${lesson.id}-${lesson.startsAt}`}>
                <time>{formatTime(lesson.startsAt)}<small>{formatTime(lesson.endsAt)}</small></time>
                <div>
                  <strong>{lesson.classGroupName ?? classNameById.get(lesson.classGroupId ?? "") ?? "未绑定班级"}</strong>
                  <small>{lesson.subject ?? "未设置科目"} · {lesson.topic ?? "未填写主题"}</small>
                  <span>{lesson.studentCount ?? 0} 名学生 · {lesson.lessonHours ?? 1} 课时 · {lesson.deliveryMode ?? "ONLINE"}</span>
                </div>
                <div className="lessonActions">
                  <ModuleStatus tone={dataTone(lesson.status)}>{lessonStatusLabel(lesson.status)}</ModuleStatus>
                  {lesson.status === "COMPLETED" ? (
                    <button className="ghostButton warning" disabled={scheduleSubmitting} onClick={() => void handleUndoCompleteLesson(lesson)} type="button">撤销完成</button>
                  ) : (
                    <button className="ghostButton" disabled={scheduleSubmitting || lesson.status === "CANCELLED"} onClick={() => void handleCompleteLesson(lesson)} type="button">完成</button>
                  )}
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
                <GlassSelect
                  icon={Users}
                  isOpen={openSelect === "class"}
                  onChange={(value) => {
                    const selectedClass = data.classes.find((item) => String(item.id) === value);
                    setLessonForm((current) => ({
                      ...current,
                      classGroupId: value,
                      subject: selectedClass?.subject ?? current.subject,
                    }));
                    setOpenSelect(null);
                  }}
                  onToggle={() => openOnlySelect("class")}
                  options={classOptions}
                  placeholder="请选择"
                  value={lessonForm.classGroupId}
                />
              </label>
              <div className="formPair">
                <label>
                  <span>日期</span>
                  <div className={`calendarField popupField ${lessonDateCalendarOpen ? "isOpen" : ""}`}>
                    <button
                      className={`rangeTrigger compactDateTrigger ${lessonDateCalendarOpen ? "active" : ""}`}
                      onClick={() => {
                        setExportCalendarOpen(false);
                        setScheduleCalendarOpen(false);
                        setOpenTimePicker(null);
                        setOpenSelect(null);
                        setLessonDateCalendarOpen((current) => !current);
                      }}
                      type="button"
                    >
                      <CalendarDays size={18} />
                      <span>
                        <small>上课日期</small>
                        <strong>{formatDateLabel(lessonForm.date, { day: "2-digit", month: "long", weekday: "short" })}</strong>
                      </span>
                      <ChevronDown size={17} />
                    </button>
                    {lessonDateCalendarOpen ? (
                      <SingleDateCalendar
                        date={lessonForm.date}
                        dayCounts={lessonCountByDate}
                        month={lessonDatePickerMonth}
                        onClose={() => setLessonDateCalendarOpen(false)}
                        onMonthChange={setLessonDatePickerMonth}
                        onSelectDate={selectLessonFormDate}
                      />
                    ) : null}
                  </div>
                </label>
                <label>
                  <span>上课方式</span>
                  <GlassSelect
                    icon={Smartphone}
                    isOpen={openSelect === "delivery"}
                    onChange={(value) => {
                      setLessonForm((current) => ({ ...current, deliveryMode: value }));
                      setOpenSelect(null);
                    }}
                    onToggle={() => openOnlySelect("delivery")}
                    options={deliveryOptions}
                    placeholder="选择方式"
                    value={lessonForm.deliveryMode}
                  />
                </label>
              </div>
              <div className="formPair">
                <label>
                  <span>开始</span>
                  <div className={`timeField popupField ${openTimePicker === "start" ? "isOpen" : ""}`}>
                    <button
                      className={`timeTrigger ${openTimePicker === "start" ? "active" : ""}`}
                      onClick={() => openOnlyTimePicker("start")}
                      type="button"
                    >
                      <Clock3 size={18} />
                      <span>
                        <small>Start</small>
                        <strong>{lessonForm.startsAt}</strong>
                      </span>
                      <ChevronDown size={17} />
                    </button>
                    {openTimePicker === "start" ? (
                      <TimePickerPopover
                        onClose={() => setOpenTimePicker(null)}
                        onSelect={(value) => setLessonForm((current) => ({ ...current, startsAt: value }))}
                        value={lessonForm.startsAt}
                      />
                    ) : null}
                  </div>
                </label>
                <label>
                  <span>结束</span>
                  <div className={`timeField popupField ${openTimePicker === "end" ? "isOpen" : ""}`}>
                    <button
                      className={`timeTrigger ${openTimePicker === "end" ? "active" : ""}`}
                      onClick={() => openOnlyTimePicker("end")}
                      type="button"
                    >
                      <Clock3 size={18} />
                      <span>
                        <small>End</small>
                        <strong>{lessonForm.endsAt}</strong>
                      </span>
                      <ChevronDown size={17} />
                    </button>
                    {openTimePicker === "end" ? (
                      <TimePickerPopover
                        onClose={() => setOpenTimePicker(null)}
                        onSelect={(value) => setLessonForm((current) => ({ ...current, endsAt: value }))}
                        value={lessonForm.endsAt}
                      />
                    ) : null}
                  </div>
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
              <div className="conflictHint">
                <CheckCircle2 size={18} />
                <div>
                  <strong>保存前自动校验</strong>
                  <span>老师时间、班级时间、同一学生跨班级冲突都会被后端阻止。取消课程后，该时间段可重新排课。</span>
                </div>
              </div>
              <button className="blackButton" disabled={scheduleSubmitting} type="submit">
                {scheduleSubmitting ? "处理中..." : "保存排课"}
              </button>
            </form>
          </article>
        </div>
      </section>
    );
  }

  if (module.key === "students") {
    return (
      <section className="moduleView">
        <article className="panel moduleHeader glowCard">
          <div className="moduleTitle">
            <Icon size={26} />
            <div>
              <p className="overline">Student Admin</p>
              <h2>{moduleText.title}</h2>
              <span>{moduleText.description}</span>
            </div>
          </div>
          <ModuleToolbar labels={toolbarLabels} primary={moduleText.primary ?? ""} />
        </article>
        <div className="moduleGrid managementGrid">
          <article className="panel managementFormPanel">
            <div className="panelHeader">
              <div>
                <p className="overline">Create Student</p>
                <h3>新增学员档案</h3>
              </div>
              <GraduationCap size={20} />
            </div>
            <form className="managementForm" onSubmit={handleCreateStudent}>
              <div className="formPair">
                <label>
                  <span>姓名</span>
                  <input value={studentForm.name} onChange={(event) => setStudentForm((current) => ({ ...current, name: event.target.value }))} placeholder="例如：王一诺" />
                </label>
                <label>
                  <span>年级</span>
                  <input value={studentForm.grade} onChange={(event) => setStudentForm((current) => ({ ...current, grade: event.target.value }))} placeholder="例如：初三" />
                </label>
              </div>
              <div className="formPair">
                <label>
                  <span>学校</span>
                  <input value={studentForm.school} onChange={(event) => setStudentForm((current) => ({ ...current, school: event.target.value }))} placeholder="学校名称" />
                </label>
                <label>
                  <span>科目</span>
                  <input value={studentForm.subject} onChange={(event) => setStudentForm((current) => ({ ...current, subject: event.target.value }))} placeholder="数学 / 物理" />
                </label>
              </div>
              <div className="formPair">
                <label>
                  <span>家长</span>
                  <input value={studentForm.parentName} onChange={(event) => setStudentForm((current) => ({ ...current, parentName: event.target.value }))} placeholder="家长姓名" />
                </label>
                <label>
                  <span>家长电话</span>
                  <input value={studentForm.parentPhone} onChange={(event) => setStudentForm((current) => ({ ...current, parentPhone: event.target.value }))} placeholder="手机号" />
                </label>
              </div>
              <label>
                <span>剩余课时</span>
                <input type="number" value={studentForm.remainingLessons} onChange={(event) => setStudentForm((current) => ({ ...current, remainingLessons: event.target.value }))} />
              </label>
              <label>
                <span>薄弱点</span>
                <textarea value={studentForm.weaknessNote} onChange={(event) => setStudentForm((current) => ({ ...current, weaknessNote: event.target.value }))} placeholder="记录学员薄弱点，后续上课和作业会用到。" />
              </label>
              {studentMessage ? <div className="scheduleMessage">{studentMessage}</div> : null}
              <button className="blackButton" disabled={studentSubmitting} type="submit">{studentSubmitting ? "处理中..." : "保存学员"}</button>
            </form>
          </article>
          <article className="panel managementListPanel">
            <div className="panelHeader">
              <div>
                <p className="overline">Student List</p>
                <h3>学员列表</h3>
              </div>
              <Users size={20} />
            </div>
            <div className="studentGrid rosterStudentGrid">
              {dataLoading ? <EmptyState>正在读取学员数据...</EmptyState> : null}
              {dataError ? <EmptyState>{dataError}</EmptyState> : null}
              {!dataLoading && !dataError && data.students.length === 0 ? <EmptyState>暂无学员数据</EmptyState> : null}
              {!dataLoading && !dataError ? data.students.map((student) => (
                <div className="studentCard rosterMemberCard" key={student.id}>
                  <strong>{student.name}</strong>
                  <span>{student.grade ?? "未设置年级"} · {student.subject ?? "未设置科目"}</span>
                  <small>家长：{student.parentName ?? "未绑定"} {student.parentPhone ?? ""}</small>
                  <small>剩余：{student.remainingLessons ?? 0} 课时</small>
                  <small>所在班级：{student.classNames ?? "未加入班级"}</small>
                  <em>{student.weaknessNote ?? "暂无薄弱点记录"}</em>
                  <button className="ghostButton danger" disabled={studentSubmitting} onClick={() => void handleDeleteStudent(student.id)} type="button">删除学员</button>
                </div>
              )) : null}
            </div>
          </article>
        </div>
      </section>
    );
  }

  if (module.key === "teachers") {
    return (
      <section className="moduleView">
        <article className="panel moduleHeader glowCard">
          <div className="moduleTitle">
            <Icon size={26} />
            <div>
              <p className="overline">Teacher Admin</p>
              <h2>{moduleText.title}</h2>
              <span>{moduleText.description}</span>
            </div>
          </div>
          <ModuleToolbar labels={toolbarLabels} primary={moduleText.primary ?? ""} />
        </article>
        <div className="moduleGrid managementGrid">
          <article className="panel managementFormPanel">
            <div className="panelHeader">
              <div>
                <p className="overline">Create Teacher</p>
                <h3>新增老师账号</h3>
              </div>
              <UserRound size={20} />
            </div>
            <form className="managementForm" onSubmit={handleCreateTeacher}>
              <div className="formPair">
                <label>
                  <span>登录账号</span>
                  <input value={teacherForm.username} onChange={(event) => setTeacherForm((current) => ({ ...current, username: event.target.value }))} placeholder="例如：lin_teacher" />
                </label>
                <label>
                  <span>老师姓名</span>
                  <input value={teacherForm.displayName} onChange={(event) => setTeacherForm((current) => ({ ...current, displayName: event.target.value }))} placeholder="例如：林老师" />
                </label>
              </div>
              <div className="formPair">
                <label>
                  <span>科目</span>
                  <input value={teacherForm.subject} onChange={(event) => setTeacherForm((current) => ({ ...current, subject: event.target.value }))} placeholder="数学 / 物理" />
                </label>
                <label>
                  <span>电话</span>
                  <input value={teacherForm.phone} onChange={(event) => setTeacherForm((current) => ({ ...current, phone: event.target.value }))} placeholder="手机号" />
                </label>
              </div>
              <label>
                <span>初始密码</span>
                <input value={teacherForm.password} onChange={(event) => setTeacherForm((current) => ({ ...current, password: event.target.value }))} placeholder="默认 123456" />
              </label>
              <label>
                <span>简介</span>
                <textarea value={teacherForm.bio} onChange={(event) => setTeacherForm((current) => ({ ...current, bio: event.target.value }))} placeholder="老师介绍、授课风格或备注。" />
              </label>
              {teacherMessage ? <div className="scheduleMessage">{teacherMessage}</div> : null}
              <button className="blackButton" disabled={teacherSubmitting} type="submit">{teacherSubmitting ? "处理中..." : "保存老师"}</button>
            </form>
          </article>
          <article className="panel managementListPanel">
            <div className="panelHeader">
              <div>
                <p className="overline">Teacher List</p>
                <h3>老师列表</h3>
              </div>
              <Users size={20} />
            </div>
            <div className="teacherManageList">
              {teacherLoading ? <EmptyState>正在读取老师数据...</EmptyState> : null}
              {!teacherLoading && teachers.length === 0 ? <EmptyState>暂无老师数据</EmptyState> : null}
              {!teacherLoading ? teachers.map((teacher) => (
                <div className="teacherManageCard" key={teacher.userId}>
                  <div>
                    <strong>{teacher.displayName}</strong>
                    <span>{teacher.username} · {teacher.subject ?? (teacher.role === "TENANT_OWNER" ? "工作室负责人" : "未设置科目")}</span>
                    <small>负责班级：{teacher.classNames ?? "暂未绑定班级"}</small>
                    <small>{teacher.phone ? `电话：${teacher.phone}` : "未填写电话"}</small>
                  </div>
                  {teacher.role === "TENANT_OWNER" ? (
                    <ModuleStatus tone="violet">负责人</ModuleStatus>
                  ) : (
                    <button className="ghostButton danger" disabled={teacherSubmitting} onClick={() => void handleDeleteTeacher(teacher.userId)} type="button">删除老师</button>
                  )}
                </div>
              )) : null}
            </div>
          </article>
        </div>
      </section>
    );
  }

  if (module.key === "classes") {
    const selectedClass = data.classes.find((item) => item.id === selectedClassId) ?? data.classes[0];
    const pendingStudent = classRoster?.availableStudents.find((student) => student.id === pendingCrossClassStudentId);

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
        <div className="moduleGrid rosterWorkbench">
          <article className="panel rosterClassPanel">
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
                <button
                  className={card.id === selectedClass?.id ? "businessCard rosterClassCard active" : "businessCard rosterClassCard"}
                  key={card.id}
                  onClick={() => setSelectedClassId(card.id)}
                  type="button"
                >
                  <strong>{card.name}</strong>
                  <span>{card.grade ?? "未设置年级"} · {card.subject ?? "未设置科目"}</span>
                  <small>{card.description ?? "暂无班级说明"}</small>
                  <small>{card.studentCount ?? 0} 名学生 · {card.teacherNames ?? "未绑定老师"}</small>
                  <em>{(card.studentCount ?? 0) > 1 ? "班课 / 多学生" : "1v1 / 小组"}</em>
                </button>
              )) : null}
            </div>
          </article>
          <article className="panel rosterDetailPanel">
            <div className="panelHeader">
              <div>
                <p className="overline">Class Roster</p>
                <h3>{selectedClass?.name ?? "班级成员"}</h3>
              </div>
              <GraduationCap size={20} />
            </div>
            <div className="rosterSummary">
              <div>
                <span>学生</span>
                <strong>{classRoster?.students.length ?? selectedClass?.studentCount ?? 0}</strong>
              </div>
              <div>
                <span>负责老师</span>
                <strong>{classRoster?.teachers.length ?? 0}</strong>
              </div>
              <div>
                <span>可添加</span>
                <strong>{classRoster ? classRoster.availableStudents.length + classRoster.availableTeachers.length : 0}</strong>
              </div>
            </div>
            {rosterLoading ? <EmptyState>正在读取班级成员...</EmptyState> : null}
            {rosterMessage ? <div className={pendingStudent ? "rosterNotice warning" : "rosterNotice"}>{rosterMessage}</div> : null}
            {pendingStudent ? (
              <div className="rosterConfirm">
                <div>
                  <strong>确认跨班加入？</strong>
                  <span>{pendingStudent.name} 已属于 {pendingStudent.classNames ?? "其他班级"}，加入后排课会参与跨班时间冲突检测。</span>
                </div>
                <button className="blackButton" disabled={rosterSubmitting} onClick={() => void handleAddClassStudent(true)} type="button">仍然加入</button>
                <button className="ghostButton" onClick={() => {
                  setPendingCrossClassStudentId(null);
                  setRosterMessage("");
                }} type="button">取消</button>
              </div>
            ) : null}
            <div className="rosterSections">
              <section>
                <div className="rosterSectionTitle">
                  <strong>学生成员</strong>
                  <span>移除只影响当前班级，历史记录保留。</span>
                </div>
                <div className="studentGrid rosterStudentGrid">
                  {!rosterLoading && classRoster && classRoster.students.length === 0 ? <EmptyState>当前班级还没有学生。</EmptyState> : null}
                  {!rosterLoading && classRoster ? classRoster.students.map((student) => (
                    <div className="studentCard rosterMemberCard" key={student.id}>
                      <strong>{student.name}</strong>
                      <span>{student.grade ?? "未设置年级"} · {student.subject ?? "未设置科目"}</span>
                      <small>薄弱点：{student.weaknessNote ?? "暂无记录"}</small>
                      <small>剩余：{student.remainingLessons ?? 0} 课时</small>
                      <em>{student.parentName ?? "未绑定家长"}</em>
                      <button className="ghostButton danger" disabled={rosterSubmitting} onClick={() => void handleRemoveClassStudent(student.id)} type="button">移出班级</button>
                    </div>
                  )) : null}
                </div>
              </section>
              <section>
                <div className="rosterSectionTitle">
                  <strong>负责老师</strong>
                  <span>老师会参与后续排课和权限联动。</span>
                </div>
                <div className="rosterTeacherList">
                  {!rosterLoading && classRoster && classRoster.teachers.length === 0 ? <EmptyState>当前班级还没有负责老师。</EmptyState> : null}
                  {!rosterLoading && classRoster ? classRoster.teachers.map((teacher) => (
                    <div className="rosterTeacherCard" key={teacher.userId}>
                      <div>
                        <strong>{teacher.displayName}</strong>
                        <span>{teacher.subject ?? (teacher.role === "TENANT_OWNER" ? "工作室负责人" : "授课老师")}</span>
                      </div>
                      <button className="ghostButton danger" disabled={rosterSubmitting} onClick={() => void handleRemoveClassTeacher(teacher.userId)} type="button">移除</button>
                    </div>
                  )) : null}
                </div>
              </section>
            </div>
          </article>
          <article className="panel rosterActionPanel">
            <div className="panelHeader">
              <div>
                <p className="overline">Bind Members</p>
                <h3>绑定已有成员</h3>
              </div>
              <PlusCircle size={20} />
            </div>
            <div className="rosterAddBlock">
              <strong>添加已有学生</strong>
              <GlassSelect
                icon={GraduationCap}
                isOpen={openSelect === "rosterStudent"}
                onChange={(value) => {
                  setSelectedStudentToAdd(value);
                  setPendingCrossClassStudentId(null);
                  setRosterMessage("");
                  setOpenSelect(null);
                }}
                onToggle={() => openOnlySelect("rosterStudent")}
                options={rosterStudentOptions}
                placeholder="选择学生"
                value={selectedStudentToAdd}
              />
              <button className="blackButton" disabled={rosterSubmitting || !selectedStudentToAdd} onClick={() => void handleAddClassStudent(false)} type="button">
                加入班级
              </button>
            </div>
            <div className="rosterAddBlock">
              <strong>添加负责老师</strong>
              <GlassSelect
                icon={Users}
                isOpen={openSelect === "rosterTeacher"}
                onChange={(value) => {
                  setSelectedTeacherToAdd(value);
                  setOpenSelect(null);
                }}
                onToggle={() => openOnlySelect("rosterTeacher")}
                options={rosterTeacherOptions}
                placeholder="选择老师"
                value={selectedTeacherToAdd}
              />
              <button className="blackButton" disabled={rosterSubmitting || !selectedTeacherToAdd} onClick={() => void handleAddClassTeacher()} type="button">
                设为负责老师
              </button>
            </div>
            <div className="conflictHint">
              <CheckCircle2 size={18} />
              <div>
                <strong>真实联动</strong>
                <span>班级成员变化后，排课人数、学生跨班冲突检测、后续作业和账单都会使用这份关系。</span>
              </div>
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
            const target = item.studentName ? `${item.studentName} · ${item.classGroupName ?? "未绑定班级"}` : lesson ? classNameById.get(lesson.classGroupId ?? "") : "未绑定课程";
            return (
            <article className="panel pipelineColumn" key={item.id}>
              <p className="overline">{homeworkStatusLabel(item.status)}</p>
              <h3>{item.title}</h3>
              <span>{target ?? "未绑定班级"}</span>
              <small>{item.content ?? "暂无作业内容"}</small>
              <div>
                <ModuleStatus tone={dataTone(item.status)}>{item.dueAt ? formatDateTime(item.dueAt) : "无截止时间"}</ModuleStatus>
                <ModuleStatus tone="violet">{`${item.submissionCount ?? 0} 次提交`}</ModuleStatus>
                <ModuleStatus tone="green">{`${item.attachmentCount ?? 0} 个附件`}</ModuleStatus>
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
          {dataLoading ? <EmptyState>正在读取批改数据...</EmptyState> : null}
          {dataError ? <EmptyState>{dataError}</EmptyState> : null}
          {!dataLoading && !dataError && data.reviews.length === 0 ? <EmptyState>暂无提交或批改记录</EmptyState> : null}
          {!dataLoading && !dataError ? data.reviews.map((item) => (
            <div className="reviewRow" key={item.submissionId}>
              <div>
                <strong>{item.studentName}</strong>
                <span>{item.homeworkTitle}</span>
                <small>{item.comment ?? "等待老师文字点评"}</small>
              </div>
              <div className="tagList">
                {(item.mistakeTags ? item.mistakeTags.split(",") : ["待标注错因"]).map((tag) => <ModuleStatus tone="violet" key={tag}>{tag}</ModuleStatus>)}
              </div>
              <ModuleStatus tone={item.reviewedAt ? "green" : "amber"}>{item.reviewedAt ? `已批改 ${item.score ?? ""}` : item.status}</ModuleStatus>
            </div>
          )) : null}
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
          {dataLoading ? <article className="panel questionCard"><EmptyState>正在读取题库数据...</EmptyState></article> : null}
          {dataError ? <article className="panel questionCard"><EmptyState>{dataError}</EmptyState></article> : null}
          {!dataLoading && !dataError && data.questions.length === 0 ? <article className="panel questionCard"><EmptyState>暂无题库内容</EmptyState></article> : null}
          {!dataLoading && !dataError ? data.questions.map((question) => (
            <article className="panel questionCard" key={question.id}>
              <ModuleStatus tone="green">{question.scope ?? "PUBLIC"}</ModuleStatus>
              <h3>{question.title}</h3>
              <span>{question.grade ?? "未设置年级"} · {question.subject ?? "未设置科目"} · {question.knowledgePoint ?? "未设置知识点"}</span>
              <small>{question.creatorName ?? "匿名"} 上传 · {question.favoriteCount ?? 0} 收藏 · {question.commentCount ?? 0} 评论 · {question.attachmentCount ?? 0} 附件</small>
              <button className="ghostButton">转为作业</button>
            </article>
          )) : null}
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
          {dataLoading ? <EmptyState>正在读取上课记录...</EmptyState> : null}
          {dataError ? <EmptyState>{dataError}</EmptyState> : null}
          {!dataLoading && !dataError && data.records.length === 0 ? <EmptyState>暂无上课记录</EmptyState> : null}
          {!dataLoading && !dataError ? data.records.map((record) => (
            <article className="panel recordCard" key={record.attendanceId}>
              <div>
                <strong>{record.studentName} · {record.classGroupName ?? "未绑定班级"}</strong>
                <span>{record.topic ?? "未填写主题"} · {formatDateTime(record.startsAt)}</span>
                <small>{record.teacherComment ?? "老师还没有填写本节学生总结"}</small>
              </div>
              <ModuleStatus>{record.status}</ModuleStatus>
            </article>
          )) : null}
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
          {dataLoading ? <EmptyState>正在读取提醒数据...</EmptyState> : null}
          {dataError ? <EmptyState>{dataError}</EmptyState> : null}
          {!dataLoading && !dataError && data.reminders.length === 0 ? <EmptyState>暂无提醒</EmptyState> : null}
          {!dataLoading && !dataError ? data.reminders.map((item) => (
            <div className="timelineItem" key={item.id}>
              <time>{formatTime(item.scheduledAt)}</time>
              <div>
                <strong>{item.title}</strong>
                <span>{item.content ?? "系统内提醒"} · {item.channel ?? "IN_APP"}</span>
              </div>
            </div>
          )) : null}
        </article>
      </section>
    );
  }

  if (module.key === "billing" || module.key === "monthly") {
    const selectedBilling = data.billing.find((item) => item.cycleId === selectedBillingId) ?? data.billing[0];
    const activeDetail = billingDetail && billingDetail.cycleId === selectedBilling?.cycleId ? billingDetail : null;
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
        <div className="billingWorkbench">
          <article className="panel billingListPanel">
            <div className="boardHeader">
              <div>
                <strong>账单列表</strong>
                <span>{data.billing.length} 个账单周期</span>
              </div>
              <ModuleStatus tone="violet">REAL DATA</ModuleStatus>
            </div>
            <div className="billingList">
              {dataLoading ? <EmptyState>正在读取账单数据...</EmptyState> : null}
              {dataError ? <EmptyState>{dataError}</EmptyState> : null}
              {!dataLoading && !dataError && data.billing.length === 0 ? <EmptyState>暂无账单</EmptyState> : null}
              {!dataLoading && !dataError ? data.billing.map((item) => (
                <button className={`billingListItem ${item.cycleId === selectedBilling?.cycleId ? "active" : ""}`} key={item.cycleId} onClick={() => setSelectedBillingId(item.cycleId)} type="button">
                  <div>
                    <strong>{item.studentName}</strong>
                    <span>{item.cycleMonth?.slice(0, 7)} · {item.itemCount ?? 0} 条明细</span>
                  </div>
                  <div>
                    <strong>¥{Number(item.unpaidAmount ?? 0).toLocaleString("zh-CN")}</strong>
                    <span>待收</span>
                  </div>
                  <ModuleStatus tone={item.status === "PAID" ? "green" : item.status === "PARTIALLY_PAID" ? "amber" : "violet"}>{billingStatusLabel(item.status)}</ModuleStatus>
                </button>
              )) : null}
            </div>
          </article>
          <article className="panel billingDetailPanel">
            {!selectedBilling ? <EmptyState>请选择一个账单</EmptyState> : null}
            {selectedBilling ? (
              <>
                <div className="billingHero">
                  <div>
                    <p className="overline">{module.key === "monthly" ? "Monthly Statement" : "Payment Cycle"}</p>
                    <h3>{selectedBilling.studentName}</h3>
                    <span>{selectedBilling.cycleMonth?.slice(0, 7)} · 家长 {activeDetail?.parentName || selectedBilling.parentName || "未填写"} · {activeDetail?.parentPhone || selectedBilling.parentPhone || "无电话"}</span>
                  </div>
                  <button className="blackButton" disabled={billingSubmitting || !selectedBilling} onClick={() => void handleDownloadBillingStatement()} type="button">下载月结 PDF</button>
                </div>
                <div className="billingMetrics">
                  <div>
                    <span>应收</span>
                    <strong>¥{Number((activeDetail ?? selectedBilling).totalAmount ?? 0).toLocaleString("zh-CN")}</strong>
                  </div>
                  <div>
                    <span>已收</span>
                    <strong>¥{Number((activeDetail ?? selectedBilling).paidAmount ?? 0).toLocaleString("zh-CN")}</strong>
                  </div>
                  <div className="due">
                    <span>待收</span>
                    <strong>¥{Number((activeDetail ?? selectedBilling).unpaidAmount ?? 0).toLocaleString("zh-CN")}</strong>
                  </div>
                </div>
                {billingMessage ? <div className="scheduleMessage">{billingMessage}</div> : null}
                {billingLoading ? <EmptyState>正在读取账单详情...</EmptyState> : null}
                {!billingLoading && activeDetail ? (
                  <div className="billingDetailGrid">
                    <div className="billingSection">
                      <div className="boardHeader">
                        <div>
                          <strong>课程明细</strong>
                          <span>完成课程后自动生成</span>
                        </div>
                      </div>
                      <div className="billingRows">
                        {activeDetail.items.length === 0 ? <EmptyState>暂无课程明细</EmptyState> : null}
                        {activeDetail.items.map((item) => (
                          <div className="billingRow" key={item.id}>
                            <div>
                              <strong>{item.title}</strong>
                              <span>{item.lessonStartsAt ? formatDateTime(item.lessonStartsAt) : "手动明细"} · {item.lessonHours ?? "-"} 课时 · 单价 ¥{Number(item.unitPrice ?? 0).toLocaleString("zh-CN")}</span>
                            </div>
                            <strong>¥{Number(item.amount ?? 0).toLocaleString("zh-CN")}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="billingSection">
                      <div className="boardHeader">
                        <div>
                          <strong>收款历史</strong>
                          <span>录错可撤销并自动重算</span>
                        </div>
                      </div>
                      <div className="billingRows">
                        {activeDetail.payments.length === 0 ? <EmptyState>暂无收款记录</EmptyState> : null}
                        {activeDetail.payments.map((payment) => (
                          <div className="billingRow payment" key={payment.id}>
                            <div>
                              <strong>{payment.method || "WECHAT"} · ¥{Number(payment.amount ?? 0).toLocaleString("zh-CN")}</strong>
                              <span>{formatDateTime(payment.paidAt)} · {payment.note || "无备注"}</span>
                            </div>
                            <button className="ghostButton danger" disabled={billingSubmitting} onClick={() => void handleUndoPayment(payment.id)} type="button">撤销</button>
                          </div>
                        ))}
                      </div>
                      <form className="paymentForm" onSubmit={handleRecordPayment}>
                        <label>
                          <span>收款金额</span>
                          <input min="0" onChange={(event) => setPaymentForm((current) => ({ ...current, amount: event.target.value }))} placeholder="输入金额" step="0.01" type="number" value={paymentForm.amount} />
                        </label>
                        <label>
                          <span>收款时间</span>
                          <input onChange={(event) => setPaymentForm((current) => ({ ...current, paidAt: event.target.value }))} type="datetime-local" value={paymentForm.paidAt} />
                        </label>
                        <label>
                          <span>方式</span>
                          <GlassSelect
                            icon={CircleDollarSign}
                            isOpen={openSelect === "paymentMethod"}
                            onChange={(value) => {
                              setPaymentForm((current) => ({ ...current, method: value }));
                              setOpenSelect(null);
                            }}
                            onToggle={() => setOpenSelect(openSelect === "paymentMethod" ? null : "paymentMethod")}
                            options={[
                              { description: "家长微信转账", label: "微信", value: "WECHAT" },
                              { description: "支付宝付款", label: "支付宝", value: "ALIPAY" },
                              { description: "银行转账", label: "银行卡", value: "BANK" },
                              { description: "线下现金", label: "现金", value: "CASH" },
                            ]}
                            placeholder="选择方式"
                            value={paymentForm.method}
                          />
                        </label>
                        <label>
                          <span>备注</span>
                          <input onChange={(event) => setPaymentForm((current) => ({ ...current, note: event.target.value }))} placeholder="例如：6月部分付款" value={paymentForm.note} />
                        </label>
                        <button className="blackButton" disabled={billingSubmitting} type="submit">记录收款</button>
                      </form>
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}
          </article>
        </div>
        <div className="moduleGrid threeColumns compactBillingCards">
          {dataLoading ? <article className="panel financeCard"><EmptyState>正在读取账单数据...</EmptyState></article> : null}
          {dataError ? <article className="panel financeCard"><EmptyState>{dataError}</EmptyState></article> : null}
          {!dataLoading && !dataError && data.billing.length === 0 ? <article className="panel financeCard"><EmptyState>暂无账单</EmptyState></article> : null}
          {!dataLoading && !dataError ? data.billing.map((item) => (
            <article className="panel financeCard" key={item.cycleId} onClick={() => setSelectedBillingId(item.cycleId)}>
              <span>{item.cycleMonth?.slice(0, 7)} · {item.itemCount ?? 0} 条明细</span>
              <h3>{item.studentName}</h3>
              <strong>¥{Number(item.totalAmount ?? 0).toLocaleString("zh-CN")}</strong>
              <small>已收 ¥{Number(item.paidAmount ?? 0).toLocaleString("zh-CN")} · 待收 ¥{Number(item.unpaidAmount ?? 0).toLocaleString("zh-CN")}</small>
              <ModuleStatus tone={item.status === "PAID" ? "green" : item.status === "PARTIALLY_PAID" ? "amber" : "violet"}>{billingStatusLabel(item.status)}</ModuleStatus>
            </article>
          )) : null}
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

type DotPoint = {
  originX: number;
  originY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
};

function AuthDotField({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.closest(".authBrandPanel") as HTMLElement | null;
    const context = canvas?.getContext("2d");
    if (!canvas || !container || !context) {
      return;
    }

    let animationFrame = 0;
    let dotPoints: DotPoint[] = [];
    let width = 0;
    let height = 0;
    let ratio = 1;
    const pointer = {
      active: false,
      lastActive: 0,
      x: 0,
      y: 0,
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * ratio));
      canvas.height = Math.max(1, Math.floor(height * ratio));
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      const spacing = Math.max(16, Math.min(23, width / 48));
      dotPoints = [];
      for (let y = -spacing; y <= height + spacing; y += spacing) {
        for (let x = -spacing; x <= width + spacing; x += spacing) {
          dotPoints.push({
            originX: x,
            originY: y,
            x,
            y,
            vx: 0,
            vy: 0,
          });
        }
      }
    };

    const movePointer = (event: globalThis.MouseEvent | globalThis.PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.active = true;
      pointer.lastActive = performance.now();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    };

    const leavePointer = () => {
      pointer.active = false;
    };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);

      const hoverAge = time - pointer.lastActive;
      const isInteracting = active && pointer.active && hoverAge < 1800;
      const radius = Math.max(170, Math.min(width, height) * 0.34);

      if (isInteracting) {
        const glow = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, radius * 1.08);
        glow.addColorStop(0, "rgba(126, 229, 255, 0.34)");
        glow.addColorStop(0.34, "rgba(118, 92, 255, 0.18)");
        glow.addColorStop(1, "rgba(118, 92, 255, 0)");
        context.fillStyle = glow;
        context.fillRect(0, 0, width, height);
      }

      context.globalCompositeOperation = "lighter";
      dotPoints.forEach((point) => {
        const deltaX = point.originX - pointer.x;
        const deltaY = point.originY - pointer.y;
        const distance = Math.hypot(deltaX, deltaY) || 1;
        const influence = isInteracting ? Math.max(0, 1 - distance / radius) : 0;
        const force = influence * influence;
        const targetX = point.originX + (deltaX / distance) * force * 58;
        const targetY = point.originY + (deltaY / distance) * force * 58;
        point.vx += (targetX - point.x) * 0.16;
        point.vy += (targetY - point.y) * 0.16;
        point.vx *= 0.74;
        point.vy *= 0.74;
        point.x += point.vx;
        point.y += point.vy;

        const size = 1.35 + force * 4.2;
        const alpha = 0.48 + force * 0.48;

        if (force > 0.04) {
          context.beginPath();
          context.moveTo(point.originX, point.originY);
          context.lineTo(point.x, point.y);
          context.strokeStyle = `rgba(126, 229, 255, ${force * 0.42})`;
          context.lineWidth = 1;
          context.stroke();
        }

        context.beginPath();
        context.arc(point.x, point.y, size, 0, Math.PI * 2);
        context.fillStyle = force > 0.02
          ? `rgba(126, 229, 255, ${Math.min(0.96, alpha)})`
          : `rgba(255, 255, 255, ${alpha})`;
        context.fill();
      });
      context.globalCompositeOperation = "source-over";

      if (active) {
        animationFrame = window.requestAnimationFrame(draw);
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    container.addEventListener("pointermove", movePointer);
    container.addEventListener("mousemove", movePointer);
    container.addEventListener("pointerleave", leavePointer);
    container.addEventListener("mouseleave", leavePointer);
    animationFrame = window.requestAnimationFrame(draw);

    return () => {
      observer.disconnect();
      container.removeEventListener("pointermove", movePointer);
      container.removeEventListener("mousemove", movePointer);
      container.removeEventListener("pointerleave", leavePointer);
      container.removeEventListener("mouseleave", leavePointer);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [active]);

  return <canvas className="authDotCanvas" ref={canvasRef} />;
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
          {(["left", "right"] as AuthPanelPlacement[]).map((placement) => (
            <button
              className={authPanel === placement ? "active" : ""}
              key={placement}
              onClick={() => setAuthPanel(placement)}
              title={placement === "left" ? authText.left : authText.right}
              type="button"
            >
              {placement === "left" ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
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
        <div className="authMotionScene authDotField" aria-hidden="true">
          <AuthDotField active={preferences.animation} />
        </div>
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
  const [workspaceData, setWorkspaceData] = useState<WorkspaceData>(emptyWorkspaceData);
  const [workspaceError, setWorkspaceError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 760);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("zenox-preferences", JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    if (!authSession?.accessToken) {
      setWorkspaceData(emptyWorkspaceData);
      return;
    }
    let ignore = false;
    const loadWorkspace = async () => {
      try {
        setWorkspaceError("");
        const nextData = await apiGet<WorkspaceData>("/api/workspace", authSession.accessToken);
        if (!ignore) {
          setWorkspaceData(nextData);
        }
      } catch (error) {
        if (!ignore) {
          setWorkspaceError(error instanceof Error ? error.message : "工作台数据加载失败");
        }
      }
    };
    void loadWorkspace();
    return () => {
      ignore = true;
    };
  }, [authSession?.accessToken]);

  const visibleModules = useMemo(
    () => modules.filter((item) => authSession && item.roles.includes(authSession.role) && authSession.accessCodes.includes(item.permissionCode)),
    [authSession],
  );

  const moduleGroups = useMemo(() => groupModules(visibleModules), [visibleModules]);
  const activeModule = visibleModules.find((item) => item.key === activeKey) ?? visibleModules[0] ?? modules[0];
  const text = uiText[preferences.language];
  const todayValue = toDateInputValue(new Date());
  const dashboardLessons = workspaceData.lessons.filter((lesson) => toDateInputValue(new Date(lesson.startsAt)) === todayValue);
  const pendingReviews = workspaceData.reviews.filter((review) => !review.reviewedAt).length;
  const monthRevenue = workspaceData.billing.reduce((sum, item) => sum + Number(item.paidAmount ?? 0), 0);
  const dashboardStats = [
    ["今日课程", String(dashboardLessons.length), "真实排课"],
    ["待办事项", String(workspaceData.todos.length), "系统内提醒"],
    ["待批作业", String(pendingReviews), "文字点评"],
    ["本月已收", `¥${monthRevenue.toLocaleString("zh-CN")}`, "按学生账单"],
  ] as const;

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
    const firstVisibleModule = modules.find((item) => item.roles.includes(user.role) && user.accessCodes.includes(item.permissionCode));
    setAuthSession(user);
    setActiveKey(firstVisibleModule?.key ?? user.homePath);
  };

  const handleLogout = () => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthSession(null);
    setActiveKey("dashboard");
  };

  if (!ready) {
    return <Skeleton shellClassName={rootClass} />;
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
              {workspaceError ? <small>{workspaceError}</small> : null}
              </div>
              <div className="statsGrid">
                {dashboardStats.map(([label, value, meta]) => (
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
                  {workspaceData.todos.length === 0 ? <EmptyState>暂无待办事项</EmptyState> : null}
                  {workspaceData.todos.map((item) => (
                    <button className={`todoItem ${item.priority}`} key={item.label}>
                      <span>{item.category}</span>
                      <div>
                        <strong>{item.label}</strong>
                        <small>{item.detail ?? "系统内提醒"}{item.dueAt ? ` · ${formatDateTime(item.dueAt)}` : ""}</small>
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
                  {dashboardLessons.length === 0 ? <EmptyState>今天暂无课程</EmptyState> : null}
                  {dashboardLessons.map((lesson) => (
                    <div className="lessonRow" key={lesson.id}>
                      <time>{formatTime(lesson.startsAt)}</time>
                      <div>
                        <strong>{lesson.classGroupName ?? "未绑定班级"}</strong>
                        <small>{lesson.subject ?? "课程"} · {lesson.topic ?? "未填写主题"}</small>
                      </div>
                      <em>{lessonStatusLabel(lesson.status)}</em>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          </section>
        ) : (
          <ModuleWorkspace
            authSession={authSession}
            key={`${activeModule.key}-${preferences.transition}-${preferences.language}`}
            language={preferences.language}
            module={activeModule}
            onWorkspaceDataChange={setWorkspaceData}
            workspaceData={workspaceData}
          />
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
