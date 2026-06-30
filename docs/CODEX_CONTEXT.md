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
- Real login against the Spring Boot backend; role and module visibility come from backend `accessCodes`.
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

## Latest Implementation State - 2026-06-30

The project has moved beyond UI prototype work. It now has a running Spring Boot backend and the web app is partially connected to real backend data.

Important current facts:

- Backend lives in `apps/server`.
- Web app still lives mainly in `apps/web/src/App.tsx` and `apps/web/src/styles.css`; this file is now large and should be split soon.
- Login is real: the frontend posts to `POST /api/auth/login`.
- The login page no longer lets users choose a role. Users enter an account; backend resolves role and permissions from MySQL.
- Demo accounts:
  - `zcx / 123456`: tenant owner / admin, all permissions.
  - `teacher / 123456`: teacher, teaching and operational permissions, no system admin.
  - `student / 123456`: student, no dashboard, no schedule, no class roster.
  - `parent / 123456`: parent, no dashboard, no schedule, no class roster.
- Sidebar visibility is controlled by backend `accessCodes` returned from login, not hardcoded frontend role switching.
- `role_permission` stores role-to-permission mappings.
- `V5__tighten_role_permissions.sql` tightened student/parent visibility after user feedback.
- `班级学员`, `日历排课`, and `作业中心` have been connected to real backend APIs.

Current schedule feature:

- Teachers/admins can view lessons in the schedule page.
- The schedule page has week-day switching, a selected-day lesson list, a create lesson form, quick delay by 30 minutes, and cancel lesson action.
- Backend checks schedule conflicts:
  - teacher time conflict.
  - class/group time conflict.
  - same student across different classes/groups at the same time.
- Schedule export is real: `GET /api/lessons/export?month=YYYY-MM` returns an `.xlsx` file.
- Frontend `导出 Excel` opens a month picker and downloads `ZenoX-课程记录-YYYY-MM.xlsx`.
- The export includes date, start/end time, class/group, student count, subject, topic, hours, unit price, amount, delivery mode, and status.

Recent backend verification:

```text
mvn test
npm run lint -w apps/web
npm run build -w apps/web
```

These passed after the schedule export work.

## 2026-06-30 Evening Handoff

Today the project advanced from schedule/data wiring into real tutor-studio operations. The most important completed work:

- Added real workspace aggregate data for dashboard, classes, students, lessons, homework, records, reminders, billing, and forum/question views.
- Added admin-only student management and teacher management modules in the sidebar.
- Added class roster management:
  - classes choose existing students and existing teachers.
  - teacher/student creation is done from separate admin modules.
  - class management only binds/removes existing people.
- Added schedule completion workflow:
  - completing a lesson creates/restores attendance records.
  - completing a lesson deducts student remaining lessons.
  - completing a lesson generates billing cycle/items for each student in the class.
  - undoing completion restores student remaining lessons, soft-deletes generated attendance and billing items, and recalculates billing.
  - completed lessons show an undo-complete action in the schedule UI.
- Added billing payment loop:
  - `GET /api/billing` lists billing cycles.
  - `GET /api/billing/{cycleId}` returns billing detail with lesson items and payment records.
  - `POST /api/billing/{cycleId}/payments` records parent payment.
  - `DELETE /api/billing/payments/{paymentId}` soft-deletes/undoes a payment and recalculates cycle status.
  - status is recalculated from active billing items and active payments.
- Added monthly statement PDF:
  - `GET /api/billing/{cycleId}/statement.pdf`.
  - Current implementation renders an A4 branded ZenoX monthly statement as a high-resolution Java2D image and embeds it into PDF.
  - This avoids Chinese glyph issues and requires no new Maven dependency.
  - PDF includes ZenoX brand, Zhao Chenxiong studio label, student/parent info, billing month, amount summary cards, lesson items, payment records, footer, and page number.
- Frontend billing page is now a billing workbench:
  - left billing list.
  - right detail panel.
  - amount summary.
  - lesson item list.
  - payment history.
  - record payment form.
  - undo payment action.
  - download monthly PDF action.

Important files touched for the latest business loop:

```text
apps/server/src/main/java/com/zenox/billing/
apps/server/src/main/java/com/zenox/lesson/
apps/server/src/main/java/com/zenox/workspace/
apps/server/src/main/java/com/zenox/classroom/
apps/server/src/main/java/com/zenox/user/
apps/server/src/main/resources/db/migration/V6__real_workspace_relations.sql
apps/server/src/main/resources/db/migration/V7__admin_people_management_permissions.sql
apps/web/src/App.tsx
apps/web/src/styles.css
```

Validation performed after the latest changes:

```bash
cd apps/server && mvn test
cd apps/web && npm run lint
cd apps/web && npm run build
```

Also verified against running local services:

- login works with `zcx / 123456`.
- billing list endpoint returns real data.
- billing detail endpoint returns items/payments.
- branded statement PDF endpoint returns `%PDF-`.
- rendered the PDF via Poppler and visually checked the page PNG; Chinese text, amounts, cards, and layout rendered correctly.

Current local dev service ports:

```text
backend: http://127.0.0.1:8081
frontend: http://127.0.0.1:5173
```

Database Docker setup:

- A root-level `docker-compose.yml` now exists.
- From the project root, run `docker compose up -d mysql`.
- It starts `mysql:8.4` as `zenox-mysql`.
- It creates database `zenox`, user `zenox`, password `zenox_dev_password`.
- Backend defaults already point to this Docker database.
- Flyway handles schema creation and demo seed data.

Next recommended product step:

- Implement the homework loop:
  - teacher publishes homework to class or selected students.
  - upload attachments.
  - student submits images/PDF/Word.
  - teacher reviews with text comment and mistake tags.
  - homework reminders and review status enter todos.

## Current Project Structure

```text
.
├─ PRODUCT_DESIGN.md
├─ docs
│  ├─ ARCHITECTURE.md
│  └─ CODEX_CONTEXT.md
├─ apps
│  ├─ server
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

Recommended push command if another local commit is created:

```bash
cd /Users/zhaochenxiong/Projects/weini
git push origin main
```

On Windows after push succeeds:

```bash
git clone https://github.com/zcx54335/ZenoX.git
cd ZenoX
npm install
npm run dev -w apps/web
```

## Backend State

Backend has been scaffolded and partially implemented.

Confirmed stack:

- Java 21.
- Spring Boot 3.
- MySQL 8.
- Maven.
- Flyway.
- MyBatis Plus.
- JWT auth.
- Apache POI for Excel export.
- Redis later.
- Object storage for homework files and teaching materials.
- WeChat mini program subscription messages for reminders.
- Start as modular monolith, not microservices.
- Use `tenant_id` for SaaS multi-tenant isolation.

Implemented backend areas:

- Auth: username/password login, JWT, role and permission return.
- Tenant isolation: JWT carries `tenantId` as a string to avoid large-number precision loss.
- Users/classes/students/homework: initial CRUD/list endpoints.
- Lessons: list, create, reschedule, cancel, conflict checks, Excel export.
- Flyway migrations:
  - `V1__init_core_schema.sql`
  - `V2__seed_demo_owner.sql`
  - `V3__seed_demo_workspace.sql`
  - `V4__role_permissions.sql`
  - `V5__tighten_role_permissions.sql`

See:

```text
docs/ARCHITECTURE.md
```

## Next Development Suggestions

Recommended next steps:

1. Split `App.tsx` into components soon:
   - shell/layout.
   - sidebar.
   - topbar.
   - dashboard.
   - theme drawer.
   - login view.
   - schedule page.
   - classes/students page.
   - homework page.
2. Continue turning mock pages into real data pages:
   - homework review.
   - forum/question bank.
   - class records.
   - billing/monthly PDF.
   - custom fields.
3. Improve schedule feature:
   - add true month/week calendar visualization.
   - add edit form instead of only "delay 30 minutes".
   - add lesson detail drawer.
   - add permission checks on backend endpoints, not only frontend navigation.
4. Add real class member management so teachers can assign students to classes from the UI.
5. Implement homework publish/visibility/submission/review workflow.
6. Add billing monthly cycle generation from completed lessons and payment records.

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
