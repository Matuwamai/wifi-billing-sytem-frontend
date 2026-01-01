import React, { createContext, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login, logout, clearError, setUser } from "../services/auth/authSlice";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error, loginSuccess, subscription, session } =
    useSelector((state) => state.auth);

  const [redirectPath, setRedirectPath] = useState("/admin");

  // Check for stored user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      try {
        const userData = JSON.parse(storedUser);
        dispatch(setUser(userData));
      } catch (err) {
        console.error("Failed to parse stored user:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, [dispatch]);

  // Handle login success redirect
  useEffect(() => {
    if (loginSuccess && user) {
      // Check if user is admin
      if (user.UserRole === "ADMIN") {
        navigate(redirectPath);
      } else {
        // Non-admin users should not access admin panel
        dispatch(logout());
        dispatch(clearError());
        // Show error or redirect to user dashboard
        navigate("/login");
      }
    }
  }, [loginSuccess, user, navigate, redirectPath, dispatch]);

  const handleLogin = async (credentials) => {
    try {
      const result = await dispatch(login(credentials));

      if (result.payload?.token) {
        localStorage.setItem("token", result.payload.token);
        if (result.payload.user) {
          localStorage.setItem("user", JSON.stringify(result.payload.user));
        }
        return { success: true };
      }

      return { success: false, error: result.payload?.message };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/admin/login");
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  const setRedirectTo = (path) => {
    setRedirectPath(path);
  };

  const isAuthenticated = () => {
    return !!user && !!localStorage.getItem("token");
  };

  const isAdmin = () => {
    return user?.UserRole === "ADMIN";
  };

  const hasPermission = (requiredRole = "USER") => {
    if (!user) return false;

    const rolesHierarchy = {
      USER: 0,
      MODERATOR: 1,
      ADMIN: 2,
    };

    const userRoleLevel = rolesHierarchy[user.UserRole] || 0;
    const requiredRoleLevel = rolesHierarchy[requiredRole] || 0;

    return userRoleLevel >= requiredRoleLevel;
  };

  const value = {
    user,
    loading,
    error,
    subscription,
    session,
    isAuthenticated: isAuthenticated(),
    isAdmin: isAdmin(),
    hasPermission,
    login: handleLogin,
    logout: handleLogout,
    clearError: clearAuthError,
    setRedirectTo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Higher Order Component for protected routes
export const withAuth = (Component) => {
  return (props) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
      if (!loading && !isAuthenticated) {
        navigate("/admin/login");
      } else if (!loading && isAuthenticated && !isAdmin) {
        navigate("/");
      }
    }, [isAuthenticated, isAdmin, loading, navigate]);

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-slate-300">Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated || !isAdmin) {
      return null; // Will redirect in useEffect
    }

    return <Component {...props} />;
  };
};

// Hook for route protection
export const useRequireAuth = (requiredRole = "ADMIN") => {
  const { isAuthenticated, isAdmin, hasPermission } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin/login");
    } else if (!hasPermission(requiredRole)) {
      navigate("/unauthorized");
    }
  }, [isAuthenticated, isAdmin, hasPermission, requiredRole, navigate]);

  return { isAuthenticated, isAdmin, hasPermission };
};
