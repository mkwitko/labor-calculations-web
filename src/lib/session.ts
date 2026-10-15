export function getSessionId(): string {
  const existing = sessionStorage.getItem("x-session-id");
  if (existing) return existing;
  const id = crypto.randomUUID();
  sessionStorage.setItem("x-session-id", id);
  return id;
}
