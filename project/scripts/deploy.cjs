const hre = require("hardhat");

async function main() {
  console.log("Deploying RescueDAO contract...");
  
  // Get the deployer's address
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  // Deploy USDC Mock Token first (for testing)
  console.log("Deploying USDC Mock Token...");
  const USDCMock = await hre.ethers.getContractFactory("USDCMock");
  const usdcMock = await USDCMock.deploy();
  await usdcMock.waitForDeployment();
  const usdcAddress = await usdcMock.getAddress();
  console.log(`USDC Mock Token deployed to: ${usdcAddress}`);
  
  // Deploy RescueDAO contract
  console.log("Deploying RescueDAO...");
  const RescueDAO = await hre.ethers.getContractFactory("RescueDAO");
  const rescueDAO = await RescueDAO.deploy(usdcAddress);
  await rescueDAO.waitForDeployment();
  const rescueDAOAddress = await rescueDAO.getAddress();
  
  console.log(`RescueDAO deployed to: ${rescueDAOAddress}`);
  
  // Mint some test USDC to the DAO
  const mintAmount = hre.ethers.parseUnits("10000", 6); // 10,000 USDC
  console.log(`Minting 10,000 USDC to RescueDAO...`);
  await usdcMock.mint(rescueDAOAddress, mintAmount);
  console.log(`Successfully minted 10,000 USDC to RescueDAO`);
  
  console.log("\nDeployment completed! Update your .env file with these addresses:");
  console.log(`VITE_DAO_CONTRACT_ADDRESS=${rescueDAOAddress}`);
  console.log(`VITE_USDC_CONTRACT_ADDRESS=${usdcAddress}`);
  
  // Verify contracts on Polygonscan
  if (process.env.POLYGONSCAN_API_KEY) {
    console.log("\nVerifying contracts on Polygonscan...");
    try {
      await hre.run("verify:verify", {
        address: usdcAddress,
        constructorArguments: [],
      });
      
      await hre.run("verify:verify", {
        address: rescueDAOAddress,
        constructorArguments: [usdcAddress],
      });
    } catch (error) {
      console.error("Verification failed:", error);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
