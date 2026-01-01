// Supabase JWT Authentication utilities

const TOKEN_KEY = "hector_access_token";
const REFRESH_TOKEN_KEY = "hector_refresh_token";

export function isUnauthorizedError(error: Error): boolean {
  return /^401/.test(error.message);
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
