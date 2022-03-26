import { expect } from "chai";
import { ethers } from "hardhat";
import { BoredApeTokens, BuyBAT } from "../typechain";

let deployedBAT: BoredApeTokens;
let deployedICU: BuyBAT;
describe("Testing how the initial coin offering contract works", function () {
  this.beforeEach(async () => {
    // deploy bat tokens
    const a = await ethers.getContractFactory("BoredApeTokens");
    deployedBAT = await a.deploy();
    await deployedBAT.deployed();
    // deploy ICU
    const c = await ethers.getContractFactory("BuyBAT");
    deployedICU = await c.deploy(deployedBAT.address);
    await deployedICU.deployed();
  });
  it("Should increase balance of ICU after transfer", async function () {
    await deployedBAT.transfer(
      deployedICU.address,
      "100000000000000000000000000"
    );

    expect(await deployedBAT.balanceOf(deployedICU.address)).to.equal(
      "100000000000000000000000000"
    );
  });
});
