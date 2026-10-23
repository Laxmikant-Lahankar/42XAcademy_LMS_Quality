// Progress helpers shared by the student and admin services (mock mode).

export function courseProgress(lectures, courseId, completedLectureIds) {
  const courseLectures = lectures.filter((lecture) => lecture.courseId === courseId);
  const completed = courseLectures.filter((lecture) => completedLectureIds.includes(lecture.id)).length;
  const total = courseLectures.length;

  return {
    completed,
    total,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

// Sort helper: lectures in course order (module order, then lecture order).
export function sortLectures(lectures, modules) {
  const moduleOrder = new Map(modules.map((module) => [module.id, module.order]));

  return [...lectures].sort(
    (a, b) => (moduleOrder.get(a.moduleId) ?? 0) - (moduleOrder.get(b.moduleId) ?? 0) || a.order - b.order
  );
}
