import { ethers } from "hardhat";

async function DeployBAT() {

// deploting the Bored ape tokens
  const BATtoken = await ethers.getContractFactory("BoredApeTokens");
  const BAT = await BATtoken.deploy();

  await BAT.deployed();
  console.log("BATtoken", BAT.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
DeployBAT().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});