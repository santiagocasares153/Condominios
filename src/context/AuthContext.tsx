// context/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


interface User {
  id?: string;
  nombreUsuario?: string;
  correoUsuario?: string;
  token: string; // el JWT definitivo
}

interface AuthContextType {
  user: User | null;
  login: (token: string, extraData?: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = sessionStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const navigate = useNavigate();

  // Guardar/limpiar en sessionStorage
  useEffect(() => {
    if (user) {
      sessionStorage.setItem("user", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("user");
    }
  }, [user]);

  // 🔹 Guardar token y opcionalmente más datos
 const login = useCallback(
  (token: string, extraData: Partial<User> = {}) => {
    const newUser: User = { token, ...extraData };
    setUser(newUser); // Guarda el objeto completo {token, id, nombreUsuario, ...}

    // Configurar encabezado global de axios
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // Redirigir al sistema
    navigate("/usuarios", { replace: true });
  },
  [navigate]
);

  // 🔹 Cerrar sesión
  const logout = useCallback(() => {
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
    navigate("/login", { replace: true });
  }, [navigate]);

  // 🔹 Interceptor para manejar tokens expirados
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.warn("Token inválido o expirado. Redirigiendo a login...");
          logout();
        }
        return Promise.reject(error);
      }
    );
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe estar dentro de un AuthProvider");
  }
  return context;
}
