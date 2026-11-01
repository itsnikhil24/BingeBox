import API_BASE_URL from "../config/api";

const API_URL = `${API_BASE_URL}/api/auth`;

// Session tokens live in httpOnly cookies set by the backend, so every call
// must send credentials; JS never sees or stores the tokens itself.
const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  return { ...data, status: response.status };
};

export const registerUser = (userData) =>
  request("/signup", {
    method: "POST",
    body: JSON.stringify(userData),
  });

export const loginUser = (userData) =>
  request("/login", {
    method: "POST",
    body: JSON.stringify(userData),
  });

export const refreshSession = () =>
  request("/refresh", { method: "POST" });

export const logoutUser = () =>
  request("/logout", { method: "POST" });


export const fetchCurrentUser = async () => {
  let data = await request("/me");

  if (data.status === 401) {
    const refreshed = await refreshSession();

    if (!refreshed.success) return null;

    data = await request("/me");
  }

  return data.success ? data.user : null;
};
