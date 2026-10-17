# 42X Academy LMS (frontend)

Learning Management System for [42X Academy](https://42xacademy.com), with a **Student panel** and an **Admin panel** in one React + Vite app.

The backend (Spring Boot + Spring Security + JPA/Hibernate + Microsoft SQL Server) is not built yet. Until it is, the app runs on realistic mock data that lives behind the same service layer the real API will use.

## Quick start

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the production build locally
npm run lint
```

### Demo accounts (mock mode only)

| Role    | Email                       | Password      |
| ------- | --------------------------- | ------------- |
| Student | `priya.sharma@example.com`  | any non-empty |
| Admin   | `admin@example.com`         | any non-empty |

Mock data and admin changes are saved in the browser's `localStorage` (key `42x-lms-mock-db-v3`). Clear site data to reset it.

## Environment variables

Copy `.env.example` to `.env.local`:

| Variable             | Purpose                                                        |
| -------------------- | -------------------------------------------------------------- |
| `VITE_API_BASE_URL`  | Spring Boot API base URL, e.g. `https://api.42xacademy.com/api` |
| `VITE_USE_MOCK_API`  | `true` (default) uses mock data; `false` calls the real API      |

Never put secrets in `VITE_` variables. They are embedded in the public JavaScript bundle.

## Project structure

```
src/
├── assets/logo/            Official 42X logo (from 42xacademy.com)
├── config/env.js           Reads VITE_ variables (the only place they are read)
├── styles/                 tokens.css (brand colours/fonts), base.css, ui.css (buttons, inputs, cards)
├── context/                AuthProvider (logged-in user) and Toast context
├── hooks/                  useAuth, useAsync (loading data), useToast, useResourceDownload
├── routes/                 AppRoutes, ProtectedRoute (role check), paths.js (all URLs)
├── pages/
│   ├── Login/              Student/Admin sign-in + forgot password
│   ├── Student/            StudentLayout (sidebar navigation)
│   ├── Admin/              AdminLayout (sidebar navigation)
│   └── NotFound/
├── components/
│   ├── common/             Header, Sidebar, Footer, AppShell, Logo, Icon, DataTable, FormModal,
│   │                       Modal, ProgressBar, StatCard, SearchInput, EmptyState, PageState, …
│   ├── student/            Dashboard, Courses, CourseDetails, Modules, Lectures (player),
│   │                       Syllabus, Resources, Progress, Announcements, Profile
│   └── admin/              Dashboard, Students (+ StudentDetails), Courses,
│       │                   Enrollments, Announcements, Certificates (+ useAdminCrud.js)
│       └── CourseManage/   /admin/courses/:courseId — tabs: CourseOverview, CourseStudents
│                           (+ AssignStudent), CourseModules, CourseLectures, CourseResources
├── services/
│   ├── apiClient.js        fetch wrapper (base URL, JWT header) + withMock()
│   ├── auth/               authService, sessionStore
│   ├── student/            studentService (API contract) + studentMock
│   ├── admin/              adminService (API contract) + adminMock
│   ├── media/              mediaService — OneDrive video/file URL integration point
│   └── shared/             progress helpers
└── mocks/                  Seed data (courses, students, enrollments, …) + mockDb
```

Every feature has its own folder with its `.jsx` and `.css` side by side.

## Admin portal (course-centric)

| Route | What it manages |
| ----- | --------------- |
| `/admin` | Totals and recent activity |
| `/admin/students` | All academy students (add, edit, activate/deactivate, view details) |
| `/admin/courses` | Course cards (add, edit, publish/draft, delete) |
| `/admin/courses/:courseId?tab=…` | One course: `overview`, `students`, `modules`, `lectures`, `resources` — only that course's data |
| `/admin/enrollments` | Student ↔ course assignments across the academy |
| `/admin/announcements` | Academy-wide or course-specific announcements (pin/unpin) |
| `/admin/certificates` | Per-course certificates: Eligible / Issued / Revoked / In progress |

A student can be enrolled in several courses; each enrollment links one student to one course.

## How data flows

```
Component → studentService / adminService → withMock()
                                              ├─ mock mode: studentMock / adminMock → mocks/mockDb
                                              └─ API mode:  apiClient → Spring Boot REST API
```

Components never import mock data directly. To connect the backend, implement the endpoints listed in `services/student/studentService.js`, `services/admin/adminService.js`, `services/auth/authService.js` and `services/media/mediaService.js`, then set `VITE_USE_MOCK_API=false`.

### Authentication

`authService.login` returns `{ user: { id, name, email, role }, token }`. The session is stored by `sessionStore`, and `apiClient` sends `Authorization: Bearer <token>` once the backend issues a JWT. Route protection by role is in `routes/ProtectedRoute.jsx`. Only the backend can truly secure data; the frontend check is for navigation.

### Recorded lectures (OneDrive)

Videos stay on OneDrive and are never stored in this project. Admins save a OneDrive link or item ID per lecture. The player asks `mediaService.getLectureStreamUrl()`, which in production should call the backend. The backend uses Microsoft Graph with its own credentials and returns a short-lived URL. Downloads for notes and syllabus work the same way through `getResourceDownloadUrl()`.

## Deployment

The same build works on both platforms: `npm run build` → static files in `dist/`. Client-side routes (e.g. `/student/courses/sap-abap`) fall back to `index.html` on both.

### Azure Static Web Apps

- App location: `/`
- Output location: `dist`
- API location: *(empty)*
- Routing fallback: `public/staticwebapp.config.json` (copied into `dist/` on build).
- Set `VITE_API_BASE_URL` and `VITE_USE_MOCK_API` as **build-time** environment variables in the GitHub Actions workflow (`env:` of the build step). They are baked in at build time.

### Vercel

- Framework preset: Vite (build `npm run build`, output `dist`). `vercel.json` already sets this and the SPA rewrite.
- Add `VITE_API_BASE_URL` and `VITE_USE_MOCK_API` in Project → Settings → Environment Variables, then redeploy.

### Custom domain

Production domain: `Student.42xacademy.com`. Add it as a custom domain in Azure SWA or Vercel and create the DNS CNAME record they show. No code change is needed because the app uses relative paths. The Spring Boot API must allow this origin in its CORS settings.

## Brand

Colours and fonts follow 42xacademy.com: navy `#0b1e40` / `#070d1b`, primary blue `#2e57df`, cyan `#00b4ff`, violet accent `#7b3dff`, **Poppins** headings and **Inter** body text. All tokens are in `src/styles/tokens.css`.
