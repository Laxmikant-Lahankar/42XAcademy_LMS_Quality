// In-browser mock database used while there is no backend.
// Changes made in the Admin panel are kept in localStorage so the Student panel sees them too.
// Replace with real API calls by setting VITE_USE_MOCK_API=false (see services/).

import { catalogueSeed } from "./courses";
import { studentsSeed, adminsSeed } from "./people";
import {
  enrollmentsSeed,
  progressSeed,
  resourcesSeed,
  announcementsSeed,
  certificatesSeed,
} from "./learning";

const STORAGE_KEY = "42x-lms-mock-db-v3";

function createSeed() {
  return {
    courses: catalogueSeed.courses,
    modules: catalogueSeed.modules,
    lectures: catalogueSeed.lectures,
    students: studentsSeed,
    admins: adminsSeed,
    enrollments: enrollmentsSeed,
    progress: progressSeed,
    resources: resourcesSeed,
    announcements: announcementsSeed,
    certificates: certificatesSeed,
  };
}

function load() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Storage unavailable (private mode, blocked site data): fall back to seed data.
  }
  return structuredClone(createSeed());
}

let db = load();

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Ignore: data simply won't persist across reloads.
  }
}

function newId(prefix) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export const mockDb = {
  list(table) {
    return structuredClone(db[table]);
  },

  find(table, id) {
    const row = db[table].find((item) => item.id === id);
    return row ? structuredClone(row) : null;
  },

  // Uses data.id when given (e.g. a readable course id), otherwise generates one.
  insert(table, data, idPrefix) {
    const row = { ...data, id: data.id || newId(idPrefix) };
    db[table] = [...db[table], row];
    save();
    return structuredClone(row);
  },

  update(table, id, patch) {
    db[table] = db[table].map((item) => (item.id === id ? { ...item, ...patch } : item));
    save();
    return this.find(table, id);
  },

  remove(table, id) {
    db[table] = db[table].filter((item) => item.id !== id);
    save();
  },

  getProgress(studentId) {
    const progress = db.progress[studentId] ?? { completedLectureIds: [], lastWatched: null, activity: [] };
    return structuredClone(progress);
  },

  setProgress(studentId, progress) {
    db.progress = { ...db.progress, [studentId]: progress };
    save();
  },

  reset() {
    db = structuredClone(createSeed());
    save();
  },
};
