-- =====================================================================
-- 42X Academy LMS — demo data (generated from frontend/src/mocks).
-- Only for development / demos. Remove "classpath:db/seed" from
-- spring.flyway.locations in production to skip this file.
-- Passwords are NOT stored here: the backend sets demo passwords at startup
-- for users without one (see app.seed.* in application-local.properties).
-- =====================================================================

INSERT INTO users (id, role, name, email, phone, city, batch, status, joined_on) VALUES
  ('adm-01', 'ADMIN', 'Shruti Kale', 'admin@example.com', '', '', '', 'Active', '2026-08-01'),
  ('stu-1001', 'STUDENT', 'Priya Sharma', 'priya.sharma@example.com', '98220 14567', 'Pune', 'Oct 2026 Weekday', 'Active', '2026-09-01'),
  ('stu-1002', 'STUDENT', 'Aditya Kulkarni', 'aditya.kulkarni@example.com', '99700 33218', 'Pune', 'Oct 2026 Weekday', 'Active', '2026-09-02'),
  ('stu-1003', 'STUDENT', 'Sakshi Patil', 'sakshi.patil@example.com', '90110 42876', 'Mumbai', 'Sep 2026 Weekend', 'Active', '2026-08-20'),
  ('stu-1004', 'STUDENT', 'Omkar Jadhav', 'omkar.jadhav@example.com', '97650 11094', 'Nashik', 'Sep 2026 Weekend', 'Active', '2026-08-22'),
  ('stu-1005', 'STUDENT', 'Neha Shinde', 'neha.shinde@example.com', '88050 67231', 'Pune', 'Oct 2026 Weekday', 'Inactive', '2026-09-05'),
  ('stu-1006', 'STUDENT', 'Rohit Deshpande', 'rohit.deshpande@example.com', '93250 77810', 'Nagpur', 'Aug 2026 Weekday', 'Active', '2026-08-01'),
  ('stu-1007', 'STUDENT', 'Anjali Gaikwad', 'anjali.gaikwad@example.com', '70200 55642', 'Kolhapur', 'Aug 2026 Weekday', 'Active', '2026-08-03'),
  ('stu-1008', 'STUDENT', 'Vikas More', 'vikas.more@example.com', '95030 28819', 'Aurangabad', 'Sep 2026 Weekend', 'Active', '2026-08-25');

INSERT INTO courses (id, code, title, category, level, instructor, duration_weeks, description, status) VALUES
  ('sap-abap', 'SAP-ABAP', 'SAP ABAP Development', 'SAP', 'Beginner to Advanced', 'Amit Deshmukh', 14, 'Learn ABAP from fundamentals to reports, debugging and enhancements, then build and debug a custom report and BAdI in a client-style capstone.', 'Published'),
  ('sap-mm', 'SAP-MM', 'SAP MM — Materials Management', 'SAP', 'Beginner', 'Sneha Joshi', 16, 'Functional SAP MM with embedded ABAP and BASIS awareness. Ends with a live client simulation of a full Procure-to-Pay cycle.', 'Published'),
  ('data-engineering', 'DATA-PBI', 'Power BI for Data Professionals', 'Data', 'Beginner', 'Kiran Patil', 12, 'Work with Python, SQL, data models, pipelines and reporting workflows to turn raw data into dashboard-ready insight.', 'Published'),
  ('power-platform', 'PWR-PLT', 'Power Platform Mastery', 'Power Platform', 'Beginner', 'Neha Kulkarni', 10, 'Build practical apps, automate repetitive tasks and connect business processes with Power Apps, Power Automate and Dataverse.', 'Published'),
  ('devops', 'DEVOPS-AI', 'DevOps with AI', 'DevOps', 'Beginner', 'Rahul Pawar', 16, 'Explore Linux, Git, CI/CD, containers and Kubernetes, using AI tools to generate, debug and explain code in every module.', 'Published');

INSERT INTO course_modules (id, course_id, title, sort_order) VALUES
  ('sap-abap-m1', 'sap-abap', 'ABAP Fundamentals', 1),
  ('sap-abap-m2', 'sap-abap', 'Reports Programming', 2),
  ('sap-abap-m3', 'sap-abap', 'Modularization & Debugging', 3),
  ('sap-abap-m4', 'sap-abap', 'Enhancements', 4),
  ('sap-mm-m1', 'sap-mm', 'SAP & ERP Fundamentals', 1),
  ('sap-mm-m2', 'sap-mm', 'Master Data', 2),
  ('sap-mm-m3', 'sap-mm', 'Procurement Cycle', 3),
  ('sap-mm-m4', 'sap-mm', 'Capstone: P2P Simulation', 4),
  ('data-engineering-m1', 'data-engineering', 'Python for Data Engineering', 1),
  ('data-engineering-m2', 'data-engineering', 'SQL & Relational Databases', 2),
  ('data-engineering-m3', 'data-engineering', 'Data Modeling in Power BI', 3),
  ('data-engineering-m4', 'data-engineering', 'Data Pipelines', 4),
  ('power-platform-m1', 'power-platform', 'Power Platform Fundamentals', 1),
  ('power-platform-m2', 'power-platform', 'Dataverse & Data Modeling', 2),
  ('power-platform-m3', 'power-platform', 'Power Apps', 3),
  ('power-platform-m4', 'power-platform', 'Power Automate', 4),
  ('devops-m1', 'devops', 'DevOps Fundamentals + AI', 1),
  ('devops-m2', 'devops', 'Linux', 2),
  ('devops-m3', 'devops', 'Git & CI/CD', 3),
  ('devops-m4', 'devops', 'Containers', 4);

INSERT INTO lectures (id, course_id, module_id, title, description, sort_order, duration_minutes, video_url, onedrive_item_id) VALUES
  ('sap-abap-m1-l1', 'sap-abap', 'sap-abap-m1', 'Data types and variables', 'Data types and variables — recorded class session for ABAP Fundamentals.', 1, 38, NULL, NULL),
  ('sap-abap-m1-l2', 'sap-abap', 'sap-abap-m1', 'Internal tables', 'Internal tables — recorded class session for ABAP Fundamentals.', 2, 45, NULL, NULL),
  ('sap-abap-m1-l3', 'sap-abap', 'sap-abap-m1', 'Data Dictionary basics', 'Data Dictionary basics — recorded class session for ABAP Fundamentals.', 3, 52, NULL, NULL),
  ('sap-abap-m2-l1', 'sap-abap', 'sap-abap-m2', 'Classical reports', 'Classical reports — recorded class session for Reports Programming.', 1, 41, NULL, NULL),
  ('sap-abap-m2-l2', 'sap-abap', 'sap-abap-m2', 'ALV reports', 'ALV reports — recorded class session for Reports Programming.', 2, 36, NULL, NULL),
  ('sap-abap-m2-l3', 'sap-abap', 'sap-abap-m2', 'Selection screens', 'Selection screens — recorded class session for Reports Programming.', 3, 48, NULL, NULL),
  ('sap-abap-m3-l1', 'sap-abap', 'sap-abap-m3', 'Function modules', 'Function modules — recorded class session for Modularization & Debugging.', 1, 55, NULL, NULL),
  ('sap-abap-m3-l2', 'sap-abap', 'sap-abap-m3', 'Debugger walkthrough', 'Debugger walkthrough — recorded class session for Modularization & Debugging.', 2, 33, NULL, NULL),
  ('sap-abap-m3-l3', 'sap-abap', 'sap-abap-m3', 'Performance analysis', 'Performance analysis — recorded class session for Modularization & Debugging.', 3, 38, NULL, NULL),
  ('sap-abap-m4-l1', 'sap-abap', 'sap-abap-m4', 'BAdI implementation', 'BAdI implementation — recorded class session for Enhancements.', 1, 45, NULL, NULL),
  ('sap-abap-m4-l2', 'sap-abap', 'sap-abap-m4', 'User exits and enhancement spots', 'User exits and enhancement spots — recorded class session for Enhancements.', 2, 52, NULL, NULL),
  ('sap-mm-m1-l1', 'sap-mm', 'sap-mm-m1', 'SAP GUI navigation', 'SAP GUI navigation — recorded class session for SAP & ERP Fundamentals.', 1, 38, NULL, NULL),
  ('sap-mm-m1-l2', 'sap-mm', 'sap-mm-m1', 'Organizational structure', 'Organizational structure — recorded class session for SAP & ERP Fundamentals.', 2, 45, NULL, NULL),
  ('sap-mm-m1-l3', 'sap-mm', 'sap-mm-m1', 'Purchasing organization', 'Purchasing organization — recorded class session for SAP & ERP Fundamentals.', 3, 52, NULL, NULL),
  ('sap-mm-m2-l1', 'sap-mm', 'sap-mm-m2', 'Material master', 'Material master — recorded class session for Master Data.', 1, 41, NULL, NULL),
  ('sap-mm-m2-l2', 'sap-mm', 'sap-mm-m2', 'Business partner and vendor', 'Business partner and vendor — recorded class session for Master Data.', 2, 36, NULL, NULL),
  ('sap-mm-m2-l3', 'sap-mm', 'sap-mm-m2', 'Purchasing info records', 'Purchasing info records — recorded class session for Master Data.', 3, 48, NULL, NULL),
  ('sap-mm-m3-l1', 'sap-mm', 'sap-mm-m3', 'Purchase requisition', 'Purchase requisition — recorded class session for Procurement Cycle.', 1, 55, NULL, NULL),
  ('sap-mm-m3-l2', 'sap-mm', 'sap-mm-m3', 'Purchase order', 'Purchase order — recorded class session for Procurement Cycle.', 2, 33, NULL, NULL),
  ('sap-mm-m3-l3', 'sap-mm', 'sap-mm-m3', 'Goods receipt', 'Goods receipt — recorded class session for Procurement Cycle.', 3, 38, NULL, NULL),
  ('sap-mm-m3-l4', 'sap-mm', 'sap-mm-m3', 'Invoice verification', 'Invoice verification — recorded class session for Procurement Cycle.', 4, 45, NULL, NULL),
  ('sap-mm-m4-l1', 'sap-mm', 'sap-mm-m4', 'Project brief and Jira sprints', 'Project brief and Jira sprints — recorded class session for Capstone: P2P Simulation.', 1, 45, NULL, NULL),
  ('sap-mm-m4-l2', 'sap-mm', 'sap-mm-m4', 'Root-cause analysis of a data issue', 'Root-cause analysis of a data issue — recorded class session for Capstone: P2P Simulation.', 2, 52, NULL, NULL),
  ('data-engineering-m1-l1', 'data-engineering', 'data-engineering-m1', 'Python scripting basics', 'Python scripting basics — recorded class session for Python for Data Engineering.', 1, 38, NULL, NULL),
  ('data-engineering-m1-l2', 'data-engineering', 'data-engineering-m1', 'Data structures', 'Data structures — recorded class session for Python for Data Engineering.', 2, 45, NULL, NULL),
  ('data-engineering-m1-l3', 'data-engineering', 'data-engineering-m1', 'Working with APIs and files', 'Working with APIs and files — recorded class session for Python for Data Engineering.', 3, 52, NULL, NULL),
  ('data-engineering-m2-l1', 'data-engineering', 'data-engineering-m2', 'SELECT and filtering', 'SELECT and filtering — recorded class session for SQL & Relational Databases.', 1, 41, NULL, NULL),
  ('data-engineering-m2-l2', 'data-engineering', 'data-engineering-m2', 'Joins', 'Joins — recorded class session for SQL & Relational Databases.', 2, 36, NULL, NULL),
  ('data-engineering-m2-l3', 'data-engineering', 'data-engineering-m2', 'Window functions', 'Window functions — recorded class session for SQL & Relational Databases.', 3, 48, NULL, NULL),
  ('data-engineering-m3-l1', 'data-engineering', 'data-engineering-m3', 'Star schema design', 'Star schema design — recorded class session for Data Modeling in Power BI.', 1, 55, NULL, NULL),
  ('data-engineering-m3-l2', 'data-engineering', 'data-engineering-m3', 'DAX basics', 'DAX basics — recorded class session for Data Modeling in Power BI.', 2, 33, NULL, NULL),
  ('data-engineering-m3-l3', 'data-engineering', 'data-engineering-m3', 'Building reports', 'Building reports — recorded class session for Data Modeling in Power BI.', 3, 38, NULL, NULL),
  ('data-engineering-m4-l1', 'data-engineering', 'data-engineering-m4', 'Azure Data Factory introduction', 'Azure Data Factory introduction — recorded class session for Data Pipelines.', 1, 45, NULL, NULL),
  ('data-engineering-m4-l2', 'data-engineering', 'data-engineering-m4', 'Apache Airflow overview', 'Apache Airflow overview — recorded class session for Data Pipelines.', 2, 52, NULL, NULL),
  ('power-platform-m1-l1', 'power-platform', 'power-platform-m1', 'Platform overview', 'Platform overview — recorded class session for Power Platform Fundamentals.', 1, 38, NULL, NULL),
  ('power-platform-m1-l2', 'power-platform', 'power-platform-m1', 'Environments and licensing', 'Environments and licensing — recorded class session for Power Platform Fundamentals.', 2, 45, NULL, NULL),
  ('power-platform-m1-l3', 'power-platform', 'power-platform-m1', 'Microsoft 365 integration', 'Microsoft 365 integration — recorded class session for Power Platform Fundamentals.', 3, 52, NULL, NULL),
  ('power-platform-m2-l1', 'power-platform', 'power-platform-m2', 'Tables and columns', 'Tables and columns — recorded class session for Dataverse & Data Modeling.', 1, 41, NULL, NULL),
  ('power-platform-m2-l2', 'power-platform', 'power-platform-m2', 'Relationships', 'Relationships — recorded class session for Dataverse & Data Modeling.', 2, 36, NULL, NULL),
  ('power-platform-m3-l1', 'power-platform', 'power-platform-m3', 'Canvas app basics', 'Canvas app basics — recorded class session for Power Apps.', 1, 55, NULL, NULL),
  ('power-platform-m3-l2', 'power-platform', 'power-platform-m3', 'Power Fx formulas', 'Power Fx formulas — recorded class session for Power Apps.', 2, 33, NULL, NULL),
  ('power-platform-m3-l3', 'power-platform', 'power-platform-m3', 'Model-driven apps', 'Model-driven apps — recorded class session for Power Apps.', 3, 38, NULL, NULL),
  ('power-platform-m4-l1', 'power-platform', 'power-platform-m4', 'Cloud flows', 'Cloud flows — recorded class session for Power Automate.', 1, 45, NULL, NULL),
  ('power-platform-m4-l2', 'power-platform', 'power-platform-m4', 'Approval flows', 'Approval flows — recorded class session for Power Automate.', 2, 52, NULL, NULL),
  ('devops-m1-l1', 'devops', 'devops-m1', 'The DevOps lifecycle', 'The DevOps lifecycle — recorded class session for DevOps Fundamentals + AI.', 1, 38, NULL, NULL),
  ('devops-m1-l2', 'devops', 'devops-m1', 'Agile and Scrum basics', 'Agile and Scrum basics — recorded class session for DevOps Fundamentals + AI.', 2, 45, NULL, NULL),
  ('devops-m1-l3', 'devops', 'devops-m1', 'Prompting for DevOps', 'Prompting for DevOps — recorded class session for DevOps Fundamentals + AI.', 3, 52, NULL, NULL),
  ('devops-m2-l1', 'devops', 'devops-m2', 'Essential Linux commands', 'Essential Linux commands — recorded class session for Linux.', 1, 41, NULL, NULL),
  ('devops-m2-l2', 'devops', 'devops-m2', 'Bash scripting', 'Bash scripting — recorded class session for Linux.', 2, 36, NULL, NULL),
  ('devops-m2-l3', 'devops', 'devops-m2', 'Permissions and processes', 'Permissions and processes — recorded class session for Linux.', 3, 48, NULL, NULL),
  ('devops-m3-l1', 'devops', 'devops-m3', 'Git workflow', 'Git workflow — recorded class session for Git & CI/CD.', 1, 55, NULL, NULL),
  ('devops-m3-l2', 'devops', 'devops-m3', 'Jenkins pipelines', 'Jenkins pipelines — recorded class session for Git & CI/CD.', 2, 33, NULL, NULL),
  ('devops-m4-l1', 'devops', 'devops-m4', 'Docker basics', 'Docker basics — recorded class session for Containers.', 1, 45, NULL, NULL),
  ('devops-m4-l2', 'devops', 'devops-m4', 'Kubernetes introduction', 'Kubernetes introduction — recorded class session for Containers.', 2, 52, NULL, NULL);

INSERT INTO resources (id, course_id, module_id, lecture_id, title, description, type, size_kb, file_url, updated_on) VALUES
  ('res-1', 'sap-abap', NULL, NULL, 'SAP ABAP — Course Syllabus', '', 'Syllabus', 420, NULL, '2026-09-01'),
  ('res-2', 'sap-abap', 'sap-abap-m1', NULL, 'ABAP Fundamentals — Notes', '', 'Notes', 1260, NULL, '2026-09-08'),
  ('res-3', 'sap-abap', 'sap-abap-m2', NULL, 'ABAP Reports — Notes', '', 'Notes', 980, NULL, '2026-10-02'),
  ('res-4', 'sap-abap', 'sap-abap-m2', NULL, 'ALV Report Assignment', '', 'Assignment', 210, NULL, '2026-10-05'),
  ('res-5', 'data-engineering', NULL, NULL, 'Power BI for Data Professionals — Syllabus', '', 'Syllabus', 380, NULL, '2026-09-01'),
  ('res-6', 'data-engineering', 'data-engineering-m1', NULL, 'Python Cheat Sheet', '', 'PDF', 640, NULL, '2026-09-12'),
  ('res-7', 'data-engineering', 'data-engineering-m2', NULL, 'SQL Practice Dataset (Sales)', '', 'Dataset', 2150, NULL, '2026-09-20'),
  ('res-8', 'devops', NULL, NULL, 'DevOps with AI — Syllabus', '', 'Syllabus', 400, NULL, '2026-09-10'),
  ('res-9', 'devops', 'devops-m2', NULL, 'Linux Commands Reference', '', 'PDF', 720, NULL, '2026-09-25'),
  ('res-10', 'sap-mm', NULL, NULL, 'SAP MM — Course Syllabus', '', 'Syllabus', 450, NULL, '2026-08-18'),
  ('res-11', 'power-platform', NULL, NULL, 'Power Platform Mastery — Syllabus', '', 'Syllabus', 360, NULL, '2026-08-20');

INSERT INTO enrollments (id, student_id, course_id, enrolled_on, status) VALUES
  ('enr-1', 'stu-1001', 'sap-abap', '2026-09-01', 'Active'),
  ('enr-4', 'stu-1002', 'sap-abap', '2026-09-02', 'Active'),
  ('enr-5', 'stu-1003', 'sap-mm', '2026-08-20', 'Active'),
  ('enr-6', 'stu-1004', 'power-platform', '2026-08-22', 'Active'),
  ('enr-7', 'stu-1005', 'data-engineering', '2026-09-05', 'Paused'),
  ('enr-8', 'stu-1006', 'devops', '2026-08-01', 'Active'),
  ('enr-9', 'stu-1007', 'sap-mm', '2026-08-03', 'Completed'),
  ('enr-10', 'stu-1008', 'power-platform', '2026-08-25', 'Active');

INSERT INTO lecture_progress (student_id, lecture_id) VALUES
  ('stu-1001', 'sap-abap-m1-l1'),
  ('stu-1001', 'sap-abap-m1-l2'),
  ('stu-1001', 'sap-abap-m1-l3'),
  ('stu-1001', 'sap-abap-m2-l1'),
  ('stu-1001', 'sap-abap-m2-l2'),
  ('stu-1002', 'sap-abap-m1-l1'),
  ('stu-1002', 'sap-abap-m1-l2'),
  ('stu-1003', 'sap-mm-m1-l1'),
  ('stu-1003', 'sap-mm-m1-l2'),
  ('stu-1003', 'sap-mm-m1-l3'),
  ('stu-1003', 'sap-mm-m2-l1'),
  ('stu-1003', 'sap-mm-m2-l2'),
  ('stu-1003', 'sap-mm-m2-l3'),
  ('stu-1003', 'sap-mm-m3-l1'),
  ('stu-1004', 'power-platform-m1-l1'),
  ('stu-1006', 'devops-m1-l1'),
  ('stu-1006', 'devops-m1-l2'),
  ('stu-1006', 'devops-m1-l3'),
  ('stu-1006', 'devops-m2-l1'),
  ('stu-1006', 'devops-m2-l2'),
  ('stu-1006', 'devops-m2-l3'),
  ('stu-1006', 'devops-m3-l1'),
  ('stu-1006', 'devops-m3-l2'),
  ('stu-1006', 'devops-m4-l1'),
  ('stu-1007', 'sap-mm-m1-l1'),
  ('stu-1007', 'sap-mm-m1-l2'),
  ('stu-1007', 'sap-mm-m1-l3'),
  ('stu-1007', 'sap-mm-m2-l1'),
  ('stu-1007', 'sap-mm-m2-l2'),
  ('stu-1007', 'sap-mm-m2-l3'),
  ('stu-1007', 'sap-mm-m3-l1'),
  ('stu-1007', 'sap-mm-m3-l2'),
  ('stu-1007', 'sap-mm-m3-l3'),
  ('stu-1007', 'sap-mm-m3-l4'),
  ('stu-1007', 'sap-mm-m4-l1'),
  ('stu-1007', 'sap-mm-m4-l2');

INSERT INTO last_watched (student_id, lecture_id, watched_at) VALUES
  ('stu-1001', 'sap-abap-m2-l3', '2026-10-15 18:40:00'),
  ('stu-1002', 'sap-abap-m1-l3', '2026-10-14 10:00:00');

INSERT INTO student_activity (student_id, text, created_at) VALUES
  ('stu-1001', 'Completed “ALV reports”', '2026-10-15 18:20:00'),
  ('stu-1001', 'Downloaded “ABAP Reports — Notes”', '2026-10-15 17:55:00'),
  ('stu-1001', 'Completed “Classical reports”', '2026-10-14 20:10:00'),
  ('stu-1001', 'Completed “Data Dictionary basics”', '2026-10-12 19:00:00');

INSERT INTO announcements (id, title, message, course_id, pinned, posted_by, posted_on) VALUES
  ('ann-1', 'Mock interview week starts 20 October', 'Mock interviews for all batches run from 20 to 24 October. Book your slot with your trainer and keep your resume updated.', NULL, TRUE, 'Placement Team', '2026-10-15'),
  ('ann-2', 'ABAP Reports assignment due Sunday', 'Submit the ALV Report Assignment by Sunday 9 PM. Download it from Notes & Resources.', 'sap-abap', FALSE, 'Amit Deshmukh', '2026-10-14'),
  ('ann-3', 'New SQL practice dataset uploaded', 'A sales dataset for SQL window function practice is now available in Module 2 resources.', 'data-engineering', FALSE, 'Kiran Patil', '2026-10-12'),
  ('ann-4', 'Diwali break', 'Live classes pause from 8 to 11 November. Recorded lectures stay available throughout.', NULL, FALSE, '42X Academy', '2026-10-10');

INSERT INTO certificates (id, student_id, course_id, status, certificate_no, issued_on) VALUES
  ('cert-1', 'stu-1007', 'sap-mm', 'Issued', '42X-MM-2026-0142', '2026-10-09');
