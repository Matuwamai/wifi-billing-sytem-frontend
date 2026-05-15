import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, logout, clearError } from "../services/auth/authSlice";

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
  const { user, token, loading, error, subscription, session } = useSelector(
    (state) => state.auth,
  );

  // Restore user on refresh - but this should be handled in your authSlice initialization
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    // Only restore if Redux doesn't have user but localStorage does
    if (storedToken && storedUser && !user && !token) {
      try {
        // Dispatch an action to restore session
        dispatch(setUser(JSON.parse(storedUser)));
        // Note: You also need to restore the token in Redux
      } catch (error) {
        console.error("Failed to restore session:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, [dispatch, user, token]);

  // Derived state
  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === "ADMIN";

  // Permissions - fixed consistency
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
        const result = await dispatch(login(credentials)).unwrap();

        // Redux state is already updated by the login action
        // Your authSlice should handle localStorage persistence

        return { success: true, data: result };
      } catch (err) {
        console.error("Login failed:", err);
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
    // Let your authSlice handle localStorage cleanup
  }, [dispatch]);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

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
