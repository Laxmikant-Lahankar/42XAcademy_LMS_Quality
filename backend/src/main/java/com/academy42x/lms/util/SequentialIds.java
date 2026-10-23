package com.academy42x.lms.util;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Readable, sequential ids: the next number after the highest one already used.
 *
 *   stu-1009, enr-12, res-14, ann-6, cert-3       (academy-wide)
 *   sap-abap-m5                                   (next module of a course)
 *   sap-abap-m2-l4                                (next lecture of a module)
 *
 * Runs inside the caller's transaction. Two admins saving at the very same moment could pick
 * the same number; the primary key then rejects the second save and the admin simply saves again.
 */
@Component
public class SequentialIds {

    private final JdbcTemplate jdbc;

    public SequentialIds(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public String student() {
        return next("users", "stu-", 1001);
    }

    public String enrollment() {
        return next("enrollments", "enr-", 1);
    }

    public String resource() {
        return next("resources", "res-", 1);
    }

    public String announcement() {
        return next("announcements", "ann-", 1);
    }

    public String certificate() {
        return next("certificates", "cert-", 1);
    }

    public String module(String courseId) {
        return next("course_modules", courseId + "-m", 1);
    }

    public String lecture(String moduleId) {
        return next("lectures", moduleId + "-l", 1);
    }

    /** table is always one of the constants above (never user input); prefix is a slug-safe id. */
    private String next(String table, String prefix, long first) {
        int start = prefix.length() + 1;
        Long highest = jdbc.queryForObject(
                "SELECT MAX(TRY_CAST(SUBSTRING(id, ?, 100) AS BIGINT)) FROM " + table
                        + " WHERE id LIKE ? AND LEN(id) >= ? AND SUBSTRING(id, ?, 100) NOT LIKE '%[^0-9]%'",
                Long.class, start, prefix + "%", start, start);
        long number = highest == null ? first : Math.max(highest + 1, first);
        return prefix + number;
    }
}
