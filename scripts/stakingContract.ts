import { Signer } from "ethers";
import { ethers, network } from "hardhat";
const BATContract = "0x40a42Baf86Fc821f972Ad2aC878729063CeEF403"
const ICUContract = "0x96F3Ce39Ad2BfDCf92C0F6E2C2CAbF83874660Fc"
const BOREDAPENFTContract = "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d"
const NFTHolder = "0x720a4fab08cb746fc90e88d1924a98104c0822cf"
const NFTHolderTokenBalance = "2000000000000000000000"
async function StakingContract() {

    // deploying the staking contract
    const stakingContractPreDeployed = await ethers.getContractFactory("StakingContract");
    const stakingContract = await stakingContractPreDeployed.deploy(BOREDAPENFTContract, BATContract);
    await stakingContract.deployed();
    console.log("staking contract address", stakingContract.address);

    // introducing a staker
    // getting the ICU contract
    const ICU = await ethers.getContractAt("buyBAT", ICUContract)

    //getting the BAT contracts
    const BAT = await ethers.getContractAt("BoredApeTokens", BATContract)
    
    console.log("impersonating the staker")
    // @ts-ignore
    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [NFTHolder], // address to impersonate
    });
    const signer1: Signer = await ethers.getSigner(NFTHolder);

    console.log("setting balance of NFTHolder")
    //ts-ignore
    await network.provider.send("hardhat_setBalance", [
        NFTHolder,
        "0x56BC75E2D63100000",
    ]);

    console.log("buying the BAT tokens for the staker")
    await ICU.connect(signer1).buy({ value: "50000000000000000000" })
    console.log("balance after buying token", await BAT.connect(signer1).balanceOf(NFTHolder))

    console.log("approving tokens for Staking contract")
    await BAT.connect(signer1).approve(stakingContract.address, "500000000000000000000")

    console.log("Staking tokens")
    await stakingContract.connect(signer1).stake("100000000000000000000")

    console.log("checking all stakings balance")
    console.log(await stakingContract.connect(signer1).checkAllStakeBalance())
    console.log("balance after staking token", await BAT.connect(signer1).balanceOf(NFTHolder))

    //warping throgh time +3days


    // getTokensBack with profit after 3 days
    await stakingContract.connect(signer1).getAmount("50000000000000000000")
    //check token balance 
    console.log("balance after getting half staked token back", await BAT.connect(signer1).balanceOf(NFTHolder))

    //updating stake amount
    await BAT.connect(signer1).approve(stakingContract.address, "20000000000000000000")
    await stakingContract.connect(signer1).stake("20000000000000000000")
    console.log("balance after staking another 20 tokens", await BAT.connect(signer1).balanceOf(NFTHolder))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
StakingContract().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});