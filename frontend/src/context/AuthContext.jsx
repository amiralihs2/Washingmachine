import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [userName, setUserName] = useState(() => localStorage.getItem("washslot.user") || "");

  useEffect(() => {
    if (userName) localStorage.setItem("washslot.user", userName);
    else localStorage.removeItem("washslot.user");
  }, [userName]);

  const login = (name) => setUserName(name.trim());
  const logout = () => setUserName("");

  return (
    <AuthContext.Provider value={{ userName, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
