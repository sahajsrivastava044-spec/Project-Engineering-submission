
import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(null);

  useEffect(() => {
    // populate user from token if present
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const userFromToken = { id: decoded.userId || decoded.sub || decoded.id, email: decoded.email, role: decoded.role };
        setRole(userFromToken.role || null);
        setUser(userFromToken);
      } catch (err) {
        setUser(null);
        setRole(null);
      }
    } else {
      setUser(null);
      setRole(null);
    }
  }, [token]);

  const login = (data) => {
    localStorage.setItem('token', data.token);
    // localStorage.setItem('role', data.user.role); // BROKEN PART 3: Storing role in localStorage
    setToken(data.token);
    // prefer server-provided user but fall back to decoding token
    setRole(data.user?.role || null);
    setUser(data.user || null);
  };

  const logout = () => {
    localStorage.removeItem('token');
    // localStorage.removeItem('role');
    setToken(null);
    setRole(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
