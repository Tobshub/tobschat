const TOKEN = "tobs-chat-app-token";

/** set token */
export function setToken(token: string) {
  localStorage.setItem(TOKEN, JSON.stringify(token));
}

/**  get token */
export function getToken(): string | undefined {
  const token = localStorage.getItem(TOKEN);
  return token ? JSON.parse(token) : undefined;
}

/** remove token */
export function removeToken() {
  localStorage.removeItem(TOKEN);
}

