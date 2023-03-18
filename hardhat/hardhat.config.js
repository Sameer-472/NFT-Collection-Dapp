require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: ".env" });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks: {
    goerli: {
      url: process.env.QUICKNODE_HTTP_URL,
      accounts: ["84b6f42c488a4d788343c142733e89b8f32149d6060798fbf181d63f42af64c1"]
    }
  }
};
