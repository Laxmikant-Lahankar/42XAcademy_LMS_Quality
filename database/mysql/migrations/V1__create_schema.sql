-- =====================================================================
-- 42X Academy LMS — database schema (MySQL 8)
-- Applied automatically by Flyway when the backend starts.
-- Course-centric design: modules, lectures and resources belong to one course;
-- enrollments link one student to one course.
-- =====================================================================

-- Students and admins (role decides which panel they use)
CREATE TABLE users (
  id             VARCHAR(40)  NOT NULL,
  role           VARCHAR(10)  NOT NULL,
  name           VARCHAR(120) NOT NULL,
  email          VARCHAR(190) NOT NULL,
  password_hash  VARCHAR(100) NULL,
  phone          VARCHAR(30)  NOT NULL DEFAULT '',
  city           VARCHAR(80)  NOT NULL DEFAULT '',
  batch          VARCHAR(80)  NOT NULL DEFAULT '',
  status         VARCHAR(10)  NOT NULL DEFAULT 'Active',
  joined_on      DATE         NOT NULL,
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_email (email),
  KEY idx_users_role (role),
  CONSTRAINT ck_users_role CHECK (role IN ('STUDENT', 'ADMIN')),
  CONSTRAINT ck_users_status CHECK (status IN ('Active', 'Inactive'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE courses (
  id              VARCHAR(60)  NOT NULL,
  code            VARCHAR(40)  NOT NULL,
  title           VARCHAR(160) NOT NULL,
  category        VARCHAR(40)  NOT NULL,
  level           VARCHAR(60)  NOT NULL DEFAULT 'Beginner',
  instructor      VARCHAR(120) NOT NULL DEFAULT '',
  duration_weeks  INT          NOT NULL DEFAULT 0,
  description     TEXT         NULL,
  status          VARCHAR(10)  NOT NULL DEFAULT 'Draft',
  created_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_courses_code (code),
  CONSTRAINT ck_courses_status CHECK (status IN ('Published', 'Draft'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Modules (chapters) of a course
CREATE TABLE course_modules (
  id          VARCHAR(60)  NOT NULL,
  course_id   VARCHAR(60)  NOT NULL,
  title       VARCHAR(160) NOT NULL,
  sort_order  INT          NOT NULL,
  PRIMARY KEY (id),
  KEY idx_modules_course (course_id, sort_order),
  CONSTRAINT fk_modules_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Recorded lectures. Videos stay on OneDrive; only the link / item id is stored.
CREATE TABLE lectures (
  id                VARCHAR(60)   NOT NULL,
  course_id         VARCHAR(60)   NOT NULL,
  module_id         VARCHAR(60)   NOT NULL,
  title             VARCHAR(160)  NOT NULL,
  description       TEXT          NULL,
  sort_order        INT           NOT NULL,
  duration_minutes  INT           NOT NULL DEFAULT 0,
  video_url         VARCHAR(1000) NULL,
  onedrive_item_id  VARCHAR(200)  NULL,
  PRIMARY KEY (id),
  KEY idx_lectures_course (course_id),
  KEY idx_lectures_module (module_id, sort_order),
  CONSTRAINT fk_lectures_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
  CONSTRAINT fk_lectures_module FOREIGN KEY (module_id) REFERENCES course_modules (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Notes, syllabus, assignments… optionally linked to one module or lecture of the course
CREATE TABLE resources (
  id           VARCHAR(60)   NOT NULL,
  course_id    VARCHAR(60)   NOT NULL,
  module_id    VARCHAR(60)   NULL,
  lecture_id   VARCHAR(60)   NULL,
  title        VARCHAR(200)  NOT NULL,
  description  TEXT          NULL,
  type         VARCHAR(30)   NOT NULL DEFAULT 'Notes',
  size_kb      INT           NOT NULL DEFAULT 0,
  file_url     VARCHAR(1000) NULL,
  updated_on   DATE          NOT NULL,
  PRIMARY KEY (id),
  KEY idx_resources_course (course_id),
  CONSTRAINT fk_resources_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
  CONSTRAINT fk_resources_module FOREIGN KEY (module_id) REFERENCES course_modules (id) ON DELETE SET NULL,
  CONSTRAINT fk_resources_lecture FOREIGN KEY (lecture_id) REFERENCES lectures (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- One student ↔ one course
CREATE TABLE enrollments (
  id           VARCHAR(40) NOT NULL,
  student_id   VARCHAR(40) NOT NULL,
  course_id    VARCHAR(60) NOT NULL,
  enrolled_on  DATE        NOT NULL,
  status       VARCHAR(12) NOT NULL DEFAULT 'Active',
  PRIMARY KEY (id),
  UNIQUE KEY uk_enrollments_student_course (student_id, course_id),
  KEY idx_enrollments_course (course_id),
  CONSTRAINT fk_enrollments_student FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_enrollments_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
  CONSTRAINT ck_enrollments_status CHECK (status IN ('Active', 'Paused', 'Completed', 'Cancelled'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Completed lectures per student
CREATE TABLE lecture_progress (
  student_id    VARCHAR(40) NOT NULL,
  lecture_id    VARCHAR(60) NOT NULL,
  completed_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (student_id, lecture_id),
  KEY idx_progress_lecture (lecture_id),
  CONSTRAINT fk_progress_student FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_progress_lecture FOREIGN KEY (lecture_id) REFERENCES lectures (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- "Continue learning": the last lecture each student opened
CREATE TABLE last_watched (
  student_id  VARCHAR(40) NOT NULL,
  lecture_id  VARCHAR(60) NOT NULL,
  watched_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (student_id),
  CONSTRAINT fk_last_watched_student FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_last_watched_lecture FOREIGN KEY (lecture_id) REFERENCES lectures (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Student "Recent activity" feed
CREATE TABLE student_activity (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  student_id  VARCHAR(40)  NOT NULL,
  text        VARCHAR(300) NOT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_activity_student (student_id, created_at),
  CONSTRAINT fk_activity_student FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Academy-wide (course_id NULL) or course-specific announcements
CREATE TABLE announcements (
  id         VARCHAR(40)  NOT NULL,
  title      VARCHAR(200) NOT NULL,
  message    TEXT         NOT NULL,
  course_id  VARCHAR(60)  NULL,
  pinned     BOOLEAN      NOT NULL DEFAULT FALSE,
  posted_by  VARCHAR(120) NOT NULL,
  posted_on  DATE         NOT NULL,
  PRIMARY KEY (id),
  KEY idx_announcements_course (course_id),
  CONSTRAINT fk_announcements_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- One certificate per student per course
CREATE TABLE certificates (
  id              VARCHAR(40) NOT NULL,
  student_id      VARCHAR(40) NOT NULL,
  course_id       VARCHAR(60) NOT NULL,
  status          VARCHAR(10) NOT NULL,
  certificate_no  VARCHAR(40) NULL,
  issued_on       DATE        NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_certificates_student_course (student_id, course_id),
  CONSTRAINT fk_certificates_student FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_certificates_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
  CONSTRAINT ck_certificates_status CHECK (status IN ('Issued', 'Revoked'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
