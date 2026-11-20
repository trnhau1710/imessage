import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:5000/api", // để sau này gọi api khỏi cần gọi full đường dẫn
    headers: {
        "Content-Type": "application/json"
    }
});

export default api;