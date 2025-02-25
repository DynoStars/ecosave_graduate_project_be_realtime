require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const Redis = require("ioredis");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*" }
});

// Kết nối Redis
const redis = new Redis({
    host: "127.0.0.1",
    port: 6379
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

server.listen(4000, () => {
    console.log("Node.js server đang chạy trên cổng 4000");
});
