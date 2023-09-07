const asyncHandler = require("express-async-handler");
const Product = require("../models/productModel");
const OpsError = require("../utils/opsError");
const { fileSizeFormatter } = require("../utils/fileUpload");
const cloudinary = require("cloudinary").v2;

//============== CREATE PRODUCT ===============
const createProduct = asyncHandler(async (req, res, next) => {
  const { name, sku, category, quantity, price, description, image } = req.body;

  //Validate input request
  if (!name || !category || !price || !sku || !quantity || !description) {
    return next(new OpsError("Please fill all fields", 400));
  }

  //Handle Image Upload
  let fileData = {};
  // for the purpose of image this must be sent with multipart form

  if (req.file) {
    //Save image to cloudinary
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "InventoryMgtApp",
        resource_type: "image",
      });
    } catch (error) {
      return new OpsError("Image could not be uploaded.", 500);
    }
    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }
  //console.log(fileData);

  //Create Product
  const product = await Product.create({
    user: req.user._id,
    name,
    sku,
    category,
    quantity,
    price,
    description,
    image: fileData,
  });

  return res.status(201).json({ createdBy: req.user.email, product });
  next();
});

//============== GET ALL PRODUCTS =================
const getAllProducts = asyncHandler(async (req, res, next) => {
  const products = await Product.find({ user: req.user._id }).sort(
    "-createdAt"
  );
  // the user arg ensure all products created by the user is loaded
  // "-createdAt" reverse the sorting order. Load the last to be created first.

  res.status(200).json({
    ProcutNos: products.length,
    productCreatedBy: req.user.email,
    products,
  });
});

//=========== GET SINGLE PRODCU DETAIL ================
const getProduct = asyncHandler(async (req, res, next) => {
  const { _id, id, email, name } = req.user;
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new OpsError("Product not found.", 404));
  }
  // Match product to creator/user
  if (product.user.toString() !== id) {
    return next(new OpsError("User not authorize.", 401));
  }
  res.status(200).json({ ProductCreatedBy: email, product });
});

//============= DELETE PRODUCT ===================
const deleteProduct = asyncHandler(async (req, res, next) => {
  const { _id, id, email, name } = req.user;
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new OpsError("Product not found.", 404));
  }
  // Match product to creator/user
  if (product.user.toString() !== id) {
    return next(new OpsError("User not authorize.", 401));
  }
  //console.log(product);
  await product.deleteOne();
  res.status(200).json({
    ProductCreatedBy: email,
    message: "Product deleted successfully",
    product,
  });
});

//============= UPDATE PRODUCT ====================
const updateProduct = asyncHandler(async (req, res, next) => {
  const { name, category, quantity, price, description, image } = req.body;

  const { id } = req.params;

  const product = await Product.findById(id);

  if (!product) {
    return next(new OpsError("Product not found.", 404));
  }

  // Match product to creator/user
  if (product.user.toString() !== req.user.id) {
    console.log(id);
    console.log(product.user.toString());
    return next(new OpsError("User not authorize.", 401));
  }

  //Handle Image Upload
  let fileData = {};

  if (req.file) {
    //Save image to cloudinary
    let uploadedFile;
    try {
      uploadedFile = await cloudinary.uploader.upload(req.file.path, {
        folder: "InventoryMgtApp",
        resource_type: "image",
      });
    } catch (error) {
      return new OpsError("Image could not be uploaded.", 500);
    }
    fileData = {
      fileName: req.file.originalname,
      filePath: uploadedFile.secure_url,
      fileType: req.file.mimetype,
      fileSize: fileSizeFormatter(req.file.size, 2),
    };
  }
  //console.log(fileData);

  //Update the Product
  let updatedProduct = await Product.findByIdAndUpdate(
    { _id: id },
    {
      name,
      category,
      quantity,
      price,
      description,
      image: Object.keys(fileData).length === 0 ? product?.image : fileData,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  return res.status(200).json({ UpdatedBy: req.user.email, updatedProduct });
  next();
});

module.exports = {
  createProduct,
  getAllProducts,
  getProduct,
  deleteProduct,
  updateProduct,
};
