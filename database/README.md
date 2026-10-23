# 42X Academy LMS — Database (Azure SQL)

The SQL in `azure-sql/` is the single source of truth for the database. The backend packages it and **Flyway** applies it automatically on start, so you normally never run it by hand.

```
database/
├── azure-sql/
│   ├── migrations/V1__create_schema.sql   tables, keys, foreign keys, checks   (always applied)
│   └── seed/V2__sample_data.sql           one sample row per table             (local / test only)
└── mysql/                                 old MySQL scripts, kept for reference (not used by the backend)
```

Database: **`42X_Core`** on **`42xcore.database.windows.net`** (Microsoft Entra sign-in, no password).

## Tables

| Table              | Holds                                                                 |
| ------------------ | --------------------------------------------------------------------- |
| `users`            | Students and admins (`role`), BCrypt `password_hash`, status          |
| `courses`          | Courses; `id` is a readable slug used in URLs (e.g. `sap-abap`)       |
| `course_modules`   | Modules (chapters) of one course, with `sort_order`                   |
| `lectures`         | Lectures of a module; `video_url` / `onedrive_item_id` (no video files) |
| `resources`        | Notes, syllabus, assignments — whole course, one module or one lecture |
| `enrollments`      | One student ↔ one course (unique pair), status                        |
| `lecture_progress` | Lectures a student completed                                          |
| `last_watched`     | Last lecture each student opened ("Continue learning")                |
| `student_activity` | Student "Recent activity" feed                                        |
| `announcements`    | Academy-wide (`course_id` NULL) or course-specific                    |
| `certificates`     | One per student per course: Issued / Revoked                          |

Deleting a course removes its modules, lectures, resources, enrollments and course announcements (`ON DELETE CASCADE`). The API blocks deleting a course that still has enrolled students.

## Permissions needed

The Entra account (or the app's managed identity) needs, inside `42X_Core`:

| Role              | Why                                                   |
| ----------------- | ----------------------------------------------------- |
| `db_datareader`   | Read data                                             |
| `db_datawriter`   | Insert / update / delete data                         |
| `db_ddladmin`     | Flyway creates tables and future migrations           |

After the tables exist, a deployed app can run with only `db_datareader` + `db_datawriter` if migrations are applied separately.

## Changing the schema

Never edit a migration that has already run. Add a new file instead, e.g. `azure-sql/migrations/V3__add_batch_table.sql`; Flyway applies it on the next start.

## Sample data

`azure-sql/seed/V2__sample_data.sql` contains **no passwords**: the backend sets them (`app.seed.*` in `backend/application-local.properties`) for users without one. In production, skip it with `FLYWAY_LOCATIONS=classpath:db/migration`.
