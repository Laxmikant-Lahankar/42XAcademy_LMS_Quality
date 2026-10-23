package com.academy42x.lms.util;

import com.academy42x.lms.exception.ApiException;

/** Small helpers to clean request values. Numbers may arrive as JSON numbers or strings from forms. */
public final class Inputs {

    private Inputs() {
    }

    public static String requireText(String value, String label) {
        if (value == null || value.isBlank()) {
            throw ApiException.badRequest(label + " is required.");
        }
        return value.trim();
    }

    public static String text(String value) {
        return value == null ? "" : value.trim();
    }

    public static String nullIfBlank(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    public static int toInt(Object value, int fallback) {
        if (value instanceof Number number) {
            return Math.max(0, number.intValue());
        }
        if (value instanceof String string && !string.isBlank()) {
            try {
                return Math.max(0, (int) Double.parseDouble(string.trim()));
            } catch (NumberFormatException ignored) {
                throw ApiException.badRequest("“" + string + "” is not a valid number.");
            }
        }
        return fallback;
    }

    public static boolean toBoolean(Object value) {
        if (value instanceof Boolean bool) {
            return bool;
        }
        return value instanceof String string && Boolean.parseBoolean(string.trim());
    }

    public static String oneOf(String value, String fallback, String... allowed) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        for (String option : allowed) {
            if (option.equals(value.trim())) {
                return option;
            }
        }
        throw ApiException.badRequest("“" + value + "” is not a valid value. Use one of: " + String.join(", ", allowed) + ".");
    }
}
