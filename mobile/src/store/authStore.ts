import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { authAPI } from '../services/api';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    const { data } = await authAPI.login(email, password);
    await AsyncStorage.setItem('token', data.token);
    set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
  },

  register: async (name, email, password) => {
    set({ isLoading: true });
    const { data } = await authAPI.register(name, email, password);
    await AsyncStorage.setItem('token', data.token);
    set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadUser: async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;
    try {
      const { data } = await authAPI.me();
      set({ user: data, token, isAuthenticated: true });
    } catch {
      await AsyncStorage.removeItem('token');
    }
  },
}));
