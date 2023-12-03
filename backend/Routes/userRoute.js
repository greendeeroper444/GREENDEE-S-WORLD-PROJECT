
// router.post("/signin-user", catchAsyncErrors(signInUser));
// const express = require("express");
// const router = express.Router();

// router.get("/google", catchAsyncErrors(async (req, res, next) => {
//     try {
//       // Redirect to Google authentication with the specified scopes
//       passport.authenticate("google", { scope: ["profile", "email"] })(req, res);
//     } catch (error) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   }));
  
//   router.get(
//     "/google/callback",
//     catchAsyncErrors(async (req, res, next) => {
//       try {
//         // Handle the Google authentication callback
//         passport.authenticate("google", {
//           successRedirect: "http://localhost:3000/",
//           failureRedirect: "/login/failed",
//         })(req, res);
//       } catch (error) {
//         return next(new ErrorHandler(error.message, 500));
//       }
//     })
//   );
  