export const ADMIN_SESSION_COOKIE = "swikrit_admin_session";

const DEFAULT_ADMIN_EMAIL = "swikritpokhrel01@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "Swiiaiskn112@";
const DEFAULT_ADMIN_SESSION_TOKEN = "swikrit-admin-session-v1";

export function getAdminEmail() {
  return (process.env.ADMIN_LOGIN_EMAIL ?? DEFAULT_ADMIN_EMAIL).trim().toLowerCase();
}

export function getAdminPassword() {
  return process.env.ADMIN_LOGIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;
}

export function getAdminSessionToken() {
  return process.env.ADMIN_SESSION_TOKEN ?? DEFAULT_ADMIN_SESSION_TOKEN;
}

export function matchesAdminCredentials(email: string, password: string) {
  return email.trim().toLowerCase() === getAdminEmail() && password === getAdminPassword();
}

export function isValidAdminSessionToken(token: string | null | undefined) {
  return Boolean(token) && token === getAdminSessionToken();
}
