-- =====================================================================
-- Readable, sequential ids.
-- Records created before this change got random ids (e.g. stu-mvf4tghv36lg).
-- This renumbers them to the next free number (e.g. stu-1009) and updates every
-- table that points to them. Records that already have readable ids are untouched.
-- New records get sequential ids from the backend (SequentialIds).
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ---------- Students: stu-1009, stu-1010 … (in the order they were added) ----------
SET @base := (SELECT COALESCE(MAX(CAST(SUBSTRING(id, 5) AS UNSIGNED)), 1000)
              FROM users WHERE id REGEXP '^stu-[0-9]+$');

CREATE TEMPORARY TABLE map_students AS
SELECT id AS old_id, CONCAT('stu-', @base + ROW_NUMBER() OVER (ORDER BY created_at, id)) AS new_id
FROM users
WHERE role = 'STUDENT' AND id NOT REGEXP '^stu-[0-9]+$';

UPDATE enrollments e      JOIN map_students m ON e.student_id = m.old_id SET e.student_id = m.new_id;
UPDATE lecture_progress p JOIN map_students m ON p.student_id = m.old_id SET p.student_id = m.new_id;
UPDATE last_watched w     JOIN map_students m ON w.student_id = m.old_id SET w.student_id = m.new_id;
UPDATE student_activity a JOIN map_students m ON a.student_id = m.old_id SET a.student_id = m.new_id;
UPDATE certificates c     JOIN map_students m ON c.student_id = m.old_id SET c.student_id = m.new_id;
UPDATE users u            JOIN map_students m ON u.id = m.old_id         SET u.id = m.new_id;

DROP TEMPORARY TABLE map_students;

-- ---------- Enrollments: enr-N ----------
SET @base := (SELECT COALESCE(MAX(CAST(SUBSTRING(id, 5) AS UNSIGNED)), 0)
              FROM enrollments WHERE id REGEXP '^enr-[0-9]+$');

CREATE TEMPORARY TABLE map_enrollments AS
SELECT id AS old_id, CONCAT('enr-', @base + ROW_NUMBER() OVER (ORDER BY enrolled_on, id)) AS new_id
FROM enrollments WHERE id NOT REGEXP '^enr-[0-9]+$';

UPDATE enrollments e JOIN map_enrollments m ON e.id = m.old_id SET e.id = m.new_id;
DROP TEMPORARY TABLE map_enrollments;

-- ---------- Resources: res-N ----------
SET @base := (SELECT COALESCE(MAX(CAST(SUBSTRING(id, 5) AS UNSIGNED)), 0)
              FROM resources WHERE id REGEXP '^res-[0-9]+$');

CREATE TEMPORARY TABLE map_resources AS
SELECT id AS old_id, CONCAT('res-', @base + ROW_NUMBER() OVER (ORDER BY updated_on, id)) AS new_id
FROM resources WHERE id NOT REGEXP '^res-[0-9]+$';

UPDATE resources r JOIN map_resources m ON r.id = m.old_id SET r.id = m.new_id;
DROP TEMPORARY TABLE map_resources;

-- ---------- Announcements: ann-N ----------
SET @base := (SELECT COALESCE(MAX(CAST(SUBSTRING(id, 5) AS UNSIGNED)), 0)
              FROM announcements WHERE id REGEXP '^ann-[0-9]+$');

CREATE TEMPORARY TABLE map_announcements AS
SELECT id AS old_id, CONCAT('ann-', @base + ROW_NUMBER() OVER (ORDER BY posted_on, id)) AS new_id
FROM announcements WHERE id NOT REGEXP '^ann-[0-9]+$';

UPDATE announcements a JOIN map_announcements m ON a.id = m.old_id SET a.id = m.new_id;
DROP TEMPORARY TABLE map_announcements;

-- ---------- Certificates: cert-N ----------
SET @base := (SELECT COALESCE(MAX(CAST(SUBSTRING(id, 6) AS UNSIGNED)), 0)
              FROM certificates WHERE id REGEXP '^cert-[0-9]+$');

CREATE TEMPORARY TABLE map_certificates AS
SELECT id AS old_id, CONCAT('cert-', @base + ROW_NUMBER() OVER (ORDER BY issued_on, id)) AS new_id
FROM certificates WHERE id NOT REGEXP '^cert-[0-9]+$';

UPDATE certificates c JOIN map_certificates m ON c.id = m.old_id SET c.id = m.new_id;
DROP TEMPORARY TABLE map_certificates;

SET FOREIGN_KEY_CHECKS = 1;
