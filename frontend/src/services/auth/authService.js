// Authentication service.
// Mock mode: checks the email against mock students/admins and accepts any non-empty password.
// Real mode: Spring Security endpoints (JWT) — see the api.* calls.

import { api, withMock } from "../apiClient";
import { mockDb } from "../../mocks/mockDb";

export const ROLES = {
  STUDENT: "STUDENT",
  ADMIN: "ADMIN",
};

function mockLogin({ email, password, role }) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    throw new Error("Enter your email and password.");
  }

  const table = role === ROLES.ADMIN ? "admins" : "students";
  const user = mockDb.list(table).find((item) => item.email.toLowerCase() === normalizedEmail);

  if (!user) {
    throw new Error("No account found with this email for the selected role.");
  }

  if (user.status === "Inactive") {
    throw new Error("This account is deactivated. Please contact 42X Academy support.");
  }

  return {
    user: { id: user.id, name: user.name, email: user.email, role },
    token: null,
  };
}

function mockTable(user) {
  return user.role === ROLES.ADMIN ? "admins" : "students";
}

function mockProfile(user) {
  const row = mockDb.find(mockTable(user), user.id);
  if (!row) {
    throw new Error("Please sign in again.");
  }
  return { id: row.id, name: row.name, email: row.email, role: user.role, phone: row.phone ?? "", city: row.city ?? "", createdAt: row.createdAt ?? null };
}

function mockUpdateProfile(user, changes) {
  const name = (changes.name ?? "").trim();
  const email = (changes.email ?? "").trim().toLowerCase();
  if (!name) throw new Error("Full name is required.");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Enter a valid email address.");

  const taken = ["admins", "students"].some((table) =>
    mockDb.list(table).some((item) => item.email.toLowerCase() === email && item.id !== user.id)
  );
  if (taken) throw new Error("Another account already uses this email.");

  mockDb.update(mockTable(user), user.id, { name, email, phone: (changes.phone ?? "").trim(), city: (changes.city ?? "").trim() });
  const profile = mockProfile(user);
  return { profile, user: { id: profile.id, name: profile.name, email: profile.email, role: user.role }, token: null };
}

export const authService = {
  // Returns { user: { id, name, email, role }, token }
  login: (credentials) =>
    withMock(
      () => mockLogin(credentials),
      () => api.post("/auth/login", credentials)
    ),

  logout: () =>
    withMock(
      () => null,
      () => api.post("/auth/logout")
    ),

  // The signed-in user's own profile: { id, name, email, role, phone, city, createdAt }
  getMyProfile: (user) =>
    withMock(
      () => mockProfile(user),
      () => api.get("/auth/me")
    ),

  // Update own name / email (login username) / phone / city.
  // Returns { profile, user, token } — the new session replaces the old one.
  updateMyProfile: (user, changes) =>
    withMock(
      () => mockUpdateProfile(user, changes),
      () => api.put("/auth/me", changes)
    ),

  // The logged-in user changes their own password (used by the Admin panel).
  // Mock mode cannot change passwords; the backend validates and stores them securely.
  changePassword: ({ currentPassword, newPassword }) =>
    withMock(
      () => ({ changed: false }),
      () => api.post("/auth/change-password", { currentPassword, newPassword })
    ),

  requestPasswordReset: (email) =>
    withMock(
      () => ({ email }),
      () => api.post("/auth/forgot-password", { email })
    ),
};
