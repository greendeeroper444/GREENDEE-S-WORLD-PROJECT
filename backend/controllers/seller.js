const express = require("express");
const path = require("path");
const router = express.Router();
const fs = require("fs");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const { isSeller } = require("../middleware/auth");
const Seller = require("../models/seller");
const { upload } = require("../multerSeller");
const ErrorHandler = require("../utils/ErrorHandler");
const sendSellerToken = require("../utils/sellerToken");

//create seller
router.post("/create-seller", upload.single("file"), async (req, res, next) => {
  try {
    const { shopName, name, email, phoneNumber, password, confirmPassword, address, zipCode } = req.body;
    if (!req.file) {
      return next(new ErrorHandler("Avatar is required!", 400));
    }
    else if (!shopName || !name || !email || !password) {
      const filename = req.file.filename;
      const filePath = `uploads/sellers/${filename}`;
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: "Error deleting file" });
        }
      });
      return next(new ErrorHandler("Please provide all fields!", 400));
    } 
    else if (password !== confirmPassword) {
      const filename = req.file.filename;
      const filePath = `uploads/sellers/${filename}`;
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: "Error deleting file" });
        }
      });
      return next(new ErrorHandler("Passwords do not match!", 400));
    } 
    else if (password.length < 8) {
      const filename = req.file.filename;
      const filePath = `uploads/sellers/${filename}`;
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: "Error deleting file" });
        }
      });
      return next(new ErrorHandler("Password should be equal or greater than 8 characters!", 400));
    } 
    else if (email === "") {
      const filename = req.file.filename;
      const filePath = `uploads/sellers/${filename}`;
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: "Error deleting file" });
        }
      });
      return next(new ErrorHandler("Email is required!", 400));
    } 
    else if (!phoneNumber) {
      const filename = req.file.filename;
      const filePath = `uploads/sellers/${filename}`;
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: "Error deleting file" });
        }
      });
      return next(new ErrorHandler("Phone Number is Required!", 400));
    }
    else if (!address) {
      const filename = req.file.filename;
      const filePath = `uploads/sellers/${filename}`;
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: "Error deleting file" });
        }
      });
      return next(new ErrorHandler("Address is Required!", 400));
    }
    else if (!zipCode) {
      const filename = req.file.filename;
      const filePath = `uploads/sellers/${filename}`;
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: "Error deleting file" });
        }
      });
      return next(new ErrorHandler("Zip code is Required!", 400));
    }

    const sellerEmail = await Seller.findOne({ email });
    if (sellerEmail) {
      const filename = req.file.filename;
      const filePath = `uploads/sellers/${filename}`;
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(err);
          res.status(500).json({ message: "Error deleting file" });
        }
      });
      return next(new ErrorHandler("Seller already exists!", 400));
    }

    const filename = req.file.filename;
    const fileUrl = path.join(filename);
    const seller = {
      shopName: shopName,
      name: name,
      email: email,
      phoneNumber: phoneNumber,
      password: password,
      address: address,
      zipCode: zipCode,
      avatar: fileUrl,
    };

    const activationToken = createActivationToken(seller);

    const activationUrl = `http://localhost:3000/seller/activation/${activationToken}`;

    try {
      await sendMail({
        email: seller.email,
        subject: "Activate your seller account",
        message: `Hello ${seller.name}, please click on the link to activate your seller account: ${activationUrl}`,
      });
      res.status(201).json({
        success: true,
        message: `Please check your email:- ${seller.email} to activate your seller account!`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

//create activation token
const createActivationToken = (seller) => {
  return jwt.sign(seller, process.env.ACTIVATION_SECRET, {
    expiresIn: "5m",
  });
};

//active seller
router.post(
  "/activation",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { activation_token } = req.body;

      const newSeller = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET
      );

      if (!newSeller) {
        return next(new ErrorHandler("Invalid token", 400));
      }
      const { shopName, name, email, phoneNumber, password, address, zipCode, avatar } = newSeller;

      let seller = await Seller.findOne({ email });
      if (seller) {
        return next(new ErrorHandler("Seller account already exists", 400));
      }

      seller = await Seller.create({
        shopName,
        name,
        email,
        phoneNumber,
        password,
        address,
        zipCode,
        avatar,
      });

      sendSellerToken(seller, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

//Login seller
router.post(
  "/signin-seller",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return next(new ErrorHandler("Please provide the all fields!", 400));
      }

      const user = await Seller.findOne({ email }).select("password");
      if (!user) {
        return next(new ErrorHandler("Email doesn't exists!", 400));
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return next(
          new ErrorHandler("Password is incorrect!", 400)
        );
      }

      sendSellerToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

//Load seller
router.get("/getSeller", isSeller, catchAsyncErrors(async(req, res, next)=>{
  try {
    const seller = await Seller.findById(req.seller._id);
    if(!seller){
      return next(new ErrorHandler("Seller doesn't exists", 400));
    }

    res.status(200).json({
      success: true,
      seller,
    });

  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}))


module.exports = router;
