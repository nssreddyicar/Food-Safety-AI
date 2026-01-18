import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { storage } from '@/lib/storage';
import { getApiUrl } from '@/lib/query-client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

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
    setLoginError(null);
    try {
      const baseUrl = getApiUrl();
      const response = await fetch(new URL('/api/officer/login', baseUrl).href, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setLoginError(data.error || 'Login failed');
        return false;
      }

      // Create user object from officer data
      const officerUser: User = {
        id: data.officer.id,
        name: data.officer.name,
        email: data.officer.email,
        role: data.officer.role,
        designation: data.officer.designation || '',
        phone: data.officer.phone || '',
        employeeId: data.officer.employeeId || '',
        jurisdiction: data.officer.jurisdiction,
      };

      await storage.setUser(officerUser);
      await storage.seedDemoData(); // Seed inspection/sample demo data
      setUser(officerUser);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      setLoginError('Unable to connect to server. Please try again.');
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
    loginError,
    login,
    logout,
    refresh: loadUser,
  };
}
