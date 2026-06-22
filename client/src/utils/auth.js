const TOKEN_KEY = "movie_booking_token";
const CURRENT_USER_KEY = "movie_booking_current_user";

export function setAuthSession({ token, user }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser() {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
}

export function isLoggedIn() {
  return Boolean(getToken());
}

export function logoutUser() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
}
