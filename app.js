const axios = require("axios");
const _ = require("lodash");
const moment = require("moment");
const { ethers } = require("ethers");
const tweet = require('./tweet');
const telegram = require("./telegram");
const leadership = require("./leadership");
const cache = require("./cache");

const MINUTE = 60000; // In Millisecodns

// Format tweet text
function formatAndSendTweet(event) {
  // Handle both individual items + bundle sales
  const assetName = _.get(
    event,
    ["asset", "name"],
    _.get(event, ["asset_bundle", "name"])
  );
  const openseaLink = _.get(
    event,
    ["asset", "permalink"],
    _.get(event, ["asset_bundle", "permalink"])
  );

  const imageUrl = _.get(event, ["asset", "image_url"]);

  const totalPrice = _.get(event, "total_price");

  const tokenDecimals = _.get(event, ["payment_token", "decimals"]);
  const tokenUsdPrice = _.get(event, ["payment_token", "usd_price"]);
  const tokenEthPrice = _.get(event, ["payment_token", "eth_price"]);

  const formattedUnits = ethers.utils.formatUnits(totalPrice, tokenDecimals);
  const formattedEthPrice = formattedUnits * tokenEthPrice;
  const formattedUsdPrice = formattedUnits * tokenUsdPrice;

  const assetImageUrl = `<a href="${imageUrl}">#NFT</a>`;
  const openseaUrl = `<a href="${openseaLink}">#NFTCommunity</a>`;
  const postMessage = `<b>${assetName} was bought for ${formattedEthPrice}${
    ethers.constants.EtherSymbol
  } ($${Number(formattedUsdPrice).toFixed(2)}). Its new owner now has benefits and extra rewards on <a href="https://play.openstars.org">https://play.openstars.org</a> </b> `;
  const telegramPost = `${postMessage}\n ${assetImageUrl} \n ${openseaUrl}`;
  console.log(telegramPost);

  telegram.telegram(telegramPost);

  const reTweetText = "Like, retweet and comment with your ETH address and tag two friends for a chance to win $10 worth of xOSM";
  const tweetText = `Someone just bought ${assetName} for ${formattedEthPrice}${
    ethers.constants.EtherSymbol
  } ($${Number(formattedUsdPrice).toFixed(
    2
  )}). 
  They will earn more rewards at https://play.openstars.org. 
  ${reTweetText} 
  #NFTCommunity
  #NFTGiveaway
  #NFTGaming
  #Opensea 
  ${openseaLink}`;
  console.log(tweetText);
  tweet.tweetWithImage(tweetText, imageUrl);

  return true;
}

function formatLeaderBoard() {
  let telegramPost = `\n\n          LeaderBoard          \n`;
  telegramPost = telegramPost.concat(
    `---------------------------------------------\n`
  );
  telegramPost = telegramPost.concat(` Sl&#9;| Accounts&#9;| Openstars\n`);
  telegramPost = telegramPost.concat(
    `---------------------------------------------\n`
  );

  leadership.populateLeaderBoard().then((leaderboard) => {
    let index = 1;
    leaderboard.forEach((leader) => {
      telegramPost = telegramPost.concat(
        `${index}&#9;| ${leader[0].slice(0, 5)}...${leader[0].slice(
          leader[0].length - 6,
          leader[0].length - 1
        )}&#9;| ${leader[1]} \n`
      );
      index++;
    });

    telegramPost = telegramPost.concat(
      `---------------------------------------------\n`
    );

    console.log("Leader Board", telegramPost);

    telegram.telegram(telegramPost);
  });

  return true;
}

// Poll OpenSea every 60 seconds & retrieve all sales for a given collection in either the time since the last sale OR in the last minute
setInterval(() => {
  const lastSaleTime =
    cache.get("lastSaleTime", null) ||
    moment().startOf("minute").subtract(59, "seconds").unix();

  console.log(
    `Last sale (in seconds since Unix epoch): ${cache.get(
      "lastSaleTime",
      null
    )}`
  );

  axios
    .get("https://api.opensea.io/api/v1/events", {
      params: {
        collection_slug: process.env.OPENSEA_COLLECTION_SLUG,
        event_type: "successful",
        occurred_after: lastSaleTime,
        only_opensea: "false",
      },
    })
    .then((response) => {
      const events = _.get(response, ["data", "asset_events"]);

      const sortedEvents = _.sortBy(events, function (event) {
        const created = _.get(event, "created_date");

        return new Date(created);
      });

      console.log(`${events.length} sales since the last one...`);

      _.each(sortedEvents, (event) => {
        const created = _.get(event, "created_date");

        cache.set("lastSaleTime", moment(created).unix());

        return formatAndSendTweet(event);
      });
    })
    .catch((error) => {
      console.error(error);
    });
}, 30 * MINUTE);

setInterval(() => {
  return formatLeaderBoard();
}, 24 * 60 * MINUTE);
