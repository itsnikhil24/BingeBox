export function getCurrentUser() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;

    const user = JSON.parse(raw);
    // adjust this check to whatever makes a "valid" user in your app
    if (!user || !user.id) return null;

    return user;
  } catch {
    return null;
  }
}