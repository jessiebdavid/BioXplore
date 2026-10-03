/* ============================================================
 * MULTIDIMENSIONAL KNOWLEDGE SYSTEM
 * Client Authentication Module (Frontend Demo Mode)
 *
 * Lightweight, zero-dependency session state and route protection.
 * ============================================================ */

(function () {
  const STORAGE_KEY = "mks_auth_session";

  function getSession() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  function isAuthenticated() {
    const session = getSession();
    return !!(session && session.email);
  }

  function login(email, password) {
    const trimmedEmail = (email || "").trim();
    const trimmedPass = (password || "").trim();

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      return { success: false, error: "Please enter a valid academic or research email address." };
    }
    if (!trimmedPass || trimmedPass.length < 6) {
      return { success: false, error: "Password must be at least 6 characters in length." };
    }

    const session = {
      email: trimmedEmail,
      role: "Research Scholar",
      timestamp: Date.now(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch (e) {
      console.warn("Could not save session to localStorage:", e);
    }

    return { success: true, session };
  }

  function logout() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn("Could not clear session:", e);
    }
    window.location.hash = "#/login";
  }

  window.MKS_AUTH = {
    getSession,
    isAuthenticated,
    login,
    logout,
  };
})();
