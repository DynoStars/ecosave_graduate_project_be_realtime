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
    host: "novel-bird-36009.upstash.io",
    port: 6379,
    password: "AYypAAIjcDE2YTIwYmVjNTlmYWU0NjQ0YTE5Mzg0ODBlMWNlOTgyZXAxMA",
    tls: {},
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

    const eventData = JSON.parse(message);
    io.emit("product.created", eventData);
});

// Routes
app.use("/api/products", productRoutes);

// Khởi động server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`🚀 Server đang chạy trên cổng ${PORT}`);
    console.log(`🔗 http://localhost:${PORT}`);
  });

