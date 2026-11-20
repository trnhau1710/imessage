import express from "express" //giúp xây dựng backend server và API
import cors from "cors" //Kiểm soát việc truy cập tài nguyên từ các origin khác
import dotenv from "dotenv" //Đọc thông tin cấu hình từ file .env

dotenv.config();

const app = express(); //khởi tạo ứng dụng

//Middleware
app.use(cors({
    origin: process.env.CLIENT_URL //chỉ cho những thằng cấu hình trong .env chạy qua
}));
app.use(express.json());

//Test API
app.get("/", (req, res) => {
    res.json({
        message: "Thằng IMESSAGE đang chạy!"
    });
});

app.get("/api/health", (req, res) => {
    res.status(200).json({
        succes: true,
        message: "Backend đang chạy nè mày!"
    });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});