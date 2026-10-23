-- =====================================================================
-- 42X Academy LMS — database schema (Azure SQL / SQL Server)
-- Applied automatically by Flyway when the backend starts.
-- Course-centric design: modules, lectures and resources belong to one course;
-- enrollments link one student to one course.
--
-- Times default to India time (the server itself runs on UTC).
-- SQL Server rejects two cascade paths into one table, so lectures.course_id and
-- resources.module_id / lecture_id use NO ACTION; AdminContentService clears those
-- resource links before deleting a module or lecture.
-- =====================================================================

-- Students and admins (role decides which panel they use)
CREATE TABLE users (
  id                  NVARCHAR(40)  NOT NULL,
  role                NVARCHAR(10)  NOT NULL,
  name                NVARCHAR(120) NOT NULL,
  email               NVARCHAR(190) NOT NULL,
  password_hash       NVARCHAR(100) NULL,
  password_encrypted  NVARCHAR(512) NULL,
  phone               NVARCHAR(30)  NOT NULL CONSTRAINT df_users_phone DEFAULT N'',
  city                NVARCHAR(80)  NOT NULL CONSTRAINT df_users_city DEFAULT N'',
  batch               NVARCHAR(80)  NOT NULL CONSTRAINT df_users_batch DEFAULT N'',
  status              NVARCHAR(10)  NOT NULL CONSTRAINT df_users_status DEFAULT N'Active',
  joined_on           DATE          NOT NULL,
  created_at          DATETIME2(6)  NOT NULL CONSTRAINT df_users_created_at DEFAULT CAST(SYSDATETIMEOFFSET() AT TIME ZONE 'India Standard Time' AS DATETIME2(6)),
  updated_at          DATETIME2(6)  NOT NULL CONSTRAINT df_users_updated_at DEFAULT CAST(SYSDATETIMEOFFSET() AT TIME ZONE 'India Standard Time' AS DATETIME2(6)),
  CONSTRAINT pk_users PRIMARY KEY (id),
  CONSTRAINT uk_users_email UNIQUE (email),
  CONSTRAINT ck_users_role CHECK (role IN (N'STUDENT', N'ADMIN')),
  CONSTRAINT ck_users_status CHECK (status IN (N'Active', N'Inactive'))
);
CREATE INDEX idx_users_role ON users (role);

CREATE TABLE courses (
  id              NVARCHAR(60)  NOT NULL,
  code            NVARCHAR(40)  NOT NULL,
  title           NVARCHAR(160) NOT NULL,
  category        NVARCHAR(40)  NOT NULL,
  level           NVARCHAR(60)  NOT NULL CONSTRAINT df_courses_level DEFAULT N'Beginner',
  instructor      NVARCHAR(120) NOT NULL CONSTRAINT df_courses_instructor DEFAULT N'',
  duration_weeks  INT           NOT NULL CONSTRAINT df_courses_duration DEFAULT 0,
  description     NVARCHAR(MAX) NULL,
  status          NVARCHAR(10)  NOT NULL CONSTRAINT df_courses_status DEFAULT N'Draft',
  created_at      DATETIME2(6)  NOT NULL CONSTRAINT df_courses_created_at DEFAULT CAST(SYSDATETIMEOFFSET() AT TIME ZONE 'India Standard Time' AS DATETIME2(6)),
  updated_at      DATETIME2(6)  NOT NULL CONSTRAINT df_courses_updated_at DEFAULT CAST(SYSDATETIMEOFFSET() AT TIME ZONE 'India Standard Time' AS DATETIME2(6)),
  CONSTRAINT pk_courses PRIMARY KEY (id),
  CONSTRAINT uk_courses_code UNIQUE (code),
  CONSTRAINT ck_courses_status CHECK (status IN (N'Published', N'Draft'))
);

-- Modules (chapters) of a course
CREATE TABLE course_modules (
  id          NVARCHAR(60)  NOT NULL,
  course_id   NVARCHAR(60)  NOT NULL,
  title       NVARCHAR(160) NOT NULL,
  sort_order  INT           NOT NULL,
  CONSTRAINT pk_course_modules PRIMARY KEY (id),
  CONSTRAINT fk_modules_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
);
CREATE INDEX idx_modules_course ON course_modules (course_id, sort_order);

-- Recorded lectures. Videos stay on OneDrive; only the link / item id is stored.
CREATE TABLE lectures (
  id                NVARCHAR(60)   NOT NULL,
  course_id         NVARCHAR(60)   NOT NULL,
  module_id         NVARCHAR(60)   NOT NULL,
  title             NVARCHAR(160)  NOT NULL,
  description       NVARCHAR(MAX)  NULL,
  sort_order        INT            NOT NULL,
  duration_minutes  INT            NOT NULL CONSTRAINT df_lectures_duration DEFAULT 0,
  video_url         NVARCHAR(1000) NULL,
  onedrive_item_id  NVARCHAR(200)  NULL,
  CONSTRAINT pk_lectures PRIMARY KEY (id),
  CONSTRAINT fk_lectures_course FOREIGN KEY (course_id) REFERENCES courses (id),
  CONSTRAINT fk_lectures_module FOREIGN KEY (module_id) REFERENCES course_modules (id) ON DELETE CASCADE
);
CREATE INDEX idx_lectures_course ON lectures (course_id);
CREATE INDEX idx_lectures_module ON lectures (module_id, sort_order);

-- Notes, syllabus, assignments… optionally linked to one module or lecture of the course
CREATE TABLE resources (
  id           NVARCHAR(60)   NOT NULL,
  course_id    NVARCHAR(60)   NOT NULL,
  module_id    NVARCHAR(60)   NULL,
  lecture_id   NVARCHAR(60)   NULL,
  title        NVARCHAR(200)  NOT NULL,
  description  NVARCHAR(MAX)  NULL,
  type         NVARCHAR(30)   NOT NULL CONSTRAINT df_resources_type DEFAULT N'Notes',
  size_kb      INT            NOT NULL CONSTRAINT df_resources_size DEFAULT 0,
  file_url     NVARCHAR(1000) NULL,
  updated_on   DATE           NOT NULL,
  CONSTRAINT pk_resources PRIMARY KEY (id),
  CONSTRAINT fk_resources_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
  CONSTRAINT fk_resources_module FOREIGN KEY (module_id) REFERENCES course_modules (id),
  CONSTRAINT fk_resources_lecture FOREIGN KEY (lecture_id) REFERENCES lectures (id)
);
CREATE INDEX idx_resources_course ON resources (course_id);
CREATE INDEX idx_resources_module ON resources (module_id);
CREATE INDEX idx_resources_lecture ON resources (lecture_id);

-- One student ↔ one course
CREATE TABLE enrollments (
  id           NVARCHAR(40) NOT NULL,
  student_id   NVARCHAR(40) NOT NULL,
  course_id    NVARCHAR(60) NOT NULL,
  enrolled_on  DATE         NOT NULL,
  status       NVARCHAR(12) NOT NULL CONSTRAINT df_enrollments_status DEFAULT N'Active',
  CONSTRAINT pk_enrollments PRIMARY KEY (id),
  CONSTRAINT uk_enrollments_student_course UNIQUE (student_id, course_id),
  CONSTRAINT fk_enrollments_student FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_enrollments_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
  CONSTRAINT ck_enrollments_status CHECK (status IN (N'Active', N'Paused', N'Completed', N'Cancelled'))
);
CREATE INDEX idx_enrollments_course ON enrollments (course_id);

-- Completed lectures per student
CREATE TABLE lecture_progress (
  student_id    NVARCHAR(40) NOT NULL,
  lecture_id    NVARCHAR(60) NOT NULL,
  completed_at  DATETIME2(6) NOT NULL CONSTRAINT df_progress_completed_at DEFAULT CAST(SYSDATETIMEOFFSET() AT TIME ZONE 'India Standard Time' AS DATETIME2(6)),
  CONSTRAINT pk_lecture_progress PRIMARY KEY (student_id, lecture_id),
  CONSTRAINT fk_progress_student FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_progress_lecture FOREIGN KEY (lecture_id) REFERENCES lectures (id) ON DELETE CASCADE
);
CREATE INDEX idx_progress_lecture ON lecture_progress (lecture_id);

-- "Continue learning": the last lecture each student opened
CREATE TABLE last_watched (
  student_id  NVARCHAR(40) NOT NULL,
  lecture_id  NVARCHAR(60) NOT NULL,
  watched_at  DATETIME2(6) NOT NULL CONSTRAINT df_last_watched_at DEFAULT CAST(SYSDATETIMEOFFSET() AT TIME ZONE 'India Standard Time' AS DATETIME2(6)),
  CONSTRAINT pk_last_watched PRIMARY KEY (student_id),
  CONSTRAINT fk_last_watched_student FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_last_watched_lecture FOREIGN KEY (lecture_id) REFERENCES lectures (id) ON DELETE CASCADE
);
CREATE INDEX idx_last_watched_lecture ON last_watched (lecture_id);

-- Student "Recent activity" feed
CREATE TABLE student_activity (
  id          BIGINT        IDENTITY(1,1) NOT NULL,
  student_id  NVARCHAR(40)  NOT NULL,
  text        NVARCHAR(300) NOT NULL,
  created_at  DATETIME2(6)  NOT NULL CONSTRAINT df_activity_created_at DEFAULT CAST(SYSDATETIMEOFFSET() AT TIME ZONE 'India Standard Time' AS DATETIME2(6)),
  CONSTRAINT pk_student_activity PRIMARY KEY (id),
  CONSTRAINT fk_activity_student FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE
);
CREATE INDEX idx_activity_student ON student_activity (student_id, created_at);

-- Academy-wide (course_id NULL) or course-specific announcements
CREATE TABLE announcements (
  id         NVARCHAR(40)  NOT NULL,
  title      NVARCHAR(200) NOT NULL,
  message    NVARCHAR(MAX) NOT NULL,
  course_id  NVARCHAR(60)  NULL,
  pinned     BIT           NOT NULL CONSTRAINT df_announcements_pinned DEFAULT 0,
  posted_by  NVARCHAR(120) NOT NULL,
  posted_on  DATE          NOT NULL,
  CONSTRAINT pk_announcements PRIMARY KEY (id),
  CONSTRAINT fk_announcements_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
);
CREATE INDEX idx_announcements_course ON announcements (course_id);

-- One certificate per student per course
CREATE TABLE certificates (
  id              NVARCHAR(40) NOT NULL,
  student_id      NVARCHAR(40) NOT NULL,
  course_id       NVARCHAR(60) NOT NULL,
  status          NVARCHAR(10) NOT NULL,
  certificate_no  NVARCHAR(40) NULL,
  issued_on       DATE         NULL,
  CONSTRAINT pk_certificates PRIMARY KEY (id),
  CONSTRAINT uk_certificates_student_course UNIQUE (student_id, course_id),
  CONSTRAINT fk_certificates_student FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_certificates_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
  CONSTRAINT ck_certificates_status CHECK (status IN (N'Issued', N'Revoked'))
);
GO

-- MySQL's "ON UPDATE CURRENT_TIMESTAMP" for updated_at
CREATE TRIGGER trg_users_updated_at ON users AFTER UPDATE AS
BEGIN
  SET NOCOUNT ON;
  UPDATE u SET updated_at = CAST(SYSDATETIMEOFFSET() AT TIME ZONE 'India Standard Time' AS DATETIME2(6))
  FROM users u JOIN inserted i ON u.id = i.id;
END;
GO

CREATE TRIGGER trg_courses_updated_at ON courses AFTER UPDATE AS
BEGIN
  SET NOCOUNT ON;
  UPDATE c SET updated_at = CAST(SYSDATETIMEOFFSET() AT TIME ZONE 'India Standard Time' AS DATETIME2(6))
  FROM courses c JOIN inserted i ON c.id = i.id;
END;
GO
