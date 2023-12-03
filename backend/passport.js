const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
// const User = require("./models/user")

const CLIENT_ID = "455389397615-bktkissr87su0eaen79jv9i5fedcivk0.apps.googleusercontent.com"
const CLIENT_SECRET = "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"

passport.use(new GoogleStrategy({
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: "/api/v2/auth/google/callback",
    scope: ["profile", "email"],
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser((user, done) => {
	done(null, user);
});










// passport.use(new GoogleStrategy({
//   clientID: CLIENT_ID,
//   clientSecret: CLIENT_SECRET,
//   callbackURL: "/api/v2/auth/google/callback",
//   scope: ["profile", "email"],
// },
// function(accessToken, refreshToken, profile, cb) {
//   // Assuming you have a User model with an "email" field
//   User.findOne({ email: profile._json.email }, function(err, user) {
//     if (err) {
//       return cb(err);
//     }
//     if (user) {
//       // User with this email already exists, you can proceed with login
//       return cb(null, user);
//     } else {
//       // User doesn't exist, you can handle registration or preventing login here
//       return cb(null, false);
//     }
//   });
// })
// );




// Configure Passport with Google Strategy
// passport.use(new GoogleStrategy({
//   clientID: CLIENT_ID,
//   clientSecret: CLIENT_SECRET,
//   callbackURL: "/auth/google/callback",
//   scope: ["profile", "email"],
// },
// function(accessToken, refreshToken, profile, done) {
//   // Check if the user already exists in the database
//   User.findOne({ email: profile.emails[0].value }, (err, existingUser) => {
//     if (err) {
//       return done(err);
//     }
//     if (existingUser) {
//       return done(null, existingUser);
//     }
    
//     // If the user doesn't exist, create a new user in the database
//     const newUser = new User({
//       name: profile.displayName,
//       email: profile.emails[0].value,
//       // You may want to set other user properties here
//     });
    
//     newUser.save((err) => {
//       if (err) {
//         return done(err);
//       }
      
//       return done(null, newUser);
//     });
//   });
// }
// ));

// // Serialize and deserialize user
// passport.serializeUser(function(user, done) {
//   done(null, user.id);
// });

// passport.deserializeUser(function(id, done) {
//   User.findById(id, function(err, user) {
//     done(err, user);
//   });
// });
