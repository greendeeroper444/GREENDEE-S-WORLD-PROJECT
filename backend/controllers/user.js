const express = require("express");
const path = require("path");
const User = require("../models/user");
const router = express.Router();
const { upload } = require("../multer");
const ErrorHandler = require("../utils/ErrorHandler");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/sendMail");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const { isAuthenticated } = require("../middleware/auth");
const passport = require("passport");

router.post("/create-user", upload.single("file"), async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (!req.file) {
      return next(new ErrorHandler("Avatar is required!", 400));
    } else if (!name || !email || !password) {
      const filename = req.file.filename;
      const filePath = `uploads/users/${filename}`;
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Error deleting file" });
        }
      });
      return next(new ErrorHandler("Please provide all fields!", 400));
    } else if (password !== confirmPassword) {
      const filename = req.file.filename;
      const filePath = `uploads/users/${filename}`;
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Error deleting file" });
        }
      });
      return next(new ErrorHandler("Passwords do not match!", 400));
    } else if (password.length < 8) {
      const filename = req.file.filename;
      const filePath = `uploads/users/${filename}`;
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Error deleting file" });
        }
      });
      return next(
        new ErrorHandler(
          "Password should be equal or greater than 8 characters!",
          400
        )
      );
    } else if (email === "") {
      const filename = req.file.filename;
      const filePath = `uploads/users/${filename}`;
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Error deleting file" });
        }
      });
      return next(new ErrorHandler("Email is required!", 400));
    }

    const userEmail = await User.findOne({ email });
    if (userEmail) {
      const filename = req.file.filename;
      const filePath = `uploads/users/${filename}`;
      fs.unlink(filePath, (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "Error deleting file" });
        }
      });
      return next(new ErrorHandler("User already exists!", 400));
    }

    const filename = req.file.filename;
    const fileUrl = path.join(filename);
    const user = {
      name: name,
      email: email,
      password: password,
      avatar: fileUrl,
    };

    const activationToken = createActivationToken(user);

    const activationUrl = `http://localhost:3000/activation/${activationToken}`;

    try {
      await sendMail({
        email: user.email,
        subject: "Activate your account",
        message: `Hello ${user.name}, please click on the link to activate your account: ${activationUrl}`,
      });
      return res.status(201).json({
        success: true,
        message: `Please check your email:- ${user.email} to activate your account!`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

//create activation token
const createActivationToken = (user) => {
  return jwt.sign(user, process.env.ACTIVATION_SECRET, {
    expiresIn: "5m",
  });
};

//active user
router.post(
  "/activation",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { activation_token } = req.body;

      const newUser = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET
      );

      if (!newUser) {
        return next(new ErrorHandler("Invalid token", 400));
      }
      const { name, email, password, avatar } = newUser;

      let user = await User.findOne({ email });
      if (user) {
        return next(new ErrorHandler("User already exists", 400));
      }

      user = await User.create({
        name,
        email,
        avatar,
        password,
      });

      sendToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

//Login user
router.post(
  "/signin-user",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return next(new ErrorHandler("Please provide the all fields!", 400));
      }

      const user = await User.findOne({ email }).select("password");
      if (!user) {
        return next(new ErrorHandler("Email doesn't exists!", 400));
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return next(new ErrorHandler("Password is incorrect!", 400));
      }

      sendToken(user, 201, res);

      //changed
      if (req.user) {
        return res.status(200).json({
          error: false,
          message: "Successfully Loged In",
          user: req.user,
        });
      } else {
        return res.status(403).json({ error: true, message: "Not Authorized" });
      }

    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// const signInUser = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) {
//       return next(new ErrorHandler("Please provide all fields!", 400));
//     }

//     const user = await User.findOne({ email }).select("password");
//     if (!user) {
//       return next(new ErrorHandler("Email doesn't exist!", 400));
//     }

//     const isPasswordValid = await user.comparePassword(password);
//     if (!isPasswordValid) {
//       return next(new ErrorHandler("Password is incorrect!", 400));
//     }

//     sendToken(user, 201, res);
//   } catch (error) {
//     return next(new ErrorHandler(error.message, 500));
//   }
// };


//Load user
router.get(
  "/getUser",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return next(new ErrorHandler("User doesn't exists", 400));
      }

      return res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

//Logout user
router.get(
  "/signout",
  catchAsyncErrors(async (req, res, next) => {
    try {
      res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        sameSite: "none",
        secure: true,
      });
      return res.status(201).json({
        success: true,
        message: "Sign out success!",
      });
      //  res.redirect(process.env.CLIENT_URL)
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

//post all user
router.post(
  "/postAllUsers",
  catchAsyncErrors(async (req, res, next) => {
    try {
      // Fetch all users from the database
      const users = await User.find({}, "id name avatar");

      return res.status(200).json(users);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// router.get("/google", passport.authenticate("google", ["profile", "email"]));

// router.get(
// 	"/google/callback",
// 	passport.authenticate("google", {
// 		successRedirect: "http://localhost:3000/",
// 		failureRedirect: "/login/failed",
// 	})
// );





// Google api
// router.get("/login/success", (req, res)=>{
//   if (req.user) {
// 		return res.status(200).json({
// 			error: false,
// 			message: "Successfully Loged In",
// 			user: req.user,
// 		});
// 	} else {
// 		return res.status(403).json({ error: true, message: "Not Authorized" });
// 	}
// })
// router.get("/login/failed", (req, res)=>{
//     return res.status(401).json({
//         error: true,
//         message: "Login failure",
//     });
// });

// router.get(
// 	"/google/callback",
// 	passport.authenticate("google", {
// 		successRedirect: process.env.CLIENT_URL,
// 		failureRedirect: "/login/failed",
// 	})
// );

// router.get("/google", passport.authenticate("google", ["profile", "email"]));

// router.get("/logout", (req,res) =>{
//   req.logout();
//   return res.redirect(process.env.CLIENT_URL);
// });

module.exports = router;
