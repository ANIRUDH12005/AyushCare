import React, { createContext, useState, useContext } from 'react';

// Create the context
const AuthContext = createContext();

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Check if user data exists in localStorage
    const savedUser = localStorage.getItem('ayushcare_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Login function
  const login = (userData) => {
    // In a real app, this would come from an API response
    const userWithRole = {
      ...userData,
      role: userData.role || 'doctor', // Default to doctor
    };
    setUser(userWithRole);
    localStorage.setItem('ayushcare_user', JSON.stringify(userWithRole));
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('ayushcare_user');
  };

  // Update user function
  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem('ayushcare_user', JSON.stringify(updatedUser));
  };

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Check specific roles
  const isDoctor = user?.role === 'doctor';
  const isTherapist = user?.role === 'therapist';

  const value = {
    user,
    login,
    logout,
    updateUser,
    isAuthenticated,
    isDoctor,
    isTherapist
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Optional: Create a separate context for notifications if needed
export const NotificationContext = createContext();
