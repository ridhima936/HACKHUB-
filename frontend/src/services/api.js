import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

// Attach the JWT automatically to every request.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// If the token expires/invalid, sign the user out cleanly.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && localStorage.getItem("token")) {
            localStorage.removeItem("token");
            window.dispatchEvent(new Event("hackhub:logout"));
        }
        return Promise.reject(error);
    }
);

export const errorMessage = (error, fallback = "Something went wrong") =>
    error?.response?.data?.errors?.join(". ") ||
    error?.response?.data?.message ||
    (error?.code === "ERR_NETWORK" ? "Cannot reach the server. Is the backend running?" : fallback);

export default api;
