const express = require("express");
const { getProducts, getProductByBarcode, getProductsByIds  } = require("../controllers/productController");

const router = express.Router();

// Lấy danh sách tất cả sản phẩm
router.get("/", getProducts);

// Tìm sản phẩm theo barcode
router.get("/barcode/:barcode", getProductByBarcode);

// Tìm sản phẩm theo danh sách ID (POST request)
router.post("/by-ids", getProductsByIds);

module.exports = router;
