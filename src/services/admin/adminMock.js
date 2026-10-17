// Mock implementations for the admin service. Mirrors what the Spring Boot API will return.
// The admin portal is course-centric: modules, lectures, resources and enrollments
// always belong to one specific course.

import { mockDb } from "../../mocks/mockDb";
import { courseProgress } from "../shared/progress";

const today = () => new Date().toISOString().slice(0, 10);

function nameMaps() {
  return {
    students: new Map(mockDb.list("students").map((item) => [item.id, item])),
    courses: new Map(mockDb.list("courses").map((item) => [item.id, item])),
    modules: new Map(mockDb.list("modules").map((item) => [item.id, item])),
    lectures: new Map(mockDb.list("lectures").map((item) => [item.id, item])),
  };
}

function requireText(value, label) {
  if (!String(value ?? "").trim()) {
    throw new Error(`${label} is required.`);
  }
}

function requireCourse(courseId) {
  const course = mockDb.find("courses", courseId);
  if (!course) {
    throw new Error("This course could not be found.");
  }
  return course;
}

function slugify(value) {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

// Enrollment rows with names and progress. Optionally only for one course.
function enrollmentRows(courseId) {
  const maps = nameMaps();
  const lectures = mockDb.list("lectures");

  return mockDb
    .list("enrollments")
    .filter((enrollment) => !courseId || enrollment.courseId === courseId)
    .map((enrollment) => ({
      ...enrollment,
      studentName: maps.students.get(enrollment.studentId)?.name ?? "Unknown student",
      studentEmail: maps.students.get(enrollment.studentId)?.email ?? "",
      studentStatus: maps.students.get(enrollment.studentId)?.status ?? "Active",
      courseTitle: maps.courses.get(enrollment.courseId)?.title ?? "Unknown course",
      progress: courseProgress(
        lectures,
        enrollment.courseId,
        mockDb.getProgress(enrollment.studentId).completedLectureIds
      ),
    }))
    .sort((a, b) => b.enrolledOn.localeCompare(a.enrolledOn));
}

function courseCounts(courseId) {
  return {
    studentCount: mockDb.list("enrollments").filter((item) => item.courseId === courseId).length,
    moduleCount: mockDb.list("modules").filter((item) => item.courseId === courseId).length,
    lectureCount: mockDb.list("lectures").filter((item) => item.courseId === courseId).length,
    resourceCount: mockDb.list("resources").filter((item) => item.courseId === courseId).length,
  };
}

// Builds a readable activity feed from dated records.
function recentActivity() {
  const maps = nameMaps();
  const items = [
    ...mockDb.list("enrollments").map((item) => ({
      id: `a-${item.id}`,
      icon: "user-plus",
      text: `${maps.students.get(item.studentId)?.name ?? "A student"} enrolled in ${maps.courses.get(item.courseId)?.title ?? "a course"}`,
      date: item.enrolledOn,
    })),
    ...mockDb.list("announcements").map((item) => ({
      id: `a-${item.id}`,
      icon: "megaphone",
      text: `Announcement posted: “${item.title}”`,
      date: item.postedOn,
    })),
    ...mockDb
      .list("certificates")
      .filter((item) => item.status === "Issued")
      .map((item) => ({
        id: `a-${item.id}`,
        icon: "award",
        text: `Certificate issued to ${maps.students.get(item.studentId)?.name ?? "a student"} for ${maps.courses.get(item.courseId)?.title ?? "a course"}`,
        date: item.issuedOn,
      })),
    ...mockDb.list("students").map((item) => ({
      id: `a-${item.id}`,
      icon: "user",
      text: `New student added: ${item.name}`,
      date: item.joinedOn,
    })),
  ];

  return items.filter((item) => item.date).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
}

export const adminMock = {
  dashboard() {
    const courses = mockDb.list("courses");

    return {
      stats: {
        totalStudents: mockDb.list("students").length,
        activeStudents: mockDb.list("students").filter((item) => item.status === "Active").length,
        totalCourses: courses.length,
        publishedCourses: courses.filter((item) => item.status === "Published").length,
        totalEnrollments: mockDb.list("enrollments").length,
      },
      recentActivity: recentActivity(),
    };
  },

  // ---------- Students (academy-wide) ----------

  students() {
    const enrollments = enrollmentRows();
    return mockDb.list("students").map((student) => {
      const own = enrollments.filter((item) => item.studentId === student.id);
      return {
        ...student,
        courseIds: own.map((item) => item.courseId),
        courseTitles: own.map((item) => item.courseTitle),
        averageProgress: own.length
          ? Math.round(own.reduce((sum, item) => sum + item.progress.percent, 0) / own.length)
          : 0,
      };
    });
  },

  studentDetails(studentId) {
    const student = mockDb.find("students", studentId);
    if (!student) {
      throw new Error("This student could not be found.");
    }
    return { student, enrollments: enrollmentRows().filter((item) => item.studentId === studentId) };
  },

  saveStudent(student) {
    requireText(student.name, "Name");
    requireText(student.email, "Email");

    const email = student.email.trim().toLowerCase();
    const duplicate = mockDb.list("students").find((item) => item.email === email && item.id !== student.id);
    if (duplicate) {
      throw new Error("Another student already uses this email.");
    }

    const data = {
      name: student.name.trim(),
      email,
      phone: student.phone?.trim() ?? "",
      batch: student.batch?.trim() ?? "",
      city: student.city?.trim() ?? "",
      status: student.status || "Active",
    };

    return student.id
      ? mockDb.update("students", student.id, data)
      : mockDb.insert("students", { ...data, joinedOn: today() }, "stu");
  },

  // ---------- Courses ----------

  courses() {
    return mockDb.list("courses").map((course) => ({ ...course, ...courseCounts(course.id) }));
  },

  course(courseId) {
    const course = requireCourse(courseId);
    return { ...course, ...courseCounts(courseId) };
  },

  saveCourse(course) {
    requireText(course.title, "Title");
    requireText(course.code, "Course code");

    const data = {
      title: course.title.trim(),
      code: course.code.trim().toUpperCase(),
      category: course.category || "SAP",
      level: course.level?.trim() || "Beginner",
      instructor: course.instructor?.trim() ?? "",
      durationWeeks: Number(course.durationWeeks) || 0,
      description: course.description?.trim() ?? "",
      status: course.status || "Draft",
    };

    if (course.id) {
      return mockDb.update("courses", course.id, data);
    }

    // New courses get a readable id from the code, e.g. "SAP-SD" -> /admin/courses/sap-sd
    const id = slugify(data.code);
    if (!id) {
      throw new Error("Course code must contain letters or numbers.");
    }
    if (mockDb.find("courses", id)) {
      throw new Error("A course with this code already exists.");
    }
    return mockDb.insert("courses", { ...data, id }, "course");
  },

  setCourseStatus(courseId, status) {
    requireCourse(courseId);
    return mockDb.update("courses", courseId, { status });
  },

  deleteCourse(courseId) {
    if (mockDb.list("enrollments").some((item) => item.courseId === courseId)) {
      throw new Error("This course has enrolled students. Remove them first or set the course to Draft.");
    }
    ["lectures", "modules", "resources", "announcements"].forEach((table) =>
      mockDb.list(table).filter((item) => item.courseId === courseId).forEach((item) => mockDb.remove(table, item.id))
    );
    mockDb.remove("courses", courseId);
  },

  // ---------- Course students ----------

  courseStudents(courseId) {
    requireCourse(courseId);
    return enrollmentRows(courseId);
  },

  // Academy students who are NOT yet enrolled in this course.
  availableStudents(courseId) {
    const enrolled = new Set(
      mockDb.list("enrollments").filter((item) => item.courseId === courseId).map((item) => item.studentId)
    );
    return mockDb
      .list("students")
      .filter((student) => !enrolled.has(student.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  // ---------- Modules (per course) ----------

  modules(courseId) {
    requireCourse(courseId);
    const lectures = mockDb.list("lectures");

    return mockDb
      .list("modules")
      .filter((module) => module.courseId === courseId)
      .map((module) => ({ ...module, lectureCount: lectures.filter((item) => item.moduleId === module.id).length }))
      .sort((a, b) => a.order - b.order);
  },

  saveModule(module) {
    requireText(module.title, "Title");
    requireCourse(module.courseId);

    const siblings = mockDb.list("modules").filter((item) => item.courseId === module.courseId);
    const data = {
      title: module.title.trim(),
      courseId: module.courseId,
      order: Number(module.order) || siblings.length + 1,
    };

    return module.id ? mockDb.update("modules", module.id, data) : mockDb.insert("modules", data, "mod");
  },

  // Swaps a module with its neighbour (direction -1 = up, +1 = down) and renumbers 1..n.
  moveModule(moduleId, direction) {
    const module = mockDb.find("modules", moduleId);
    const ordered = mockDb
      .list("modules")
      .filter((item) => item.courseId === module.courseId)
      .sort((a, b) => a.order - b.order);
    const index = ordered.findIndex((item) => item.id === moduleId);
    const target = index + direction;

    if (target < 0 || target >= ordered.length) {
      return;
    }

    [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
    ordered.forEach((item, position) => mockDb.update("modules", item.id, { order: position + 1 }));
  },

  deleteModule(moduleId) {
    const module = mockDb.find("modules", moduleId);
    mockDb.list("lectures").filter((item) => item.moduleId === moduleId).forEach((item) => mockDb.remove("lectures", item.id));
    mockDb
      .list("resources")
      .filter((item) => item.moduleId === moduleId)
      .forEach((item) => mockDb.update("resources", item.id, { moduleId: null, lectureId: null }));
    mockDb.remove("modules", moduleId);

    // Keep the remaining modules numbered 1..n
    if (module) {
      mockDb
        .list("modules")
        .filter((item) => item.courseId === module.courseId)
        .sort((a, b) => a.order - b.order)
        .forEach((item, position) => mockDb.update("modules", item.id, { order: position + 1 }));
    }
  },

  // ---------- Lectures (per course) ----------

  lectures(courseId) {
    requireCourse(courseId);
    return mockDb
      .list("lectures")
      .filter((lecture) => lecture.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  },

  saveLecture(lecture) {
    requireText(lecture.title, "Title");
    requireText(lecture.moduleId, "Module");

    const module = mockDb.find("modules", lecture.moduleId);
    if (!module || (lecture.courseId && module.courseId !== lecture.courseId)) {
      throw new Error("Choose a module from this course.");
    }

    const data = {
      title: lecture.title.trim(),
      description: lecture.description?.trim() ?? "",
      moduleId: module.id,
      courseId: module.courseId,
      order: Number(lecture.order) || mockDb.list("lectures").filter((item) => item.moduleId === module.id).length + 1,
      durationMinutes: Number(lecture.durationMinutes) || 0,
      videoUrl: lecture.videoUrl?.trim() || null,
      oneDriveItemId: lecture.oneDriveItemId?.trim() || null,
    };

    return lecture.id ? mockDb.update("lectures", lecture.id, data) : mockDb.insert("lectures", data, "lec");
  },

  deleteLecture(lectureId) {
    mockDb
      .list("resources")
      .filter((item) => item.lectureId === lectureId)
      .forEach((item) => mockDb.update("resources", item.id, { lectureId: null }));
    mockDb.remove("lectures", lectureId);
  },

  // ---------- Resources (per course) ----------

  resources(courseId) {
    requireCourse(courseId);
    const maps = nameMaps();

    return mockDb
      .list("resources")
      .filter((resource) => resource.courseId === courseId)
      .map((resource) => ({
        ...resource,
        moduleTitle: maps.modules.get(resource.moduleId)?.title ?? null,
        lectureTitle: maps.lectures.get(resource.lectureId)?.title ?? null,
      }))
      .sort((a, b) => b.updatedOn.localeCompare(a.updatedOn));
  },

  saveResource(resource) {
    requireText(resource.title, "Title");
    requireCourse(resource.courseId);

    const module = resource.moduleId ? mockDb.find("modules", resource.moduleId) : null;
    if (resource.moduleId && module?.courseId !== resource.courseId) {
      throw new Error("Choose a module from this course.");
    }
    const lecture = resource.lectureId ? mockDb.find("lectures", resource.lectureId) : null;
    if (resource.lectureId && lecture?.moduleId !== resource.moduleId) {
      throw new Error("Choose a lecture from the selected module.");
    }

    const data = {
      title: resource.title.trim(),
      description: resource.description?.trim() ?? "",
      courseId: resource.courseId,
      moduleId: module?.id ?? null,
      lectureId: lecture?.id ?? null,
      type: resource.type || "Notes",
      sizeKb: Number(resource.sizeKb) || 0,
      fileUrl: resource.fileUrl?.trim() || null,
      updatedOn: today(),
    };

    return resource.id ? mockDb.update("resources", resource.id, data) : mockDb.insert("resources", data, "res");
  },

  deleteResource(resourceId) {
    mockDb.remove("resources", resourceId);
  },

  // ---------- Enrollments (student ↔ one specific course) ----------

  enrollments() {
    return enrollmentRows();
  },

  saveEnrollment(enrollment) {
    requireText(enrollment.studentId, "Student");
    requireText(enrollment.courseId, "Course");
    requireCourse(enrollment.courseId);

    const duplicate = mockDb
      .list("enrollments")
      .find((item) => item.studentId === enrollment.studentId && item.courseId === enrollment.courseId && item.id !== enrollment.id);
    if (duplicate) {
      throw new Error("This student is already enrolled in this course.");
    }

    const data = {
      studentId: enrollment.studentId,
      courseId: enrollment.courseId,
      status: enrollment.status || "Active",
    };

    return enrollment.id
      ? mockDb.update("enrollments", enrollment.id, data)
      : mockDb.insert("enrollments", { ...data, enrolledOn: today() }, "enr");
  },

  deleteEnrollment(enrollmentId) {
    mockDb.remove("enrollments", enrollmentId);
  },

  // ---------- Announcements (academy-wide or one course) ----------

  announcements() {
    const maps = nameMaps();

    return mockDb
      .list("announcements")
      .map((item) => ({ ...item, courseTitle: maps.courses.get(item.courseId)?.title ?? null }))
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.postedOn.localeCompare(a.postedOn));
  },

  saveAnnouncement(announcement, adminName) {
    requireText(announcement.title, "Title");
    requireText(announcement.message, "Message");

    const data = {
      title: announcement.title.trim(),
      message: announcement.message.trim(),
      courseId: announcement.courseId || null,
      pinned: announcement.pinned === true || announcement.pinned === "true",
    };

    return announcement.id
      ? mockDb.update("announcements", announcement.id, data)
      : mockDb.insert("announcements", { ...data, postedBy: adminName, postedOn: today() }, "ann");
  },

  setAnnouncementPinned(announcementId, pinned) {
    return mockDb.update("announcements", announcementId, { pinned });
  },

  deleteAnnouncement(announcementId) {
    mockDb.remove("announcements", announcementId);
  },

  // ---------- Certificates (one per student per course) ----------

  certificates() {
    const certificates = mockDb.list("certificates");

    return enrollmentRows().map((enrollment) => {
      const certificate =
        certificates.find((item) => item.studentId === enrollment.studentId && item.courseId === enrollment.courseId) ?? null;
      const eligible = enrollment.progress.percent === 100;
      let status = eligible ? "Eligible" : "In progress";
      if (certificate?.status === "Issued") status = "Issued";
      if (certificate?.status === "Revoked") status = "Revoked";

      return {
        id: enrollment.id,
        studentId: enrollment.studentId,
        studentName: enrollment.studentName,
        courseId: enrollment.courseId,
        courseTitle: enrollment.courseTitle,
        progress: enrollment.progress,
        eligible,
        status,
        certificate,
      };
    });
  },

  issueCertificate(studentId, courseId) {
    const course = requireCourse(courseId);
    const lectures = mockDb.list("lectures");
    const { percent } = courseProgress(lectures, courseId, mockDb.getProgress(studentId).completedLectureIds);
    if (percent < 100) {
      throw new Error("The student has not completed this course yet.");
    }

    const existing = mockDb
      .list("certificates")
      .find((item) => item.studentId === studentId && item.courseId === courseId);
    const certificateNo = `42X-${course.code.split("-")[0]}-${new Date().getFullYear()}-${String(
      Math.floor(Math.random() * 9000) + 1000
    )}`;
    const data = { status: "Issued", certificateNo, issuedOn: today() };

    return existing
      ? mockDb.update("certificates", existing.id, data)
      : mockDb.insert("certificates", { studentId, courseId, ...data }, "cert");
  },

  // Keeps the record (status Revoked) so the history stays visible.
  revokeCertificate(certificateId) {
    return mockDb.update("certificates", certificateId, { status: "Revoked" });
  },
};
