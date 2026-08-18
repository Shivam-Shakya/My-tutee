const isDevelopment = import.meta.env.DEV;

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || (isDevelopment ? "/api" : "/api");
export const ORIGIN_URL = import.meta.env.VITE_ORIGIN_URL || (isDevelopment ? "http://localhost:5000" : window.location.origin);
