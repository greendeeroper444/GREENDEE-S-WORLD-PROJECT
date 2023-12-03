const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const sellerSchema = new mongoose.Schema({
  shopName: {
    type: String,
    required: [true, "Please enter your shop name!"],
  },

  name: {
    type: String,
    required: [true, "Please enter your name!"],
  },

  email: {
    type: String,
    required: [true, "Please enter your email!"],
  },

  phoneNumber: {
    type: Number,
    required: [true, "Please enter your phone number!"],
  },

  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [4, "Password should be greater than 4 characters"],
    select: false,
  },

  address: {
    type: String,
    required: [true, "Please enter your address!"],
  },

  zipCode: {
    type: Number,
    required: [true, "Please enter your zipCode!"],
  },

  description: {
    type: String,
  },

  role: {
    type: String,
    default: "seller",
  },

  avatar: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now(),
  },
  resetPasswordToken: String,
  resetPasswordTime: Date,
  
});

//  Hash password
sellerSchema.pre("save", async function (next){
  if(!this.isModified("password")){
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// jwt token
sellerSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id}, process.env.JWT_SECRET_KEY,{
    expiresIn: process.env.JWT_EXPIRES,
  });
};

// compare password
sellerSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


module.exports = mongoose.model("Seller", sellerSchema);
