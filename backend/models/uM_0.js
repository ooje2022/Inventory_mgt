const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name."],
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "Please provide email."],
      unique: true,
      trim: true,
      /* match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter valid email.",
        ], */
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please provide password."],
      minLength: [6, "Password must be minimum of 6 characters"],
    },
    confirmPassword: {
      type: String,
      required: [true, "Please provide password."], //true
      minLength: [6, "Password must be minimum of 6 characters"],
      //This will only function on the save and create
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords do not match.",
      },
    },
    photo: {
      type: String,
      required: [true, "Please add a photo image."],
      default: "https://i.ibb.co/4pDNDk1/avatar.png",
    },
    phone: {
      type: String,
      default: "+234",
    },
    bio: {
      type: String,
      maxLength: [400, "Bio must not be more than 400 characters"],
      default: "bio",
    },
    passwordChangedAt: Date,
  },
  {
    timestamps: true,
  }
);

//ENCRYPT PASSWORD BEFORE SAVING TO DB
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  //hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(this.password, salt);
  this.password = hashedPassword;

  //delete passwordConfirm to not save it on DB
  this.confirmPassword = undefined;
  next();
});

userSchema.methods.passwordChangedCheck = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    //console.log(this.passwordChangedAt, JWTTimeStamp)
    const passwordchangedTimeTmeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(
      passwordchangedTimeTmeStamp,
      JWTTimeStamp,
      "Differential => ",
      passwordchangedTimeTmeStamp - JWTTimeStamp
    );
    console.log(
      "..........Token should be more recent than password change.............. Negative differential is desirable.........."
    );
    return JWTTimeStamp < passwordchangedTimeTmeStamp;
  }
  return false;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
