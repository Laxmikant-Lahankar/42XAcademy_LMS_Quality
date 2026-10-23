package com.academy42x.lms.util;

import java.util.Locale;

/** Course ids from course codes. (Other records get sequential ids — see SequentialIds.) */
public final class Ids {

    private Ids() {
    }

    /** "SAP-SD" → "sap-sd"; used as the course id in URLs. */
    public static String slugify(String value) {
        return value.trim().toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
    }
}
