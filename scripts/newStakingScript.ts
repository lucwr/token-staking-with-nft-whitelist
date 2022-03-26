/* eslint-disable no-undef */
import { Signer } from "ethers";
import { ethers, network } from "hardhat";
const BATContract = "0x0ed64d01D0B4B655E410EF1441dD677B695639E7";
const ICUContract = "0x4bf010f1b9beDA5450a8dD702ED602A104ff65EE";
const BOREDAPENFTContract = "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d";
const NFTHolder = "0x720a4fab08cb746fc90e88d1924a98104c0822cf";
// const NFTHolderTokenBalance = "2000000000000000000000";
async function StakingContract() {
  // deploying the staking contract
  const stakingContractPreDeployed = await ethers.getContractFactory(
    "NewStakingContract"
  );
  const stakingContract = await stakingContractPreDeployed.deploy(
    BOREDAPENFTContract,
    BATContract
  );
  await stakingContract.deployed();
  console.log("staking contract address", stakingContract.address);

  // introducing a staker
  // getting the ICU contract
  const ICU = await ethers.getContractAt("buyBAT", ICUContract);

  // getting the BAT contracts
  const BAT = await ethers.getContractAt("BoredApeTokens", BATContract);

  console.log("impersonating the staker");
  // @ts-ignore
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [NFTHolder], // address to impersonate
  });
  const signer1: Signer = await ethers.getSigner(NFTHolder);

  console.log("setting balance of NFTHolder");
  // ts-ignore
  await network.provider.send("hardhat_setBalance", [
    NFTHolder,
    "0x56BC75E2D63100000",
  ]);

  console.log("buying the BAT tokens for the staker");
  await ICU.connect(signer1).buy({ value: "50000000000000000000" });
  console.log(
    "balance after buying token",
    await BAT.connect(signer1).balanceOf(NFTHolder)
  );

  console.log("approving tokens for Staking contract");
  await BAT.connect(signer1).approve(
    stakingContract.address,
    "300000000000000000000"
  );

  console.log("Staking tokens");
  await stakingContract.connect(signer1).stakeTokens("300000000000000000000");

  console.log("checking all stakings balance");
  console.log(await stakingContract.connect(signer1).checkStakingBalance());
  console.log(
    "balance after staking token",
    await BAT.connect(signer1).balanceOf(NFTHolder)
  );

  // warping throgh time +3days
  // await ethers.provider.send("evm_increaseTime", [2592000])

  // getTokensBack with profit after 3 days
  await stakingContract.connect(signer1).withdraw("50000000000000000000");
  // check token balance
  console.log(
    "balance after getting half staked token back",
    await BAT.connect(signer1).balanceOf(NFTHolder)
  );

  // updating stake amount
  await BAT.connect(signer1).approve(
    stakingContract.address,
    "200000000000000000000"
  );
  await stakingContract.connect(signer1).stakeTokens("200000000000000000000");
  console.log(
    "balance after staking another 200 tokens",
    await BAT.connect(signer1).balanceOf(NFTHolder)
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
StakingContract().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
