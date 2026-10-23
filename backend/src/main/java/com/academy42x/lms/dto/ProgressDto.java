package com.academy42x.lms.dto;

/** Lecture completion for one course: { completed, total, percent }. */
public record ProgressDto(int completed, int total, int percent) {

    public static ProgressDto of(int completed, int total) {
        return new ProgressDto(completed, total, total == 0 ? 0 : Math.round(completed * 100f / total));
    }
}
