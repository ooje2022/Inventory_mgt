const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");

const OpsError = require("./utils/opsError");
const userRoute = require("./routes/userRoute");
const productRoute = require("./routes/productRoute");
const globalErrorHandler = require("./controllers/errorController");
const contactRoute = require("./routes/contactRoute");

const app = express();

//GENERAL MIDDLEWARE
app.use(express.json()); //handle json data in app
app.use(cookieParser()); //for httpony user authentication cookie
app.use(express.urlencoded({ extended: false })); //handle data coming via the url
app.use(bodyParser.json()); //handle data from frontend to backend
//Routes
app.use(
  cors({
    origin: ["http://localhost:3000", "http://inventory-app.vercel.app"],
    credentials: true,
  })
);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Home Page");
});

//ROUTE MIDDEWARES
app.use("/api/users", userRoute); ///api/users is a route prefix
app.use("/api/products", productRoute);
app.use("/api/contactus", contactRoute);

app.all("*", (req, res, next) => {
  next(new OpsError(`Can't find ${req.originalUrl} on this server.`, 404));
});

//ERROR MIDDLEWARE
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Server listening on port ${PORT}.....`)
    );
  })
  .catch((err) => console.log(err));
