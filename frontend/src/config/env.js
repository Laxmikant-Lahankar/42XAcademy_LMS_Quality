// Central place for environment configuration.
// Values come from Vite env variables (see .env.example), never hardcoded in components.

export const env = {
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, ""),
  useMockApi: import.meta.env.VITE_USE_MOCK_API !== "false",
};
