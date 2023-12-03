const express = require("express");
const { createChat, findUserChats, findChat } = require("../controllers/chatController");


const router = express.Router();

router.post("/chat-home", createChat);
router.get("/chat-home/:userId", findUserChats)
router.get("/chat-home/find/:senderId/:receiverId", findChat);


module.exports = router;