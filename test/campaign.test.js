const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");

const web3 = new Web3(ganache.provider());

const compiledFactory = require("../ethereum/build/CampaignFactory.json");
const compiledCampaign = require("../ethereum/build/Campaign.json");
const { start } = require("repl");

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode })
    .send({ from: accounts[0], gas: "1000000" });

  await factory.methods
    .createCampaign("100")
    .send({ from: accounts[0], gas: "1000000" });

  [campaignAddress] = await factory.methods.getDeployedCampaigns().call();
  campaign = await new web3.eth.Contract(
    JSON.parse(compiledCampaign.interface),
    campaignAddress
  );
});

describe("Campaigns", () => {
  it("deploys a factory", () => {
    assert.ok(factory.options.address);
  });

  it("deploys a campaign", () => {
    assert.ok(campaign.options.address);
  });

  it("marks caller as manager", async () => {
    const manager = await campaign.methods.manager().call();
    assert.strictEqual(manager, accounts[0]);
  });

  it("allows people to contribute money and marks them as approvers", async () => {
    await campaign.methods.contribute().send({
      from: accounts[1],
      value: "200",
    });
    assert(campaign.methods.approvers(accounts[1]).call());
  });

  it("requires a minimum contribution", async () => {
    try {
      await campaign.methods.contribute().send({
        from: accounts[1],
        value: "50",
      });
      assert(false);
    } catch (err) {
      assert(err);
    }
  });

  it("allows a manager to make payment request", async () => {
    await campaign.methods.contribute().send({
      from: accounts[1],
      value: "200",
    });

    await campaign.methods
      .createRequest("new test request", "150", accounts[2])
      .send({ from: accounts[0], gas: "1000000" });

    const request = await campaign.methods.requests(0).call();
    assert.strictEqual(request.description, "new test request");
  });

  it("it finishes campaign requests", async () => {
    await campaign.methods.contribute().send({
      from: accounts[1],
      value: web3.utils.toWei("10", "ether"),
    });

    await campaign.methods.contribute().send({
      from: accounts[2],
      value: web3.utils.toWei("50", "ether"),
    });

    await campaign.methods
      .createRequest(
        "Buy mooncats!",
        web3.utils.toWei("30", "ether"),
        accounts[3]
      )
      .send({ from: accounts[0], gas: "1000000" });

    await campaign.methods.approveRequest(0).send({ from: accounts[1] });
    await campaign.methods.approveRequest(0).send({ from: accounts[2] });

    const startBalanceOfOutgoingAddress = await web3.eth.getBalance(
      accounts[3]
    );
    await campaign.methods.finalizeRequest(0).send({ from: accounts[0] });
    const endBalanceOfOutgoingAddress = await web3.eth.getBalance(accounts[3]);

    const difference =
      parseFloat(web3.utils.fromWei(endBalanceOfOutgoingAddress, "ether")) -
      parseFloat(web3.utils.fromWei(startBalanceOfOutgoingAddress, "ether"));

    console.log(difference);
    assert(difference == 30);
  });
});
