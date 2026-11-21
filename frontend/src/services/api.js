import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:5000/api", // để sau này gọi api khỏi cần gọi full đường dẫn
    headers: {
        "Content-Type": "application/json"
    }
});

//Request Interceptor

api.interceptors.request.use(
    (config) => {
        //Lay JWT token tu Local Storage
        const token = localStorage.getItem("token");

        // Neu co token thi dinh kem vao Authorization Header
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;