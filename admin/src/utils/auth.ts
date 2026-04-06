// admin/src/utils/auth.ts

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // Only check localStorage - your token is there
  const token = localStorage.getItem('admin-token');
  console.log("🔑 getAuthToken - Token found:", !!token);
  
  return token;
};

export const setAuthToken = (token: string, remember: boolean = false): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('admin-token', token);
  console.log("💾 Token saved to localStorage");
};

export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  return !!token;
};

export const logout = (): void => {
  localStorage.removeItem('admin-token');
  localStorage.removeItem('admin-user');
  window.location.href = '/login';
};