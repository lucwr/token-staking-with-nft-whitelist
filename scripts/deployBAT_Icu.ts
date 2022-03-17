import { ethers } from "hardhat";
import { IERC20 } from "../typechain";
const BATContract = "0x0ed64d01D0B4B655E410EF1441dD677B695639E7"
const ICU = "0x4bf010f1b9beDA5450a8dD702ED602A104ff65EE"
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