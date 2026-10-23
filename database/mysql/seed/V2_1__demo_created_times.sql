-- Demo data only: give the seeded students realistic "added at" times
-- (otherwise they all show the moment the database was created).
UPDATE users SET created_at = TIMESTAMP(joined_on, '10:30:00') WHERE id = 'stu-1001';
UPDATE users SET created_at = TIMESTAMP(joined_on, '11:05:00') WHERE id = 'stu-1002';
UPDATE users SET created_at = TIMESTAMP(joined_on, '09:40:00') WHERE id = 'stu-1003';
UPDATE users SET created_at = TIMESTAMP(joined_on, '15:20:00') WHERE id = 'stu-1004';
UPDATE users SET created_at = TIMESTAMP(joined_on, '12:10:00') WHERE id = 'stu-1005';
UPDATE users SET created_at = TIMESTAMP(joined_on, '10:00:00') WHERE id = 'stu-1006';
UPDATE users SET created_at = TIMESTAMP(joined_on, '16:45:00') WHERE id = 'stu-1007';
UPDATE users SET created_at = TIMESTAMP(joined_on, '14:30:00') WHERE id = 'stu-1008';
UPDATE users SET created_at = TIMESTAMP(joined_on, '09:00:00') WHERE id = 'adm-01';
