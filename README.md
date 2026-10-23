# 42X Academy LMS

Learning Management System for [42X Academy](https://42xacademy.com): a **Student panel** and a course-centric **Admin panel**.

```
42x-LMS/
├── frontend/   React 19 + Vite — Student & Admin UI            → frontend/README.md
├── backend/    Java 21 + Spring Boot 4 REST API (/api)         → backend/README.md
└── database/   Azure SQL schema + sample data (Flyway)         → database/README.md
```

```
React (frontend)  →  REST API + JWT (backend, Spring Boot)  →  JPA / Hibernate  →  Azure SQL (database)
```

## Run everything locally

**Needs:** Node.js 20+, Java 21 (JDK), and a Microsoft account with access to the Azure SQL database `42X_Core` (your IP must be allowed in the Azure SQL firewall). Maven is not needed (the backend includes `mvnw`).

### 1. Backend + database

```bash
cd backend
copy application-local.properties.example application-local.properties   # first time only, then fill in the secrets
mvnw spring-boot:run          # Windows  (macOS/Linux: ./mvnw spring-boot:run)
```

On start a browser window asks you to sign in with your Microsoft account (no database password). On the first start Flyway builds all tables in Azure SQL and loads the sample data from `database/azure-sql/`. API: `http://localhost:8080/api` · health check: `http://localhost:8080/api/actuator/health`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

### 3. Sign in

| Role    | Email                       |
| ------- | --------------------------- |
| Student | `priya.sharma@example.com`  |
| Admin   | `admin@example.com`         |

Passwords are the values you set in `backend/application-local.properties` (`app.seed.*`).


## Where to change what

| I want to change…                     | Go to                                                        |
| ------------------------------------- | ------------------------------------------------------------ |
| A page or component                   | `frontend/src/components/…` (one folder per feature)         |
| Which API a page calls                | `frontend/src/services/…`                                    |
| An API endpoint                       | `backend/src/main/java/com/academy42x/lms/controller/…`      |
| Business rules (who sees what)        | `backend/src/main/java/com/academy42x/lms/service/…`         |
| Tables / columns                      | new file `database/azure-sql/migrations/V3__….sql`                   |
| Demo data                             | `database/azure-sql/seed/V2__sample_data.sql`                          |

## Not built yet

- **OneDrive** — lecture videos and files: integration point is `backend/…/service/MediaService.java` (frontend already calls it).
- **Emails** — password reset links (`AuthService.requestPasswordReset`).
- **Certificate PDFs**.

## Security notes

- Passwords are stored as BCrypt hashes. Login returns a JWT (8 hours).
- Admin API (`/api/admin/**`) needs the ADMIN role; students can only read their own data.
- Real passwords / secrets live only in `backend/application-local.properties` (git-ignored) or in environment variables in production.
