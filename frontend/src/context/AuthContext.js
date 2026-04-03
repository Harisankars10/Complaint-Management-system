import React, { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext();

function decodeJwtPayload(token) {
  try {
    const base64 = token.split(".")[1];
    const payload = atob(base64);
    return JSON.parse(payload);
  } catch (error) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("access_token"));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("access_token");
    return stored ? decodeJwtPayload(stored) : null;
  });

  const login = (accessToken) => {
    localStorage.setItem("access_token", accessToken);
    setToken(accessToken);
    setUser(decodeJwtPayload(accessToken));
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
