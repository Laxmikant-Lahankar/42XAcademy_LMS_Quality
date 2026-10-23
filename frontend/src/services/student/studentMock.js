// Mock implementations for the student service. Mirrors what the Spring Boot API will return.

import { mockDb } from "../../mocks/mockDb";
import { courseProgress, sortLectures } from "../shared/progress";

// Courses the student can open: active enrollments in published (not Draft) courses.
function enrolledCourseIds(studentId) {
  const published = new Set(
    mockDb.list("courses").filter((course) => course.status === "Published").map((course) => course.id)
  );

  return mockDb
    .list("enrollments")
    .filter((enrollment) => enrollment.studentId === studentId && enrollment.status !== "Cancelled")
    .map((enrollment) => enrollment.courseId)
    .filter((courseId) => published.has(courseId));
}

function assertEnrolled(studentId, courseId) {
  if (!enrolledCourseIds(studentId).includes(courseId)) {
    throw new Error("You are not enrolled in this course.");
  }
}

function courseSummary(course, lectures, modules, completedIds) {
  const courseLectures = sortLectures(
    lectures.filter((lecture) => lecture.courseId === course.id),
    modules
  );
  const nextLecture = courseLectures.find((lecture) => !completedIds.includes(lecture.id)) ?? null;

  return {
    ...course,
    progress: courseProgress(lectures, course.id, completedIds),
    moduleCount: modules.filter((module) => module.courseId === course.id).length,
    totalMinutes: courseLectures.reduce((sum, lecture) => sum + lecture.durationMinutes, 0),
    nextLectureId: nextLecture?.id ?? null,
  };
}

function myCourses(studentId) {
  const ids = enrolledCourseIds(studentId);
  const { completedLectureIds } = mockDb.getProgress(studentId);
  const lectures = mockDb.list("lectures");
  const modules = mockDb.list("modules");

  return mockDb
    .list("courses")
    .filter((course) => ids.includes(course.id))
    .map((course) => courseSummary(course, lectures, modules, completedLectureIds));
}

function announcementsFor(studentId) {
  const ids = enrolledCourseIds(studentId);
  const courses = mockDb.list("courses");

  return mockDb
    .list("announcements")
    .filter((item) => item.courseId === null || ids.includes(item.courseId))
    .map((item) => ({
      ...item,
      courseTitle: courses.find((course) => course.id === item.courseId)?.title ?? null,
    }))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.postedOn.localeCompare(a.postedOn));
}

function continueLearning(studentId) {
  const { lastWatched } = mockDb.getProgress(studentId);
  if (!lastWatched) {
    return null;
  }

  const lecture = mockDb.find("lectures", lastWatched.lectureId);
  if (!lecture || !enrolledCourseIds(studentId).includes(lecture.courseId)) {
    return null;
  }

  return {
    lecture,
    module: mockDb.find("modules", lecture.moduleId),
    course: mockDb.find("courses", lecture.courseId),
    watchedAt: lastWatched.watchedAt,
  };
}

export const studentMock = {
  dashboard(studentId) {
    const courses = myCourses(studentId);
    const progress = mockDb.getProgress(studentId);
    const totals = courses.reduce(
      (sum, course) => ({
        completed: sum.completed + course.progress.completed,
        total: sum.total + course.progress.total,
      }),
      { completed: 0, total: 0 }
    );

    return {
      courses,
      continueLearning: continueLearning(studentId),
      recentActivity: progress.activity.slice(0, 5),
      announcements: announcementsFor(studentId).slice(0, 3),
      stats: {
        enrolledCourses: courses.length,
        lecturesCompleted: totals.completed,
        overallPercent: totals.total === 0 ? 0 : Math.round((totals.completed / totals.total) * 100),
        coursesCompleted: courses.filter((course) => course.progress.percent === 100).length,
      },
    };
  },

  myCourses(studentId) {
    const courses = myCourses(studentId);
    const ids = courses.map((course) => course.id);
    const modules = mockDb.list("modules");

    // Lecture index so students can search lectures as well as courses.
    const lectureIndex = mockDb
      .list("lectures")
      .filter((lecture) => ids.includes(lecture.courseId))
      .map((lecture) => ({
        id: lecture.id,
        title: lecture.title,
        courseId: lecture.courseId,
        courseTitle: courses.find((course) => course.id === lecture.courseId)?.title,
        moduleTitle: modules.find((module) => module.id === lecture.moduleId)?.title,
      }));

    return { courses, lectureIndex };
  },

  courseDetails(studentId, courseId) {
    assertEnrolled(studentId, courseId);

    const course = mockDb.find("courses", courseId);
    const { completedLectureIds } = mockDb.getProgress(studentId);
    const allLectures = mockDb.list("lectures");
    const modules = mockDb
      .list("modules")
      .filter((module) => module.courseId === courseId)
      .sort((a, b) => a.order - b.order)
      .map((module) => ({
        ...module,
        lectures: allLectures
          .filter((lecture) => lecture.moduleId === module.id)
          .sort((a, b) => a.order - b.order)
          .map((lecture) => ({ ...lecture, completed: completedLectureIds.includes(lecture.id) })),
      }));

    const resources = mockDb.list("resources").filter((resource) => resource.courseId === courseId);
    const summary = courseSummary(course, allLectures, mockDb.list("modules"), completedLectureIds);

    return {
      course: summary,
      modules,
      resources,
      syllabus: resources.find((resource) => resource.type === "Syllabus") ?? null,
    };
  },

  lecture(studentId, courseId, lectureId) {
    assertEnrolled(studentId, courseId);

    const lecture = mockDb.find("lectures", lectureId);
    if (!lecture || lecture.courseId !== courseId) {
      throw new Error("This lecture could not be found.");
    }

    const modules = mockDb.list("modules").filter((module) => module.courseId === courseId);
    const ordered = sortLectures(
      mockDb.list("lectures").filter((item) => item.courseId === courseId),
      modules
    );
    const index = ordered.findIndex((item) => item.id === lectureId);
    const progress = mockDb.getProgress(studentId);

    // Remember this as the last watched lecture.
    mockDb.setProgress(studentId, {
      ...progress,
      lastWatched: { lectureId, watchedAt: new Date().toISOString() },
    });

    return {
      course: mockDb.find("courses", courseId),
      module: modules.find((module) => module.id === lecture.moduleId),
      lecture: { ...lecture, completed: progress.completedLectureIds.includes(lecture.id) },
      previous: ordered[index - 1] ?? null,
      next: ordered[index + 1] ?? null,
      moduleLectures: ordered
        .filter((item) => item.moduleId === lecture.moduleId)
        .map((item) => ({ ...item, completed: progress.completedLectureIds.includes(item.id) })),
      resources: mockDb
        .list("resources")
        .filter((resource) => resource.moduleId === lecture.moduleId),
      position: { current: index + 1, total: ordered.length },
    };
  },

  setLectureComplete(studentId, lectureId, completed) {
    const progress = mockDb.getProgress(studentId);
    const lecture = mockDb.find("lectures", lectureId);
    const ids = new Set(progress.completedLectureIds);

    if (completed) {
      ids.add(lectureId);
    } else {
      ids.delete(lectureId);
    }

    const activity = completed && lecture
      ? [{ id: `act-${Date.now()}`, text: `Completed “${lecture.title}”`, at: new Date().toISOString() }, ...progress.activity]
      : progress.activity;

    mockDb.setProgress(studentId, {
      ...progress,
      completedLectureIds: [...ids],
      activity: activity.slice(0, 20),
    });

    return { lectureId, completed };
  },

  resources(studentId) {
    const ids = enrolledCourseIds(studentId);
    const courses = mockDb.list("courses");
    const modules = mockDb.list("modules");

    return mockDb
      .list("resources")
      .filter((resource) => ids.includes(resource.courseId))
      .map((resource) => ({
        ...resource,
        courseTitle: courses.find((course) => course.id === resource.courseId)?.title,
        moduleTitle: modules.find((module) => module.id === resource.moduleId)?.title ?? null,
      }));
  },

  progress(studentId) {
    const { completedLectureIds, lastWatched } = mockDb.getProgress(studentId);
    const lectures = mockDb.list("lectures");
    const modules = mockDb.list("modules");
    const certificates = mockDb.list("certificates").filter((item) => item.studentId === studentId);

    const courses = myCourses(studentId).map((course) => ({
      ...course,
      modules: modules
        .filter((module) => module.courseId === course.id)
        .sort((a, b) => a.order - b.order)
        .map((module) => {
          const moduleLectures = lectures.filter((lecture) => lecture.moduleId === module.id);
          const done = moduleLectures.filter((lecture) => completedLectureIds.includes(lecture.id)).length;
          return { id: module.id, title: module.title, completed: done, total: moduleLectures.length };
        }),
      certificate: certificates.find((item) => item.courseId === course.id) ?? null,
    }));

    const lastLecture = lastWatched ? mockDb.find("lectures", lastWatched.lectureId) : null;

    return {
      courses,
      lastWatched: lastLecture
        ? { lecture: lastLecture, course: mockDb.find("courses", lastLecture.courseId), watchedAt: lastWatched.watchedAt }
        : null,
    };
  },

  announcements(studentId) {
    return announcementsFor(studentId);
  },

  profile(studentId) {
    const student = mockDb.find("students", studentId);
    if (!student) {
      throw new Error("Student profile not found.");
    }
    return { student, courses: myCourses(studentId) };
  },

  updateProfile(studentId, changes) {
    const allowed = { phone: changes.phone, city: changes.city };
    return mockDb.update("students", studentId, allowed);
  },
};
