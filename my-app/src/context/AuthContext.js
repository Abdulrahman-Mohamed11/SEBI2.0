// AuthContext — CampusCare global authentication state.
// On app launch: restores JWT from AsyncStorage and re-fetches user profile.
// Provides: user, token, loading, login(), register(), logout()
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginApi, registerApi, getMeApi } from '../api/auth.api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const stored = await AsyncStorage.getItem('token');
        if (stored) {
          setToken(stored);
          const { data } = await getMeApi();
          setUser(data);
        }
      } catch {
        await AsyncStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (email, password) => {
    const { data } = await loginApi({ email, password });
    await AsyncStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (formData) => {
    const { data } = await registerApi(formData);
    await AsyncStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
