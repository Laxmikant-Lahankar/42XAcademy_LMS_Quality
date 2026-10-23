package com.academy42x.lms.security;

import com.academy42x.lms.entity.User;
import com.academy42x.lms.exception.ApiException;
import org.springframework.security.oauth2.jwt.Jwt;

/** Small checks on the logged-in user taken from the JWT. */
public final class AccessGuard {

    private AccessGuard() {
    }

    public static boolean isAdmin(Jwt jwt) {
        return User.ROLE_ADMIN.equals(jwt.getClaimAsString("role"));
    }

    /** A student may only open their own data; admins may open anyone's. */
    public static void requireSelfOrAdmin(Jwt jwt, String studentId) {
        if (!isAdmin(jwt) && !jwt.getSubject().equals(studentId)) {
            throw ApiException.forbidden("You can only open your own student data.");
        }
    }

    public static String displayName(Jwt jwt) {
        String name = jwt.getClaimAsString("name");
        return name == null || name.isBlank() ? "42X Academy" : name;
    }
}
