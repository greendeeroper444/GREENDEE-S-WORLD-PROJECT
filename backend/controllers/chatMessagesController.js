const chatMessagesModel = require("../models/chatMessagesModel");

//create message

const createMessage = async (req, res) => {
  const newMessage = new chatMessagesModel(req.body);

  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const getMessages = async (req, res) => {
  try {
    const messages = await chatMessagesModel.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

module.exports = { createMessage, getMessages };
