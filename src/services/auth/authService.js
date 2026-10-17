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

  requestPasswordReset: (email) =>
    withMock(
      () => ({ email }),
      () => api.post("/auth/forgot-password", { email })
    ),
};
