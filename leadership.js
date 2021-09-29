const Web3 = require('web3');

const provider = new Web3.providers.WebsocketProvider(
  "wss://mainnet.infura.io/ws/v3/cda70c3f75b44341b8fc4043c2724c88"
);
const web3 = new Web3(provider);
const CONTRACT_ABI = require("./abis/openstars.json");
const OPENSTARS_ADDR = "0xD389927d33AC5a4C437Ce27DdA0b1F17cb9eC8D9";

async function populateLeaderBoard() {
  var dict = {};

  const openstars = new web3.eth.Contract(CONTRACT_ABI, OPENSTARS_ADDR);

  const ownerContract = await openstars.methods.owner().call();
  const totalSupply = await openstars.methods.totalSupply().call();
  for (let index = 0; index < totalSupply; index++) {
    try {
      const tokenId = await openstars.methods.tokenByIndex(index).call();
      const owner = await openstars.methods.ownerOf(tokenId).call();

      const balance = await openstars.methods.balanceOf(owner).call();

      if (dict.owner === undefined) {
        dict[owner] = balance;
      } else {
        dict[owner] = dict[owner] + balance;
      }
    } catch (error) {
      console.log("index", index);
      console.error(error);
      break;
    }
  }

  console.log("<===========================>");

  for (var key in dict) {
    console.log(key + " : " + dict[key]);
  }

  // Create items array
  var items = Object.keys(dict).map(function (key) {
    return [key, dict[key]];
  });

  // Sort the array based on the second element
  items.sort(function (first, second) {
    return second[1] - first[1];
  });

  console.log("<============== Leadership Board ================>");
  console.log(items.slice(0, 10));

  console.log("<============== Leader ================>");
  console.log(items[0]);
  console.log(items[0][0]);

  return items.slice(0, 10);

  // const tokenURI = await openstars.methods.tokenURI(tokenByIndex).call();

  // console.log('tokenURI', tokenURI);
}

module.exports = {
    populateLeaderBoard: populateLeaderBoard
};

