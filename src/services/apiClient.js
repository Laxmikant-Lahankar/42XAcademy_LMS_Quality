// Thin fetch wrapper for the future Spring Boot REST API.
// The base URL comes from VITE_API_BASE_URL; nothing is hardcoded here.

import { env } from "../config/env";
import { sessionStore } from "./auth/sessionStore";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request(path, { method = "GET", body } = {}) {
  if (!env.apiBaseUrl) {
    throw new ApiError("API base URL is not configured. Set VITE_API_BASE_URL.", 0);
  }

  const headers = { Accept: "application/json" };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  // Ready for Spring Security / JWT: the token is attached when the backend provides one.
  const token = sessionStore.get()?.token;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      message = data.message || message;
    } catch {
      // Response had no JSON body.
    }
    throw new ApiError(message, response.status);
  }

  return response.status === 204 ? null : response.json();
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  delete: (path) => request(path, { method: "DELETE" }),
};

// Runs the mock implementation while VITE_USE_MOCK_API is true, otherwise the real API call.
// The short delay makes loading states visible during development.
export function withMock(mockFn, apiFn) {
  if (!env.useMockApi) {
    return apiFn();
  }

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(mockFn());
      } catch (error) {
        reject(error);
      }
    }, 150);
  });
}
