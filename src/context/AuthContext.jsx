import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user dari sessionStorage saat pertama kali
  useEffect(() => {
    try {
      const savedUser = sessionStorage.getItem('currentUser');
      
      if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
        const parsedUser = JSON.parse(savedUser);
        
        // Validasi user object
        if (parsedUser && parsedUser.email && parsedUser.role) {
          setUser(parsedUser);
        } else {
          sessionStorage.removeItem('currentUser');
        }
      }
    } catch (e) {
      sessionStorage.removeItem('currentUser');
    } finally {
      setLoading(false);
    }
  }, []);

  // Simpan user ke sessionStorage setiap kali berubah
  useEffect(() => {
    if (user) {
      sessionStorage.setItem('currentUser', JSON.stringify(user));
    } else if (user === null) {
      sessionStorage.removeItem('currentUser');
    }
  }, [user]);

  const logout = () => {
    setUser(null);
    sessionStorage.clear();
  };

  const value = { user, loading, setUser, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};