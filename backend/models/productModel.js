const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    name: {
      typ: String,
      required: [true, "Please add product name"],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, "SKU"],
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      default: "SKU",
    },
    category: {
      type: String,
      required: [true, "Please add product category"],
      trim: true,
    },
    quantity: {
      type: String,
      required: [true, "Please add quantity of the product"],
      trim: true,
    },
    price: {
      type: String,
      required: [true, "Product rpices are required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description must be provided"],
      trim: true,
    },
    image: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
