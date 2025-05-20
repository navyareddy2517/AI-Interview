
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Register a new user
  const register = async (email, password, displayName) => {
    try {
      // In a real app, this would call Firebase or another auth service
      // For now, we'll simulate a successful registration
      const newUser = {
        uid: `user_${Math.random().toString(36).substr(2, 9)}`,
        email,
        displayName,
        photoURL: null,
        createdAt: new Date().toISOString(),
      };
      
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "Could not create your account. Please try again.",
      });
      return { success: false, error };
    }
  };

  // Login a user
  const login = async (email, password) => {
    try {
      // In a real app, this would call Firebase or another auth service
      // For now, we'll simulate a successful login
      const loggedInUser = {
        uid: `user_${Math.random().toString(36).substr(2, 9)}`,
        email,
        displayName: email.split('@')[0],
        photoURL: null,
      };
      
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      
      return { success: true, user: loggedInUser };
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid email or password. Please try again.",
      });
      return { success: false, error };
    }
  };

  // Logout the current user
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  // Update user profile
  const updateProfile = async (data) => {
    try {
      // In a real app, this would call Firebase or another auth service
      // For now, we'll just update the local state
      const updatedUser = {
        ...user,
        ...data,
        updatedAt: new Date().toISOString(),
      };
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "Could not update your profile. Please try again.",
      });
      return { success: false, error };
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
