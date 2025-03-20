require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const Redis = require("ioredis");
const cors = require("cors");
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");

// Kết nối database
connectDB();

const app = express(); // Phải khai báo app trước khi sử dụng
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*" }
});

// Middleware
app.use(express.json());
app.use(cors());

const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
});
// Lắng nghe sự kiện từ Laravel qua Redis
redis.subscribe("products", (err, count) => {
    if (err) {
        console.error("Lỗi kết nối Redis:", err);
    } else {
        console.log(`Đang lắng nghe ${count} kênh Redis.`);
    }
});
redis.psubscribe("private-products", (err, count) => {
    if (err) {
        console.error("Lỗi khi subscribe Redis:", err);
    } else {
        console.log(`Đã subscribe vào ${count} channel.`);
    }
});
redis.on("message", (channel, message) => {
    console.log(`Nhận sự kiện từ Redis (kênh: ${channel}):`, message);

    try {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.data && parsedMessage.data.command) {
            const commandData = JSON.parse(parsedMessage.data.command);
            if (commandData.event && commandData.event.product) {
                io.emit("product.created", commandData.event.product);
                console.log("Đã phát sự kiện product.created:", commandData.event.product);
            } else {
                console.error("Không tìm thấy dữ liệu sản phẩm trong sự kiện.");
            }
        } else {
            console.error("Dữ liệu Redis không hợp lệ.");
        }
    } catch (error) {
        console.error("Lỗi khi phân tích dữ liệu Redis:", error);
    }
});


// Routes
app.use("/api/products", productRoutes);

// Khởi động server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`🚀 Server đang chạy trên cổng ${PORT}`);
    console.log(`🔗 http://localhost:${PORT}`);
  });

