const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  category: { type: String },
  price: { type: Number },
  discountPercentage: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  stock: { type: Number },
  brand: { type: String },
  sku: { type: String },
  weight: { type: Number },
  dimensions: {
    width: Number,
    height: Number,
    depth: Number,
  },
  warrantyInformation: String,
  shippingInformation: String,
  availabilityStatus: String,
  manufacturingDate: Date,
  expiryDate: Date,
  milkType: String,
  reviews: [
    {
      rating: Number,
      comment: String,
      date: Date,
      reviewerName: String,
      reviewerEmail: String,
    },
  ],
  returnPolicy: String,
  minimumOrderQuantity: { type: Number, default: 1 },
  meta: {
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    barcode: String,
    qrCode: String,
  },
  images: [String],
});

// Middleware cập nhật `updatedAt` mỗi khi có thay đổi
productSchema.pre("save", function (next) {
  this.meta.updatedAt = new Date();
  next();
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
