require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_BOT_KEY;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Tweet a text-based status
async function telegram(message) {
  const chatId = "@test_channel_star";

  bot.sendMessage(chatId, message, {parse_mode: "HTML"});
}

// OPTIONAL - use this method if you want the tweet to include the full image file of the OpenSea item in the tweet.
async function telegramWithImage(message, imageUrl) {
  // Format our image to base64
  const processedImage = await getBase64(imageUrl);
}

module.exports = {
  telegram: telegram,
  telegramWithImage: telegramWithImage,
};
