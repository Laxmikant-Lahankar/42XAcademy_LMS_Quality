-- =====================================================================
-- Fix for V4: MySQL added the numbers as DECIMAL, so renumbered ids came out as
-- e.g. 'stu-1009.000000000000000000000000000000' instead of 'stu-1009'.
-- This trims the '.000…' part everywhere the id is used. Ids without a dot are untouched.
-- (V4 stays unchanged because Flyway must not edit migrations that already ran.)
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Students and every table that points to a student
UPDATE enrollments      SET student_id = SUBSTRING_INDEX(student_id, '.', 1) WHERE student_id LIKE 'stu-%.%';
UPDATE lecture_progress SET student_id = SUBSTRING_INDEX(student_id, '.', 1) WHERE student_id LIKE 'stu-%.%';
UPDATE last_watched     SET student_id = SUBSTRING_INDEX(student_id, '.', 1) WHERE student_id LIKE 'stu-%.%';
UPDATE student_activity SET student_id = SUBSTRING_INDEX(student_id, '.', 1) WHERE student_id LIKE 'stu-%.%';
UPDATE certificates     SET student_id = SUBSTRING_INDEX(student_id, '.', 1) WHERE student_id LIKE 'stu-%.%';
UPDATE users            SET id         = SUBSTRING_INDEX(id, '.', 1)         WHERE id LIKE 'stu-%.%';

-- Other renumbered records
UPDATE enrollments   SET id = SUBSTRING_INDEX(id, '.', 1) WHERE id LIKE 'enr-%.%';
UPDATE resources     SET id = SUBSTRING_INDEX(id, '.', 1) WHERE id LIKE 'res-%.%';
UPDATE announcements SET id = SUBSTRING_INDEX(id, '.', 1) WHERE id LIKE 'ann-%.%';
UPDATE certificates  SET id = SUBSTRING_INDEX(id, '.', 1) WHERE id LIKE 'cert-%.%';

SET FOREIGN_KEY_CHECKS = 1;
