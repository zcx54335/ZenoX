# Codex Project Context

This file is the handoff note for continuing the ZenoX tutor SaaS project on another computer or in a new Codex thread.

## Project Identity

- Product name / brand ID: ZenoX.
- Owner: Zhao Chenxiong.
- Initial audience: Zhao Chenxiong's own tutoring workflow.
- Future audience: individual tutors and small tutoring studios as a SaaS product.
- Product tone: Apple-like, clean, high-end, modern SaaS, glassmorphism, calm but technical.

## Current Goal

Build a tutor management system that solves:

- Daily scheduling.
- Homework publishing, student submissions, and teacher feedback.
- Class records.
- Parent/student visibility.
- Billing and monthly PDF records.
- Shared question/forum module.
- SaaS-ready permissions, themes, and layout customization.

The first working surface is the Web teacher/admin workspace. The WeChat mini program skeleton exists but is not the current focus.

## Confirmed Product Decisions

- First version is for Zhao Chenxiong's own use, but should be designed like a SaaS product.
- It must support small studios later.
- It is a management system with a teacher workspace.
- Role visibility is controlled by login state and permissions, not by letting users manually choose a role in the UI.
- Roles: admin, teacher, student, parent.
- Parent and student side can be treated as one family/student-facing experience.
- No assistant role for now.
- One-to-one lessons and group lessons are both modeled as classes/groups; students are put into classes.
- Scheduling is manual by date, not fixed weekly recurrence.
- Scheduling must detect time conflicts.
- Homework files may include images, PDF, and Word.
- Student submissions are mainly images, but can also support other file types.
- Homework review first supports text comments and mistake tags; AI grading is later.
- Homework visibility must support single-student visibility.
- Public question sharing belongs in the forum/question module.
- Forum/question module is shared by teachers and students.
- Students can upload questions.
- No review/audit workflow for forum uploads in the first version.
- Questions need classification by subject and grade.
- Class records only need teacher evaluation and homework; not mandatory.
- Parents do not need to confirm class records in the first version.
- No learning report in the first version.
- Class and homework reminders are needed.
- Billing reminders are not needed.
- Charging is per student/person.
- Parent payment is only recorded, not processed online.
- Monthly billing PDF should be generated.
- Statistics are needed.
- Future SaaS plans: professional edition and studio edition.
- Professional edition is for one teacher, no admin, no forum.
- Studio edition has full modules.
- No independent brand landing page needed yet.
- Custom fields are needed.
- Chinese/English switch is needed.
- Login homepage should be the workspace dashboard.
- Dashboard must not show all functional modules. Functional modules belong in the sidebar navigation.
- Dashboard should show actionable todos, class reminders, homework reminders, and change reminders.

## UI And Design Preferences

The user strongly dislikes old-fashioned, heavy, crowded admin dashboards.

Important UI direction:

- Apple-like SaaS.
- Simple, high-end, spacious, and technical.
- Stronger glass feel on panels and task cards, but text must remain readable.
- Glass effect should affect containers and backgrounds, not make text gray.
- Cards should have gentle hover animation: soft floating, slow glow, no harsh white straight-line shine.
- Page entry should have animation and skeleton loading.
- Sidebar should be clean, rounded, and high-end.
- Sidebar group titles such as "教学", "运营", "系统" should be larger and stronger.
- Sidebar feature items such as "日历排课", "作业中心" should be smaller and lighter.
- Sidebar groups should be collapsible.
- Sidebar scrollbar should be subtle and polished.
- Theme drawer should be collapsible/opened by a button, not always visible.
- Theme settings should learn from Vben's preference system: split into blocks for theme, layout, navigation, content, effects.
- Theme colors must affect the whole interface: background, ambient glow, cards, buttons, tags, scrollbar, and accents.
- Layout settings should include sidebar navigation, top navigation, mixed navigation, and compact navigation.
- Dark mode must keep text highly readable.
- Do not put all functionality on the dashboard.

Visual references:

- Dribbble FundFlow finance dashboard: glass cards, clean high-end SaaS dashboard, soft blue atmosphere.
- Vben Admin: preference drawer, layout presets, theme presets, system-level customization.

## Current Frontend State

Current web project:

```text
apps/web
```

Tech stack:

- React.
- TypeScript.
- Vite.
- Lucide React icons.

Main files:

```text
apps/web/src/App.tsx
apps/web/src/styles.css
```

Implemented in the current prototype:

- ZenoX workspace shell.
- Login-state-based role simulation with admin permissions.
- Sidebar navigation with grouped modules.
- Collapsible sidebar groups.
- Dashboard showing only workspace summary, todos, and today's lessons.
- Theme drawer.
- Theme presets:
  - sea-salt blue.
  - nebula violet.
  - ice-lake cyan.
  - emerald.
  - rose.
  - amber.
  - graphite.
- Layout presets:
  - sidebar navigation.
  - top navigation.
  - mixed navigation.
  - compact navigation.
- Light/dark/auto theme mode.
- Glass strength options.
- Content width, density, radius, animation, gray mode, weak-color mode.
- Skeleton/loading screen.
- Soft hover effects for nav items and cards.

Recent UI fixes:

- Text no longer becomes gray because of glass overlays.
- Dark theme text contrast was improved.
- Sidebar group title fonts were enlarged.
- Sidebar feature item fonts were reduced.
- Card hover motion was softened.

## Current Project Structure

```text
.
├─ PRODUCT_DESIGN.md
├─ docs
│  ├─ ARCHITECTURE.md
│  └─ CODEX_CONTEXT.md
├─ apps
│  ├─ web
│  └─ miniprogram
├─ package.json
└─ package-lock.json
```

## Local Development Rules

Important user instruction:

- Before starting a dev server, stop old preview ports first.
- Do not leave multiple old Vite ports running.
- Prefer one clean preview service on `http://127.0.0.1:5173/`.

Useful commands:

```bash
npm install
npm run build -w apps/web
npm run dev -w apps/web -- --port 5173 --force
```

If port cleanup is needed:

```bash
lsof -iTCP -sTCP:LISTEN -n -P | grep '127.0.0.1:517'
```

## Git And GitHub State

Local Git repository has been initialized.

Remote:

```text
origin https://github.com/zcx54335/ZenoX.git
```

Initial commit:

```text
eeba064 Initial tutor SaaS workspace
```

At the time this context file was created, pushing to GitHub from the Codex environment failed because the environment timed out connecting to `github.com`. The local repository and remote URL were prepared correctly.

Recommended push command on the user's computer:

```bash
cd /Users/zhaochenxiong/Projects/weini
git push -u origin main
```

On Windows after push succeeds:

```bash
git clone https://github.com/zcx54335/ZenoX.git
cd ZenoX
npm install
npm run dev -w apps/web
```

## Backend Direction

Backend is not implemented yet.

Confirmed direction:

- Java 21.
- Spring Boot 3.
- MySQL 8.
- Redis later.
- Object storage for homework files and teaching materials.
- WeChat mini program subscription messages for reminders.
- Start as modular monolith, not microservices.
- Use `tenant_id` for SaaS multi-tenant isolation.

See:

```text
docs/ARCHITECTURE.md
```

## Next Development Suggestions

Recommended next steps:

1. Keep polishing Web workspace UI until the user is satisfied.
2. Split `App.tsx` into components:
   - shell/layout.
   - sidebar.
   - topbar.
   - dashboard.
   - theme drawer.
   - module placeholder.
3. Add real pages for:
   - schedule calendar.
   - classes/students.
   - homework center.
   - homework review.
   - forum/question bank.
   - class records.
   - billing/monthly PDF.
   - custom fields.
4. Add mock data layer before backend.
5. Design backend database schema and Java modules.
6. Add login and role-based navigation rules.

## How To Resume With Codex On Another Computer

In a new Codex thread, tell Codex:

```text
Please read docs/CODEX_CONTEXT.md, PRODUCT_DESIGN.md, and docs/ARCHITECTURE.md first, then continue the ZenoX tutor SaaS project.
```

Then ask it to inspect:

```text
apps/web/src/App.tsx
apps/web/src/styles.css
```

This should restore most of the product and design context without needing the previous chat history.
