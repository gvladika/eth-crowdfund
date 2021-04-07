const path = require("path");
const solc = require("solc");
const fs = require("fs-extra");

const buildPath = path.resolve(__dirname, "build");
fs.removeSync(buildPath);

const contractPath = path.resolve(__dirname, "contracts", "Campaign.sol");
const contractSource = fs.readFileSync(contractPath, "utf8");
const compiledContracts = solc.compile(contractSource, 1).contracts;

fs.ensureDirSync(buildPath);

for (let contract in compiledContracts) {
  fs.outputJSONSync(
    path.resolve(buildPath, contract.replace(":", "") + ".json"),
    compiledContracts[contract]
  );
}
