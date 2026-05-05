import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('accessToken'));

  const user = useMemo(() => {
    if (!token) return null;
    const decoded = decodeJwt(token);
    if (!decoded || decoded.exp * 1000 < Date.now()) return null;
    return { id: decoded.sub, role: decoded.role };
  }, [token]);

  function login(accessToken) {
    localStorage.setItem('accessToken', accessToken);
    setToken(accessToken);
  }

  function logout() {
    localStorage.removeItem('accessToken');
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
