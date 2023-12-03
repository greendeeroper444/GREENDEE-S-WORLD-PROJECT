require("dotenv").config();
const express = require("express");
const ErrorHandler = require("./middleware/error");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const cors = require("cors");
const chatRoute = require("./Routes/chatRoute");
const chatMessagesRoute = require("./Routes/chatMessagesRoute");
const passport = require("passport");
const cookieSession = require("cookie-session");
const passportSetup = require("./passport");

app.use(
  cookieSession({
    name: "session",
    keys: ["cybergreen"],
    maxAge: 24 * 60 * 60 * 100,
  })
)

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:3000",
  methods: "GET, POST, PUT, DELETE,",
  credentials: true,
}));

// const port = process.env.PORT || 8000;

app.use("/", express.static("uploads"));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

//Config
if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config({
    path: "backend/config/.env",
  });
}

// app.get('/auth/google',
//   passport.authenticate('google', { scope: ['profile'] }));

// app.get('/auth/google/callback', 
//   passport.authenticate('google', { failureRedirect: '/sign-in' }),
//   function(req, res) {
//     // Successful authentication, redirect home.
//     res.redirect('/');
//   });


//import routes
const user = require("./controllers/user");
const seller = require("./controllers/seller");
const auth = require("./Routes/auth");

app.use("/api/v2/user", user);
app.use("/api/v2/seller", seller);
app.use("/api/v2/chats", chatRoute);
app.use("/api/v2/messages", chatMessagesRoute);
app.use("/api/v2/auth", auth);

//It's for Errorhandling
app.use(ErrorHandler);

module.exports = app;

//https://www.youtube.com/watch?v=pdd04JzJrDw&t=306s&ab_channel=CyberWolves
