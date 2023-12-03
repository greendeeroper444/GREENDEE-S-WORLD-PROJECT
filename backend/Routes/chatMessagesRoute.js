const express = require("express");
const { createMessage, getMessages } = require("../controllers/chatMessagesController");


const router = express.Router();

router.post("/chat-home", createMessage);
router.get("/chat-home/:conversationId", getMessages);


module.exports = router;