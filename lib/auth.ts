export const saveAuth = (token: string, role: string) => {
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
};

export const getRole = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("role");
};

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "/login";
};