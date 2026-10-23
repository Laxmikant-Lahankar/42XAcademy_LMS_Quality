package com.academy42x.lms.service;

import com.academy42x.lms.dto.ProgressDto;
import com.academy42x.lms.entity.CourseModule;
import com.academy42x.lms.entity.Lecture;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/** Shared progress and ordering helpers for the student and admin services. */
public final class ProgressCalculator {

    private ProgressCalculator() {
    }

    public static ProgressDto progress(Collection<Lecture> courseLectures, Set<String> completedLectureIds) {
        int completed = (int) courseLectures.stream().filter(l -> completedLectureIds.contains(l.getId())).count();
        return ProgressDto.of(completed, courseLectures.size());
    }

    /** Lectures in course order: by module order, then by lecture order. */
    public static List<Lecture> inCourseOrder(Collection<Lecture> lectures, Collection<CourseModule> modules) {
        Map<String, Integer> moduleOrder = modules.stream()
                .collect(Collectors.toMap(CourseModule::getId, CourseModule::getSortOrder));
        return lectures.stream()
                .sorted(Comparator.comparing((Lecture l) -> moduleOrder.getOrDefault(l.getModuleId(), 0))
                        .thenComparing(Lecture::getSortOrder))
                .toList();
    }

    public static <T> Map<String, List<T>> groupBy(Collection<T> items, Function<T, String> key) {
        return items.stream().collect(Collectors.groupingBy(key));
    }
}
