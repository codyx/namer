import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Namer, Namer__factory } from "../typechain";

describe("Namer", () => {
  let namer: Namer;
  let testAccount: SignerWithAddress;
  let testAccountAddr: string;
  let accounts: SignerWithAddress[];

  const NAME_TO_SET = "Alice";

  before(async () => {
    accounts = await ethers.getSigners();
    testAccount = accounts[0];
    testAccountAddr = await testAccount.getAddress();

    namer = await (<Namer__factory>await ethers.getContractFactory("Namer"))
      .connect(testAccount)
      .deploy();

    await namer.deployed();
  });

  it("Should register a new unique name", async () => {
    await namer.setName(NAME_TO_SET);

    const nameSet = await namer.readName(testAccountAddr);
    expect(nameSet).to.equal(NAME_TO_SET);
  });

  it("Should prevent a user to set the same name again", async () => {
    await expect(namer.setName(NAME_TO_SET)).to.be.revertedWith(
      "Name already set"
    );
  });

  it("Should append a number suffix when attempting to register a taken name", async () => {
    for (let idx = 1; idx <= 5; ++idx) {
      await namer.connect(accounts[idx]).setName(NAME_TO_SET);

      const nameSet = await namer.readName(await accounts[idx].getAddress());
      expect(nameSet).to.equal(`${NAME_TO_SET}${idx}`);
    }
  });
});
