import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("WorldMap", function () {
  // We define a fixture to reuse the same setup in every test.
  async function deployWorldMapFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount, thirdAccount] = await hre.ethers.getSigners();

    const WorldMap = await hre.ethers.getContractFactory("WorldMap");
    const worldMap = await WorldMap.deploy();

    return { worldMap, owner, otherAccount, thirdAccount };
  }

  describe("Deployment", function () {
    it("Should deploy successfully", async function () {
      const { worldMap } = await loadFixture(deployWorldMapFixture);

      expect(await worldMap.getTotalTravelItemsCount()).to.equal(0);
    });

    it("Should have no travel items initially", async function () {
      const { worldMap, owner } = await loadFixture(deployWorldMapFixture);

      expect(await worldMap.getUserTravelItemCount(owner.address)).to.equal(0);
    });
  });

  describe("Adding Travel Items", function () {
    it("Should add a flight item successfully", async function () {
      const { worldMap, owner } = await loadFixture(deployWorldMapFixture);

      const eventDate = (await time.latest()) + 86400; // Tomorrow

      await (worldMap as any).addTravelItem(
        0, // Flight
        "New York",
        "London",
        eventDate
      );

      expect(await worldMap.getTotalTravelItemsCount()).to.equal(1);
      expect(await worldMap.getUserTravelItemCount(owner.address)).to.equal(1);
    });

    it("Should add a hotel item successfully", async function () {
      const { worldMap, owner } = await loadFixture(deployWorldMapFixture);

      const eventDate = (await time.latest()) + 86400; // Tomorrow

      await (worldMap as any).addTravelItem(
        1, // Hotel
        "",
        "Paris",
        eventDate
      );

      expect(await worldMap.getTotalTravelItemsCount()).to.equal(1);
      expect(await worldMap.getUserTravelItemCount(owner.address)).to.equal(1);
    });

    it("Should add a bus item successfully", async function () {
      const { worldMap, owner } = await loadFixture(deployWorldMapFixture);

      const eventDate = (await time.latest()) + 86400; // Tomorrow

      await (worldMap as any).addTravelItem(
        2, // Bus
        "Berlin",
        "Amsterdam",
        eventDate
      );

      expect(await worldMap.getTotalTravelItemsCount()).to.equal(1);
      expect(await worldMap.getUserTravelItemCount(owner.address)).to.equal(1);
    });

    it("Should add an other type item successfully", async function () {
      const { worldMap, owner } = await loadFixture(deployWorldMapFixture);

      const eventDate = (await time.latest()) + 86400; // Tomorrow

      await (worldMap as any).addTravelItem(
        3, // Other
        "Tokyo",
        "Kyoto",
        eventDate
      );

      expect(await worldMap.getTotalTravelItemsCount()).to.equal(1);
      expect(await worldMap.getUserTravelItemCount(owner.address)).to.equal(1);
    });

    it("Should emit TravelItemAdded event", async function () {
      const { worldMap, owner } = await loadFixture(deployWorldMapFixture);

      const eventDate = (await time.latest()) + 86400; // Tomorrow

      await expect((worldMap as any).addTravelItem(0, "NYC", "LAX", eventDate))
        .to.emit(worldMap, "TravelItemAdded")
        .withArgs(
          owner.address,
          0, // First item ID
          0, // Flight
          "NYC",
          "LAX",
          eventDate
        );
    });

    it("Should allow multiple users to add items", async function () {
      const { worldMap, owner, otherAccount } = await loadFixture(
        deployWorldMapFixture
      );

      const eventDate = (await time.latest()) + 86400;

      // Owner adds an item
      await (worldMap.connect(owner) as any).addTravelItem(
        0,
        "NYC",
        "LAX",
        eventDate
      );

      // Other account adds an item
      await (worldMap.connect(otherAccount) as any).addTravelItem(
        1,
        "",
        "Paris",
        eventDate
      );

      expect(await worldMap.getTotalTravelItemsCount()).to.equal(2);
      expect(await worldMap.getUserTravelItemCount(owner.address)).to.equal(1);
      expect(
        await worldMap.getUserTravelItemCount(otherAccount.address)
      ).to.equal(1);
    });

    it("Should allow same user to add multiple items", async function () {
      const { worldMap, owner } = await loadFixture(deployWorldMapFixture);

      const eventDate = (await time.latest()) + 86400;

      await (worldMap as any).addTravelItem(0, "NYC", "LAX", eventDate);
      await (worldMap as any).addTravelItem(1, "", "Paris", eventDate + 86400);
      await (worldMap as any).addTravelItem(
        2,
        "Berlin",
        "Amsterdam",
        eventDate + 172800
      );

      expect(await worldMap.getTotalTravelItemsCount()).to.equal(3);
      expect(await worldMap.getUserTravelItemCount(owner.address)).to.equal(3);
    });
  });

  describe("Retrieving Travel Items", function () {
    it("Should retrieve travel item by ID correctly", async function () {
      const { worldMap, owner } = await loadFixture(deployWorldMapFixture);

      const eventDate = (await time.latest()) + 86400;

      await (worldMap as any).addTravelItem(0, "NYC", "LAX", eventDate);

      const item = await (worldMap as any).getTravelItemById(0);

      expect(item.id).to.equal(0);
      expect(item.user).to.equal(owner.address);
      expect(item.itemType).to.equal(0); // Flight
      expect(item.fromLocation).to.equal("NYC");
      expect(item.toLocationOrCity).to.equal("LAX");
      expect(item.eventDate).to.equal(eventDate);
      expect(item.blockTimestamp).to.be.greaterThan(0);
    });

    it("Should retrieve user travel items correctly", async function () {
      const { worldMap, owner } = await loadFixture(deployWorldMapFixture);

      const eventDate = (await time.latest()) + 86400;

      await (worldMap as any).addTravelItem(0, "NYC", "LAX", eventDate);
      await (worldMap as any).addTravelItem(1, "", "Paris", eventDate + 86400);

      const items = await (worldMap as any).getUserTravelItems(owner.address);

      expect(items.length).to.equal(2);
      expect(items[0].fromLocation).to.equal("NYC");
      expect(items[0].toLocationOrCity).to.equal("LAX");
      expect(items[1].fromLocation).to.equal("");
      expect(items[1].toLocationOrCity).to.equal("Paris");
    });

    it("Should return empty array for user with no items", async function () {
      const { worldMap, otherAccount } = await loadFixture(
        deployWorldMapFixture
      );

      const items = await (worldMap as any).getUserTravelItems(
        otherAccount.address
      );

      expect(items.length).to.equal(0);
    });

    it("Should revert when getting item by invalid ID", async function () {
      const { worldMap } = await loadFixture(deployWorldMapFixture);

      await expect((worldMap as any).getTravelItemById(999)).to.be.revertedWith(
        "WorldMapSimple: Invalid item ID"
      );
    });

    it("Should separate items by user correctly", async function () {
      const { worldMap, owner, otherAccount } = await loadFixture(
        deployWorldMapFixture
      );

      const eventDate = (await time.latest()) + 86400;

      // Owner adds items
      await (worldMap.connect(owner) as any).addTravelItem(
        0,
        "NYC",
        "LAX",
        eventDate
      );
      await (worldMap.connect(owner) as any).addTravelItem(
        1,
        "",
        "Paris",
        eventDate
      );

      // Other account adds item
      await (worldMap.connect(otherAccount) as any).addTravelItem(
        2,
        "Berlin",
        "Amsterdam",
        eventDate
      );

      const ownerItems = await (worldMap as any).getUserTravelItems(
        owner.address
      );
      const otherItems = await (worldMap as any).getUserTravelItems(
        otherAccount.address
      );

      expect(ownerItems.length).to.equal(2);
      expect(otherItems.length).to.equal(1);
      expect(ownerItems[0].user).to.equal(owner.address);
      expect(ownerItems[1].user).to.equal(owner.address);
      expect(otherItems[0].user).to.equal(otherAccount.address);
    });
  });

  describe("Counting Functions", function () {
    it("Should return correct total count", async function () {
      const { worldMap, owner, otherAccount } = await loadFixture(
        deployWorldMapFixture
      );

      const eventDate = (await time.latest()) + 86400;

      expect(await worldMap.getTotalTravelItemsCount()).to.equal(0);

      await (worldMap.connect(owner) as any).addTravelItem(
        0,
        "NYC",
        "LAX",
        eventDate
      );
      expect(await worldMap.getTotalTravelItemsCount()).to.equal(1);

      await (worldMap.connect(otherAccount) as any).addTravelItem(
        1,
        "",
        "Paris",
        eventDate
      );
      expect(await worldMap.getTotalTravelItemsCount()).to.equal(2);

      await (worldMap.connect(owner) as any).addTravelItem(
        2,
        "Berlin",
        "Amsterdam",
        eventDate
      );
      expect(await worldMap.getTotalTravelItemsCount()).to.equal(3);
    });

    it("Should return correct user-specific count", async function () {
      const { worldMap, owner, otherAccount } = await loadFixture(
        deployWorldMapFixture
      );

      const eventDate = (await time.latest()) + 86400;

      expect(await worldMap.getUserTravelItemCount(owner.address)).to.equal(0);
      expect(
        await worldMap.getUserTravelItemCount(otherAccount.address)
      ).to.equal(0);

      await (worldMap.connect(owner) as any).addTravelItem(
        0,
        "NYC",
        "LAX",
        eventDate
      );
      expect(await worldMap.getUserTravelItemCount(owner.address)).to.equal(1);
      expect(
        await worldMap.getUserTravelItemCount(otherAccount.address)
      ).to.equal(0);

      await (worldMap.connect(otherAccount) as any).addTravelItem(
        1,
        "",
        "Paris",
        eventDate
      );
      expect(await worldMap.getUserTravelItemCount(owner.address)).to.equal(1);
      expect(
        await worldMap.getUserTravelItemCount(otherAccount.address)
      ).to.equal(1);

      await (worldMap.connect(owner) as any).addTravelItem(
        2,
        "Berlin",
        "Amsterdam",
        eventDate
      );
      expect(await worldMap.getUserTravelItemCount(owner.address)).to.equal(2);
      expect(
        await worldMap.getUserTravelItemCount(otherAccount.address)
      ).to.equal(1);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle empty strings for locations", async function () {
      const { worldMap, owner } = await loadFixture(deployWorldMapFixture);

      const eventDate = (await time.latest()) + 86400;

      await (worldMap as any).addTravelItem(1, "", "", eventDate);

      const item = await (worldMap as any).getTravelItemById(0);
      expect(item.fromLocation).to.equal("");
      expect(item.toLocationOrCity).to.equal("");
    });

    it("Should handle past dates", async function () {
      const { worldMap, owner } = await loadFixture(deployWorldMapFixture);

      const pastDate = (await time.latest()) - 86400; // Yesterday

      await (worldMap as any).addTravelItem(0, "NYC", "LAX", pastDate);

      const item = await (worldMap as any).getTravelItemById(0);
      expect(item.eventDate).to.equal(pastDate);
    });

    it("Should handle very long location strings", async function () {
      const { worldMap, owner } = await loadFixture(deployWorldMapFixture);

      const longLocation = "A".repeat(1000);
      const eventDate = (await time.latest()) + 86400;

      await (worldMap as any).addTravelItem(
        0,
        longLocation,
        longLocation,
        eventDate
      );

      const item = await (worldMap as any).getTravelItemById(0);
      expect(item.fromLocation).to.equal(longLocation);
      expect(item.toLocationOrCity).to.equal(longLocation);
    });

    it("Should assign correct sequential IDs", async function () {
      const { worldMap, owner, otherAccount } = await loadFixture(
        deployWorldMapFixture
      );

      const eventDate = (await time.latest()) + 86400;

      await (worldMap.connect(owner) as any).addTravelItem(
        0,
        "NYC",
        "LAX",
        eventDate
      );
      await (worldMap.connect(otherAccount) as any).addTravelItem(
        1,
        "",
        "Paris",
        eventDate
      );
      await (worldMap.connect(owner) as any).addTravelItem(
        2,
        "Berlin",
        "Amsterdam",
        eventDate
      );

      const item0 = await (worldMap as any).getTravelItemById(0);
      const item1 = await (worldMap as any).getTravelItemById(1);
      const item2 = await (worldMap as any).getTravelItemById(2);

      expect(item0.id).to.equal(0);
      expect(item1.id).to.equal(1);
      expect(item2.id).to.equal(2);
    });
  });

  describe("Events", function () {
    it("Should emit events with correct parameters for each item type", async function () {
      const { worldMap, owner } = await loadFixture(deployWorldMapFixture);

      const eventDate = (await time.latest()) + 86400;

      // Test Flight
      await expect((worldMap as any).addTravelItem(0, "NYC", "LAX", eventDate))
        .to.emit(worldMap, "TravelItemAdded")
        .withArgs(owner.address, 0, 0, "NYC", "LAX", eventDate);

      // Test Hotel
      await expect((worldMap as any).addTravelItem(1, "", "Paris", eventDate))
        .to.emit(worldMap, "TravelItemAdded")
        .withArgs(owner.address, 1, 1, "", "Paris", eventDate);

      // Test Bus
      await expect(
        (worldMap as any).addTravelItem(2, "Berlin", "Amsterdam", eventDate)
      )
        .to.emit(worldMap, "TravelItemAdded")
        .withArgs(owner.address, 2, 2, "Berlin", "Amsterdam", eventDate);

      // Test Other
      await expect(
        (worldMap as any).addTravelItem(3, "Tokyo", "Kyoto", eventDate)
      )
        .to.emit(worldMap, "TravelItemAdded")
        .withArgs(owner.address, 3, 3, "Tokyo", "Kyoto", eventDate);
    });

    it("Should emit events for different users", async function () {
      const { worldMap, owner, otherAccount } = await loadFixture(
        deployWorldMapFixture
      );

      const eventDate = (await time.latest()) + 86400;

      await expect(
        (worldMap.connect(owner) as any).addTravelItem(
          0,
          "NYC",
          "LAX",
          eventDate
        )
      )
        .to.emit(worldMap, "TravelItemAdded")
        .withArgs(owner.address, 0, 0, "NYC", "LAX", eventDate);

      await expect(
        (worldMap.connect(otherAccount) as any).addTravelItem(
          1,
          "",
          "Paris",
          eventDate
        )
      )
        .to.emit(worldMap, "TravelItemAdded")
        .withArgs(otherAccount.address, 1, 1, "", "Paris", eventDate);
    });
  });
});
