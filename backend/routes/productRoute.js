const express = require("express");
const productController = require("../controllers/productController");
const { protect } = require("../controllers/authController");
const { upload } = require("../utils/fileUpload");

const router = express.Router();

router.post(
  "/",
  protect,
  upload.single("image"),
  productController.createProduct
);
router.get("/getallproducts", protect, productController.getAllProducts); //
router.get("/getproduct/:id", protect, productController.getProduct); //
router.delete("/deleteproduct/:id", protect, productController.deleteProduct); //
router.patch(
  "/updateproduct/:id",
  protect,
  upload.single("image"),
  productController.updateProduct
); //

module.exports = router;
