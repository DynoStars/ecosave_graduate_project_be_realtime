const express = require("express");
const { getProducts, getProductByBarcode, getProductsByIds, createProduct, deleteProductById } = require("../controllers/productController");

const router = express.Router();

// Lấy danh sách tất cả sản phẩm
router.get("/", getProducts);

// Tìm sản phẩm theo barcode
router.get("/barcode/:barcode", getProductByBarcode);

// Tìm sản phẩm theo danh sách ID (POST request)
router.post("/by-ids", getProductsByIds);

// Tạo sản phẩm mới
router.post("/", createProduct);
// xóa theo Id 
router.delete("/products/:id", deleteProductById);
module.exports = router;
