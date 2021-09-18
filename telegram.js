const TelegramBot = require("node-telegram-bot-api");

// replace the value below with the Telegram token you receive from @BotFather
const token = process.env.TELEGRAM_BOT_KEY;

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Tweet a text-based status
async function telegram(message) {
  const tweet = {
    status: tweetText,
  };

  const chatId = "@test_channel_star";


  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, message);
}

// OPTIONAL - use this method if you want the tweet to include the full image file of the OpenSea item in the tweet.
async function telegramWithImage(tweetText, imageUrl) {
  // Format our image to base64
  const processedImage = await getBase64(imageUrl);

  // Upload the item's image from OpenSea to Twitter & retrieve a reference to it
  twitterClient.post(
    "media/upload",
    { media_data: processedImage },
    (error, media, response) => {
      if (!error) {
        const tweet = {
          status: tweetText,
          media_ids: [media.media_id_string],
        };

        twitterClient.post(
          "statuses/update",
          tweet,
          (error, tweet, response) => {
            if (!error) {
              console.log(`Successfully tweeted: ${tweetText}`);
            } else {
              console.error(error);
            }
          }
        );
      } else {
        console.error(error);
      }
    }
  );
}

module.exports = {
  telegram: telegram,
  telegramWithImage: telegramWithImage,
};
