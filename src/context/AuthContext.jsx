import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user dari sessionStorage saat pertama kali
  useEffect(() => {
    console.log('🟢 AuthContext: Checking session...');
    
    try {
      const savedUser = sessionStorage.getItem('currentUser');
      console.log('🟢 Raw sessionStorage:', savedUser);
      
      if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
        const parsedUser = JSON.parse(savedUser);
        console.log('🟢 Parsed user:', parsedUser);
        
        // Validasi user object
        if (parsedUser && parsedUser.email && parsedUser.role) {
          setUser(parsedUser);
          console.log('✅ User restored from session');
        } else {
          console.log('❌ Invalid user data, clearing session');
          sessionStorage.removeItem('currentUser');
        }
      } else {
        console.log('⚠️ No valid session found');
      }
    } catch (e) {
      console.error('❌ Error parsing session:', e);
      sessionStorage.removeItem('currentUser');
    } finally {
      setLoading(false);
      console.log('🟢 Loading complete, user:', user);
    }
  }, []); // HANYA JALAN SEKALI saat mount

  // Simpan user ke sessionStorage setiap kali berubah
  useEffect(() => {
    if (user) {
      console.log('💾 Saving user to session:', user);
      sessionStorage.setItem('currentUser', JSON.stringify(user));
    } else if (user === null) {
      console.log('🗑️ Removing user from session');
      sessionStorage.removeItem('currentUser');
    }
  }, [user]);

  const logout = () => {
    console.log('🔴 Logout called');
    setUser(null);
    sessionStorage.clear(); // Clear semua session
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