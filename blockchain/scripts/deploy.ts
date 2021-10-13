import { ethers } from "hardhat";
import { Namer__factory } from "../typechain/factories/Namer__factory";

async function main() {
  const namer = await (<Namer__factory>(
    await ethers.getContractFactory("Namer")
  )).deploy();

  await namer.deployed();

  console.log(`Contract deployed to: "${namer.address}"`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
