const axios = require("axios");
const _ = require("lodash");
const moment = require("moment");
const { ethers } = require("ethers");
//const tweet = require('./tweet');
const telegram = require("./telegram");
const cache = require("./cache");

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
  const openseaUrl = `<a href="${openseaLink}">#Opensea</a>`;
  const postMessage = `<b>${assetName} was bought for ${formattedEthPrice}${ethers.constants.EtherSymbol} ($${Number(formattedUsdPrice).toFixed(2)}).</b>`;
  const telegramPost = `${postMessage}\n ${assetImageUrl} \n ${openseaUrl}`;
  console.log(telegramPost);


  telegram.telegram(telegramPost);

  const tweetText = `${assetName} bought for ${formattedEthPrice}${ethers.constants.EtherSymbol} ($${Number(formattedUsdPrice).toFixed(2)}) #NFT ${openseaLink}`;
  console.log(tweetText);
  tweet.tweetWithImage(tweetText, imageUrl);

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
}, 60000);
