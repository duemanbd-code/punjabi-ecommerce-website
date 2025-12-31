// admin/src/utils/auth.ts

// Utility functions for authentication
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  // ✅ Always use 'admin-token'
  return localStorage.getItem('admin-token');
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  return token ? { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  } : {};
};

export const getAuthHeadersForFormData = (): Record<string, string> => {
  const token = getAuthToken();
  return token ? { 
    'Authorization': `Bearer ${token}`
  } : {};
};

export const logout = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('admin-token');
  localStorage.removeItem('admin-user');
  window.location.href = '/login';
};

export const checkAuthAndRedirect = (router: any): boolean => {
  if (!isAuthenticated()) {
    router.push('/login');
    return false;
  }
  return true;
};