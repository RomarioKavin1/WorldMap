// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const WorldMapModule = buildModule("WorldMapModule", (m) => {
  const worldMap = m.contract("WorldMap");

  return { worldMap };
});

export default WorldMapModule;
