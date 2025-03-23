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

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*" }
});

// Middleware
app.use(express.json());
app.use(cors());

// Danh sách các Redis server theo thứ tự ưu tiên
const redisServers = [
    { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT, password: process.env.REDIS_PASSWORD },
    { host: process.env.REDIS_BACKUP_1_HOST, port: process.env.REDIS_BACKUP_1_PORT, password: process.env.REDIS_BACKUP_1_PASSWORD },
    { host: process.env.REDIS_BACKUP_2_HOST, port: process.env.REDIS_BACKUP_2_PORT, password: process.env.REDIS_BACKUP_2_PASSWORD },
    { host: process.env.REDIS_BACKUP_3_HOST, port: process.env.REDIS_BACKUP_3_PORT, password: process.env.REDIS_BACKUP_3_PASSWORD },
    { host: process.env.REDIS_BACKUP_4_HOST, port: process.env.REDIS_BACKUP_4_PORT, password: process.env.REDIS_BACKUP_4_PASSWORD }
];

let redis = null; // Lưu Redis kết nối thành công

// Hàm thử kết nối đến từng Redis theo thứ tự
const connectToRedis = async () => {
    for (let i = 0; i < redisServers.length; i++) {
        try {
            console.log(`🔍 Đang thử kết nối Redis ${i}...`);
            const client = new Redis({
                host: redisServers[i].host,
                port: redisServers[i].port,
                password: redisServers[i].password,
                connectTimeout: 5000, // Timeout sau 5 giây nếu không kết nối được
                retryStrategy: null // Không thử lại nếu lỗi
            });

            // Chờ kiểm tra kết nối bằng lệnh PING
            await client.ping();
            console.log(`✅ Kết nối thành công đến Redis ${i} (${redisServers[i].host}:${redisServers[i].port})`);

            redis = client; // Lưu Redis kết nối thành công
            return; // Dừng lại khi kết nối thành công
        } catch (error) {
            console.error(`❌ Không thể kết nối Redis ${i}:`, error.message);
        }
    }
    console.error("🚨 Tất cả Redis đều không kết nối được! Kiểm tra lại hệ thống.");
};

// Bắt đầu kết nối Redis
connectToRedis().then(() => {
    if (!redis) return; // Nếu không kết nối được Redis nào, dừng lại

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
});

// Routes
app.use("/api/products", productRoutes);

// Khởi động server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`🚀 Server đang chạy trên cổng ${PORT}`);
    console.log(`🔗 http://localhost:${PORT}`);
});
