import { ethers } from "hardhat";
import { IERC20 } from "../typechain";
const BATContract = "0x40a42Baf86Fc821f972Ad2aC878729063CeEF403"
const ICU = "0x96F3Ce39Ad2BfDCf92C0F6E2C2CAbF83874660Fc"
async function DeployBAT_ICU() {

// deploting the Bored ape tokens Initial coin offering 
  const BAT_ICU_Contract = await ethers.getContractFactory("buyBAT");
  const BAT_ICU = await BAT_ICU_Contract.deploy(BATContract);
  await BAT_ICU.deployed();

  const BATToken = await ethers.getContractAt("IERC20", BATContract)
  await BATToken.transfer(BAT_ICU.address, "100000000000000000000000000")
  console.log(await BATToken.balanceOf(BAT_ICU.address));
  console.log("BAT_ICU_Contract", BAT_ICU.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
DeployBAT_ICU().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});