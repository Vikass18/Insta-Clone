import { createContext, useContext, useState, useEffect } from "react";
import { login, register, getMe, updateProfile } from "./services/auth.api";

export const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const userData = await getMe();
        setUser(userData.user);
      } catch (error) {
        // Not logged in
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const handleUpdateProfile = async (bio, profileImage) => {
    try {
      const response = await updateProfile(bio, profileImage);
      setUser(response.user);
      return response.user;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, setLoading, handleUpdateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}
