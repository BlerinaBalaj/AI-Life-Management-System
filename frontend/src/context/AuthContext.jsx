import { createContext, useContext, useEffect, useState } from "react";
import { api, apiErrorMessage } from "../api/client.js";

const AuthContext = createContext(null);

export const isAdminRole = (role) =>
  ["ADMIN", "ROLE_ADMIN", "SUPER_ADMIN", "ROLE_SUPER_ADMIN"].includes(role);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || localStorage.getItem("accessToken"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        /* ignore */
      }
    }
    setLoading(false);
  }, []);

  const persist = (tok, usr) => {
    localStorage.setItem("token", tok);
    localStorage.setItem("accessToken", tok);
    localStorage.setItem("user", JSON.stringify(usr));
    setToken(tok);
    setUser(usr);
  };

  const login = async (email, password) => {
    try {
      const res = await api.login(email, password);
      const tok = res.data?.token || res.data?.accessToken;
      if (!tok) {
        throw new Error("Login succeeded but the backend did not return a JWT token.");
      }
      let usr = res.data?.user;
      if (!usr) {
        usr = {
          id: res.data?.userId,
          tenantId: res.data?.tenantId,
          tenantName: res.data?.tenantName,
          email: res.data?.email || email,
          fullName: res.data?.fullName || email.split("@")[0],
          workspace: res.data?.tenantName,
          role: res.data?.role,
        };
      }
      persist(tok, usr);
      return { ok: true, user: usr };
    } catch (e) {
      return { ok: false, message: apiErrorMessage(e, "Login failed. Check your email, password, and backend.") };
    }
  };

  const register = async (payload) => {
    try {
      await api.register(payload);
      return await login(payload.email, payload.password);
    } catch (e) {
      return { ok: false, message: apiErrorMessage(e, "Registration failed. Check the backend console.") };
    }
  };

  const loginAsDemo = () => {
    persist("demo-token", {
      email: "demo@lifeos.app",
      fullName: "Demo User",
      workspace: "Demo Workspace",
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, loginAsDemo, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
