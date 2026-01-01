import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, logout, clearError, setUser } from "../services/auth/authSlice";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { user, loading, error, subscription, session } = useSelector(
    (state) => state.auth
  );

  /* Restore user on refresh */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token && !user) {
      try {
        dispatch(setUser(JSON.parse(storedUser)));
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, [dispatch, user]);

  /* Reactive auth state */
  const isAuthenticated = !!user && !!localStorage.getItem("token");
  const isAdmin = user?.UserRole === "ADMIN";

  /* Permissions */
  const hasPermission = useCallback(
    (requiredRole = "USER") => {
      if (!user) return false;

      const roles = {
        USER: 0,
        MODERATOR: 1,
        ADMIN: 2,
      };

      return roles[user.UserRole] >= roles[requiredRole];
    },
    [user]
  );

  /* Actions */
  const handleLogin = useCallback(
    async (credentials) => {
      try {
        const result = await dispatch(login(credentials)).unwrap();

        if (result?.token) {
          localStorage.setItem("token", result.token);
          localStorage.setItem("user", JSON.stringify(result.user));
          return { success: true };
        } else {
          return { success: false };
        }
      } catch (err) {
        console.error("Login failed:", err);
        return { success: false, error: err.message || "Login failed" };
      }
    },
    [dispatch]
  );

  const handleLogout = useCallback(() => {
    dispatch(logout());
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, [dispatch]);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  /* Memoized context value */
  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      subscription,
      session,
      isAuthenticated,
      isAdmin,
      hasPermission,
      login: handleLogin,
      logout: handleLogout,
      clearError: handleClearError,
    }),
    [
      user,
      loading,
      error,
      subscription,
      session,
      isAuthenticated,
      isAdmin,
      hasPermission,
      handleLogin,
      handleLogout,
      handleClearError,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
