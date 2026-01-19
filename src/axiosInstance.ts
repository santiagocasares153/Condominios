// src/api/axiosInstance.ts
import axios from "axios";


const axiosInstance = axios.create({
  baseURL: "", // si tienes baseURL general puedes ponerla aquí
  headers: {
    "Content-Type": "application/json",
  },
});

// ⚠️ Este hook solo puedes usarlo dentro de un componente, así que:
export const setupAxiosInterceptors = (logout: () => void, navigate: (path: string) => void) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.warn("Token vencido o inválido. Cerrando sesión...");
        logout();
        navigate("/");
      }
      return Promise.reject(error);
    }
  );
};

export default axiosInstance;
