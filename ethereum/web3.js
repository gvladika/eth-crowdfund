import Web3 from "web3";

let web3;

if (typeof window !== "undefined" && typeof window.web3 !== "undefined") {
  window.ethereum.enable();
  web3 = new Web3(window.web3.currentProvider);
} else {
  const provider = new Web3.providers.HttpProvider(
    "https://rinkeby.infura.io/v3/d0cc9e9edac0464a83c9b6b7dcd4390a"
  );

  web3 = new Web3(provider);
}

export default web3;
