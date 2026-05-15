// context/AuthContex.js - UPDATED
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
  const {
    user,
    token,
    loading,
    error,
    subscription,
    session,
    isAuthenticated: reduxIsAuthenticated, // ✅ Use this instead
  } = useSelector((state) => state.auth);

  // Restore user on refresh - simplified since slice handles it
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedToken && storedUser && !user && !token) {
      try {
        dispatch(setUser(JSON.parse(storedUser)));
      } catch (error) {
        console.error("Failed to restore session:", error);
      }
    }
  }, [dispatch, user, token]);

  // Derived state - use Redux's isAuthenticated
  const isAuthenticated = reduxIsAuthenticated; // ✅ Use Redux state
  const isAdmin = user?.role === "ADMIN";

  // Permissions
  const hasPermission = useCallback(
    (requiredRole = "USER") => {
      if (!user) return false;

      const roleLevels = {
        USER: 0,
        MODERATOR: 1,
        ADMIN: 2,
      };

      const userRoleLevel = roleLevels[user.role] ?? -1;
      const requiredRoleLevel = roleLevels[requiredRole] ?? -1;

      return userRoleLevel >= requiredRoleLevel;
    },
    [user],
  );

  // Actions
  const handleLogin = useCallback(
    async (credentials) => {
      try {
        console.log("🔐 Attempting login...");
        const result = await dispatch(login(credentials)).unwrap();

        console.log("✅ Login result:", result);

        if (result?.token && result?.user) {
          return { success: true, data: result };
        } else {
          return {
            success: false,
            error: result?.message || "Invalid response from server",
          };
        }
      } catch (err) {
        console.error("❌ Login failed:", err);
        return {
          success: false,
          error: err.message || "Login failed",
        };
      }
    },
    [dispatch],
  );

  const handleLogout = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Debug logging
  useEffect(() => {
    console.log("🔄 AuthContext State:", {
      user: user?.phone || user?.username,
      isAuthenticated,
      isAdmin,
      loading,
      hasToken: !!token,
      error,
    });
  }, [user, isAuthenticated, isAdmin, loading, token, error]);

  // Memoized context value
  const value = useMemo(
    () => ({
      user,
      token,
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
      token,
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
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
