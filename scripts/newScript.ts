import { ethers } from "hardhat";

async function Lesson() {

    // We get the contract to deploy
    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy("Hello, Hardhat!");

    await greeter.deployed();

    const ICU = await ethers.getContractAt("Greeter", ICUContract)
    console.log("Greeter deployed to:", greeter.address);

    //@ts-ignore
    await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [NFTHolder], // address to impersonate
    });
    const signer1: Signer = await ethers.getSigner(NFTHolder);
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
Lesson().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});