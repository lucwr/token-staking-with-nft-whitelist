/* eslint-disable no-undef */
import { expect } from "chai";
import { Signer } from "ethers";
import { ethers, network } from "hardhat";
import { BoredApeTokens, BuyBAT, NewStakingContract } from "../typechain";

let deployedBAT: BoredApeTokens;
let deployedICU: BuyBAT;
let stakingContract: NewStakingContract;
let signer1: Signer;
const BOREDAPENFTContract = "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d";
const NFTHolder = "0x720a4fab08cb746fc90e88d1924a98104c0822cf";
describe("Testing the staking contract", function () {
  this.beforeEach(async () => {
    // deploy bat tokens
    const a = await ethers.getContractFactory("BoredApeTokens");
    deployedBAT = await a.deploy();
    await deployedBAT.deployed();
    // deploy ICU
    const c = await ethers.getContractFactory("BuyBAT");
    deployedICU = await c.deploy(deployedBAT.address);
    await deployedICU.deployed();
    // transfering funds to bat_icu
    await deployedBAT.transfer(
      deployedICU.address,
      "100000000000000000000000000"
    );

    const stakingContractPreDeployed = await ethers.getContractFactory(
      "NewStakingContract"
    );
    stakingContract = await stakingContractPreDeployed.deploy(
      BOREDAPENFTContract,
      deployedBAT.address
    );
    await stakingContract.deployed();

    // impersonating the staker
    // @ts-ignore
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [NFTHolder], // address to impersonate
    });
    signer1 = await ethers.getSigner(NFTHolder);
  });

  it("Should not be able to stake if you don't have a bored ape nft", async function () {
    await expect(
      stakingContract.stakeTokens("200000000000000000000")
    ).to.revertedWith("You need to have 1 Bored Ape NFT");
  });

  it("Should not be able to stake if amount in is than 5 BAT tokens", async function () {
    await expect(
      stakingContract.connect(signer1).stakeTokens("2000000000000000000")
    ).to.revertedWith("You need  to stake > 5 BAT tokens");
  });

  it("Should not be able to stake if you have less than 5 BAT tokens", async function () {
    // approving tokens for Staking contract
    await deployedBAT
      .connect(signer1)
      .approve(stakingContract.address, "30000000000000000000000");

    await expect(
      stakingContract.connect(signer1).stakeTokens("20000000000000000000")
    ).to.revertedWith("Insuficient Balance");
  });

  it("Staker's BAT balance should increase after buying stakes from ICU", async function () {
    // "setting balance of NFTHolder
    // ts-ignore
    await network.provider.send("hardhat_setBalance", [
      NFTHolder,
      "0x56BC75E2D63100000",
    ]);

    // buying the BAT tokens for the staker"
    await deployedICU.connect(signer1).buy({ value: "50000000000000000000" });
    // balance after buying token
    expect(await deployedBAT.connect(signer1).balanceOf(NFTHolder)).to.equal(
      "2500000000000000000000"
    );
  });

  it("Staker's stake balance should equal amount staked", async function () {
    await deployedBAT
      .connect(signer1)
      .approve(stakingContract.address, "30000000000000000000000");

    // "setting balance of NFTHolder
    // ts-ignore
    await network.provider.send("hardhat_setBalance", [
      NFTHolder,
      "0x56BC75E2D63100000",
    ]);

    // buying the BAT tokens for the staker"
    await deployedICU.connect(signer1).buy({ value: "50000000000000000000" });
    // tokens bought;

    await stakingContract.connect(signer1).stakeTokens("25000000000000000000");
    // tokens staked;
    expect(
      await stakingContract.connect(signer1).checkStakingBalance()
    ).to.equal("25000000000000000000");

    expect(await deployedBAT.connect(signer1).balanceOf(NFTHolder)).to.equal(
      "2475000000000000000000"
    );
  });

  it("Staker's stake balance should increase after 3 days", async function () {
    await deployedBAT
      .connect(signer1)
      .approve(stakingContract.address, "30000000000000000000000");

    // "setting balance of NFTHolder
    // ts-ignore
    await network.provider.send("hardhat_setBalance", [
      NFTHolder,
      "0x56BC75E2D63100000",
    ]);

    // buying the BAT tokens for the staker"
    await deployedICU.connect(signer1).buy({ value: "50000000000000000000" });
    // tokens bought;

    await stakingContract.connect(signer1).stakeTokens("25000000000000000000");
    // tokens staked;

    await network.provider.send("evm_increaseTime", [259400]);
    await network.provider.send("evm_mine");

    // console.log("checking balance after 3 days");
    const balance = await stakingContract
      .connect(signer1)
      .checkStakingBalance();

    expect(Number(balance.toString())).to.greaterThan(
      Number("25000000000000000000")
    );
    // warping through time 3 days
  });

  it("Staker's stake should compound before restaking", async function () {
    await deployedBAT
      .connect(signer1)
      .approve(stakingContract.address, "30000000000000000000000000");

    // "setting balance of NFTHolder
    // ts-ignore
    await network.provider.send("hardhat_setBalance", [
      NFTHolder,
      "0x56BC75E2D63100000",
    ]);

    // buying the BAT tokens for the staker"
    await deployedICU.connect(signer1).buy({ value: "50000000000000000000" });
    // console.log("tokens bought");

    await stakingContract.connect(signer1).stakeTokens("25000000000000000000");
    // console.log("tokens staked");

    await network.provider.send("evm_increaseTime", [259400]);
    await network.provider.send("evm_mine");

    await stakingContract.connect(signer1).stakeTokens("40000000000000000000");
    const balance = await stakingContract
      .connect(signer1)
      .checkStakingBalance();

    expect(Number(balance.toString())).to.greaterThan(
      Number("65000000000000000000")
    );
    // warping through time 3 days
  });

  it("Staker's stake balance should reduce after withdrawing and his token balance should increase withdrawal amount", async function () {
    await deployedBAT
      .connect(signer1)
      .approve(stakingContract.address, "30000000000000000000000000");

    // "setting balance of NFTHolder
    // ts-ignore
    await network.provider.send("hardhat_setBalance", [
      NFTHolder,
      "0x56BC75E2D63100000",
    ]);

    // buying the BAT tokens for the staker"
    await deployedICU.connect(signer1).buy({ value: "50000000000000000000" });
    // console.log("tokens bought");

    await stakingContract.connect(signer1).stakeTokens("25000000000000000000");

    // warping through time 3 days
    await network.provider.send("evm_increaseTime", [259400]);
    await network.provider.send("evm_mine");

    await stakingContract.connect(signer1).withdraw("5000000000000000000");

    const balance = await stakingContract
      .connect(signer1)
      .checkStakingBalance();
    expect(Number(balance.toString())).to.greaterThan(
      Number("22250295000000000000")
    );
    expect(await deployedBAT.connect(signer1).balanceOf(NFTHolder)).to.equal(
      "2480000000000000000000"
    );
  });
});
