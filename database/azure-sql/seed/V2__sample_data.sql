-- =====================================================================
-- 42X Academy LMS — sample data for first tests (one row per table; users has
-- one admin and one student). Remove "classpath:db/seed" from
-- spring.flyway.locations in production to skip this file.
-- Passwords are NOT stored here: the backend sets them at startup for users
-- without one (see app.seed.* in application-local.properties).
-- =====================================================================

INSERT INTO users (id, role, name, email, phone, city, batch, status, joined_on) VALUES
  (N'adm-01', N'ADMIN', N'Admin', N'admin@example.com', N'', N'', N'', N'Active', '2026-10-01'),
  (N'stu-1001', N'STUDENT', N'Priya Sharma', N'priya.sharma@example.com', N'98220 14567', N'Pune', N'Oct 2026 Weekday', N'Active', '2026-10-01');

INSERT INTO courses (id, code, title, category, level, instructor, duration_weeks, description, status) VALUES
  (N'sap-abap', N'SAP-ABAP', N'SAP ABAP Development', N'SAP', N'Beginner to Advanced', N'Amit Deshmukh', 14,
   N'Learn ABAP from fundamentals to reports, debugging and enhancements, then build and debug a custom report and BAdI in a client-style capstone.',
   N'Published');

INSERT INTO course_modules (id, course_id, title, sort_order) VALUES
  (N'sap-abap-m1', N'sap-abap', N'ABAP Fundamentals', 1);

INSERT INTO lectures (id, course_id, module_id, title, description, sort_order, duration_minutes, video_url, onedrive_item_id) VALUES
  (N'sap-abap-m1-l1', N'sap-abap', N'sap-abap-m1', N'Data types and variables',
   N'Data types and variables — recorded class session for ABAP Fundamentals.', 1, 38, NULL, NULL);

INSERT INTO resources (id, course_id, module_id, lecture_id, title, description, type, size_kb, file_url, updated_on) VALUES
  (N'res-1', N'sap-abap', N'sap-abap-m1', NULL, N'ABAP Fundamentals — Notes', N'', N'Notes', 1260, NULL, '2026-10-01');

INSERT INTO enrollments (id, student_id, course_id, enrolled_on, status) VALUES
  (N'enr-1', N'stu-1001', N'sap-abap', '2026-10-01', N'Active');

INSERT INTO lecture_progress (student_id, lecture_id) VALUES
  (N'stu-1001', N'sap-abap-m1-l1');

INSERT INTO last_watched (student_id, lecture_id) VALUES
  (N'stu-1001', N'sap-abap-m1-l1');

INSERT INTO student_activity (student_id, text) VALUES
  (N'stu-1001', N'Completed “Data types and variables”');

INSERT INTO announcements (id, title, message, course_id, pinned, posted_by, posted_on) VALUES
  (N'ann-1', N'Welcome to 42X Academy', N'Your courses, lectures and notes are now available in the student portal.', NULL, 1, N'Admin', '2026-10-01');

INSERT INTO certificates (id, student_id, course_id, status, certificate_no, issued_on) VALUES
  (N'cert-1', N'stu-1001', N'sap-abap', N'Issued', N'42X-ABAP-2026-1001', '2026-10-15');
