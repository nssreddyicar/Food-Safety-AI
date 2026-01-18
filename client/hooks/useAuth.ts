import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { storage } from '@/lib/storage';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const storedUser = await storage.getUser();
      setUser(storedUser);
      setIsAuthenticated(!!storedUser);
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email && password.length >= 6) {
        await storage.seedDemoData();
        const storedUser = await storage.getUser();
        setUser(storedUser);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await storage.clearAll();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refresh: loadUser,
  };
}
