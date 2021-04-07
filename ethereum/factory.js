import web3 from "./web3";
import CampaignFactory from "./build/CampaignFactory.json";

const factory = new web3.eth.Contract(
  JSON.parse(CampaignFactory.interface),
  "0x33fbCf18EEC575c594517357B5007f1F3390240E"
);

export default factory;
