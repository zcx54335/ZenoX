import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  Bell,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Home,
  Languages,
  LayoutDashboard,
  Menu,
  Moon,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  ReceiptText,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Sun,
  Tags,
  UploadCloud,
  Users,
  WandSparkles,
  X,
  type LucideIcon,
} from "lucide-react";

type Role = "admin" | "teacher" | "student" | "parent";
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

const session = {
  name: "赵辰雄",
  role: "admin" as Role,
  studio: "ZenoX Studio",
};

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

export function App() {
  const [activeKey, setActiveKey] = useState("dashboard");
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
    () => modules.filter((item) => item.roles.includes(session.role)),
    [],
  );

  const moduleGroups = useMemo(() => groupModules(visibleModules), [visibleModules]);
  const activeModule = visibleModules.find((item) => item.key === activeKey) ?? visibleModules[0];

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

  if (!ready) {
    return <Skeleton />;
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
            <span>{session.studio}</span>
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
          <div className="avatar">赵</div>
          <div>
            <strong>{session.name}</strong>
            <span>系统已识别：管理员</span>
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
          <section className="moduleView">
            <article className="panel moduleHero glowCard">
              <activeModule.icon size={34} />
              <div>
                <p className="overline">Module Workspace</p>
                <h2>{activeModule.title}</h2>
                <span>这里是独立模块工作区。下一步每个模块会拆成自己的列表、表单、详情和权限页面。</span>
              </div>
            </article>
          </section>
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
