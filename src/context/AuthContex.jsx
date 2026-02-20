import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useState,
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
  const { user, token, loading, error, subscription, session } = useSelector(
    (state) => state.auth,
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
  const isAuthenticated = token === null ? false : true;
  const isAdmin = user?.role === "ADMIN";

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
    [user],
  );

  /* Actions */
  const handleLogin = useCallback(
    async (credentials) => {
      try {
        console.log("AuthContext: Starting login...", {
          ...credentials,
          password: "***",
        });

        // Dispatch login action and wait for result
        const result = await dispatch(login(credentials)).unwrap();

        console.log("AuthContext: Login result:", {
          success: !!result?.token,
          hasUser: !!result?.user,
          result,
        });

        if (result?.token && result?.user) {
          console.log("AuthContext: Saving token and user to localStorage");
          localStorage.setItem("token", result.token);
          localStorage.setItem("user", JSON.stringify(result.user));

          // IMPORTANT: Also update Redux state directly
          dispatch(setUser(result.user));

          console.log("AuthContext: Login successful");
          if (result.success) {
            // Add a small delay to ensure state updates

            setTimeout(() => {
              console.log("Redirecting after login...");
            }, 1000);
          }

          return { success: true };
          // In handleSubmit, after successful login:
        } else {
          console.log("AuthContext: Login failed - missing token or user");
          return {
            success: false,
            error: result?.message || "Invalid response from server",
          };
        }
      } catch (err) {
        console.error("AuthContext: Login failed with error:", err);
        return {
          success: false,
          error: err.message || "Login failed",
        };
      }
    },
    [dispatch],
  );

  const handleLogout = useCallback(() => {
    console.log("AuthContext: Logging out...");
    dispatch(logout());
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, [dispatch]);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  /* Debug logging */
  useEffect(() => {
    console.log("AuthContext State Update:", {
      user,
      loading,
      error,
      isAuthenticated,
      isAdmin,
      hasToken: !!localStorage.getItem("token"),
    });
  }, [user, loading, error, isAuthenticated, isAdmin]);

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
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
