# 42X Academy LMS — Backend

Spring Boot 4.1 · Java 21 · Spring Security (JWT) · Spring Data JPA / Hibernate · Flyway · Azure SQL.

## Run

```bash
copy application-local.properties.example application-local.properties   # first time; fill in the secrets
mvnw spring-boot:run            # Windows   (./mvnw on macOS/Linux)
mvnw test                       # unit tests
mvnw package                    # builds target/lms-backend-1.0.0.jar
java -jar target/lms-backend-1.0.0.jar
```

API base: `http://localhost:8080/api` · Health: `GET /api/actuator/health`

## Configuration

`src/main/resources/application.properties` holds shared settings. Secrets come from **environment variables** (production) or **`application-local.properties`** in this folder (local, git-ignored).

| Setting / env variable     | Meaning                                                       |
| -------------------------- | ------------------------------------------------------------- |
| `AZURE_SQL_SERVER`         | Default `42xcore.database.windows.net`                        |
| `AZURE_SQL_DATABASE`       | Default `42X_Core`                                            |
| `AZURE_SQL_AUTH`           | Microsoft Entra method: `ActiveDirectoryInteractive` (default, local browser sign-in), `ActiveDirectoryManagedIdentity` (on Azure) or `ActiveDirectoryDefault` |
| `JWT_SECRET`               | Token signing secret, **at least 32 characters**              |
| `JWT_EXPIRATION_MINUTES`   | Login lifetime (default 480 = 8 hours)                        |
| `CORS_ALLOWED_ORIGINS`     | Frontend URLs, comma separated (e.g. `https://student.42xacademy.com`) |
| `FLYWAY_LOCATIONS`         | Production: `classpath:db/migration` (skips demo data)        |
| `SEED_STUDENT_PASSWORD` / `SEED_ADMIN_PASSWORD` | Demo passwords for seeded users (local only) |
| `PORT`                     | HTTP port (default 8080)                                      |

## Code layout (`src/main/java/com/academy42x/lms`)

```
config/        SecurityConfig (JWT, CORS, roles), AppProperties, DemoPasswordInitializer
security/      JwtService (issues tokens), AccessGuard (student = own data only), JSON 401/403
controller/    AuthController, StudentController, MediaController
controller/admin/  AdminAcademyController (dashboard, students, enrollments, announcements, certificates)
                   AdminCourseController (courses + each course's students/modules/lectures/resources)
service/       AuthService, StudentService, MediaService (OneDrive point), ProgressCalculator
service/admin/ one service per admin area
entity/        JPA entities (one per table)
repository/    Spring Data repositories
dto/           JSON shapes — identical to what the frontend expects
exception/     ApiException + GlobalExceptionHandler → { "message": "…" }
util/          Ids (readable ids / course slugs), Inputs (validation helpers)
```

## API overview (all under `/api`)

| Area | Endpoints |
| ---- | --------- |
| Auth (public) | `POST /auth/login`, `POST /auth/logout`, `POST /auth/forgot-password` |
| Student (own data) | `GET /students/{id}/dashboard · /courses · /courses/{courseId} · /courses/{courseId}/lectures/{lectureId} · /resources · /progress · /announcements · /profile`, `PUT /students/{id}/progress/lectures/{lectureId}`, `PATCH /students/{id}/profile`, `POST /students/{id}/change-password` |
| Media | `GET /lectures/{id}/stream-url`, `GET /resources/{id}/download-url` |
| Admin | `GET /admin/dashboard`; `/admin/students[/{id}]`; `/admin/courses[/{id}]` + `/students`, `/available-students`, `/modules[/{id}][/move]`, `/lectures[/{id}]`, `/resources[/{id}]`; `/admin/enrollments[/{id}]`; `/admin/announcements[/{id}]`; `/admin/certificates[/{id}]` |

Errors always return `{ "message": "…" }` with a proper HTTP status (400, 401, 403, 404, 409, 500).

## OneDrive (later)

Only `service/MediaService.java` needs to change: use Microsoft Graph with the backend's own app credentials to turn a lecture's `onedrive_item_id` into a short-lived, protected URL. The frontend already calls `/lectures/{id}/stream-url` and `/resources/{id}/download-url`.

## Production checklist

- Set `AZURE_SQL_AUTH=ActiveDirectoryManagedIdentity`, `JWT_SECRET`, `PASSWORD_VAULT_KEY`, `CORS_ALLOWED_ORIGINS` as environment variables, and give the app's managed identity access to the database (see `database/README.md`).
- Set `FLYWAY_LOCATIONS=classpath:db/migration` so demo data is not loaded.
- Leave `SEED_*_PASSWORD` empty and create real admin accounts.
