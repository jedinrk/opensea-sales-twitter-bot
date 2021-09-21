require("dotenv").config();

const TelegramBot = require("node-telegram-bot-api");

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_BOT_KEY;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Telegram a text-based status
async function telegram(message) {
  const chatId = "@openstarsorg";

  bot.sendMessage(chatId, message, {parse_mode: "HTML"});
}


module.exports = {
  telegram: telegram,
  telegramWithImage: telegramWithImage,
};
