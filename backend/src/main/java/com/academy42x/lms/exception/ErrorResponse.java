package com.academy42x.lms.exception;

/** Error body returned by every failing request: { "message": "…" } (read by the frontend apiClient). */
public record ErrorResponse(String message) {
}
