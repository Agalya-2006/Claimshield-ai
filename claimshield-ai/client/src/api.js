const BASE = "/api";

async function request(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Unable to load claim data. Please try again.");
  }
  return res.json();
}

export const api = {
  health: () => request("/health"),
  claims: () => request("/claims"),
  claim: (id) => request(`/claims/${id}`),
  policies: () => request("/policies"),
  auditLogs: () => request("/audit-logs"),
  analytics: () => request("/analytics/summary"),
};
