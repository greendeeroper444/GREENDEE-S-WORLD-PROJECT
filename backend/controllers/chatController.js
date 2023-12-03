const chatModel = require("../models/chatModel");

//create a new conversation
const createChat = async (req, res) => {
  // const { firstId, secondId } = req.body;

  // try {
  //   const chat = await chatModel.findOne({
  //     members: { $all: [firstId, secondId] },
  //   });

  //   if (chat) return res.status(200).json(chat);

  //   const newChat = new chatModel({
  //     members: [firstId, secondId],
  //   });

  //   const response = await newChat.save();

  //   res.status(200).json(response);
  // } catch (error) {
  //   console.log(error);
  //   res.status(500).json(error);
  // }

  try {
    const newCoversation = new chatModel({
      members: [req.body.senderId, req.body.receiverId],
    });

    const savedCoversation = await newCoversation.save();

    res.status(200).json(savedCoversation);
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }

};

// find user chats
const findUserChats = async (req, res) => {
  // const userId = req.params.userId;

//   try {
//     const chats = await chatModel.find({
//       members: { $in: [userId] },
//     });

//     res.status(200).json(chats);

//   } catch (error) {
//     console.log(error);
//     res.status(500).json(error);
//   }

try {
  const conversation = await chatModel.find({
    members: {$in: [req.params.userId]},
  });
  res.status(200).json(conversation);

} catch (error) {
  console.error(error);
  res.status(500).json(error);
}

};

// find chat
const findChat = async (req, res) => {
  const { firstId, secondId } = req.params;

  try {
    const chat = await chatModel.findOne({
      members: { $all: [firstId, secondId] },
    });

    res.status(200).json(chat);
    
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

module.exports = { createChat, findUserChats, findChat };
