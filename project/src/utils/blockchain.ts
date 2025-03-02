import { ethers } from 'ethers';

// Simplified ABI for DAO contract (without voting-related functions)
const daoABI = [
  "function release(address recipient, uint256 amount) external returns (bool)"
];

// Minimal ERC20 ABI for USDC
const usdcABI = [
  "function transfer(address recipient, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)"
];

// Replace these with your actual contract addresses on Polygon Mumbai.
// For testing purposes, these dummy addresses are valid hexadecimal addresses.
const daoContractAddress = '0x1111111111111111111111111111111111111111';
const usdcContractAddress = '0x2222222222222222222222222222222222222222';

let provider: ethers.JsonRpcProvider;
let daoContract: ethers.Contract;
let usdcContract: ethers.Contract;
let signer: ethers.Signer | null = null;
let isConnected = false;

export const initBlockchain = async () => {
  try {
    // Connect to the Polygon Mumbai testnet
    provider = new ethers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com');

    // Initialize DAO and USDC contracts in read-only mode
    daoContract = new ethers.Contract(daoContractAddress, daoABI, provider);
    usdcContract = new ethers.Contract(usdcContractAddress, usdcABI, provider);

    return { provider, daoContract, usdcContract };
  } catch (error) {
    console.error('Failed to initialize blockchain connection:', error);
    throw error;
  }
};

export const connectWallet = async () => {
  try {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    // Request account access from MetaMask
    const accounts = (await window.ethereum.request({ method: 'eth_requestAccounts' })) as string[];
    if (accounts.length === 0) throw new Error('No accounts found');

    // Create ethers provider and signer using MetaMask's provider
    const ethersProvider = new ethers.BrowserProvider(window.ethereum);
    signer = await ethersProvider.getSigner();

    // Reinitialize contracts with the signer for write operations
    daoContract = new ethers.Contract(daoContractAddress, daoABI, signer);
    usdcContract = new ethers.Contract(usdcContractAddress, usdcABI, signer);
    isConnected = true;

    // Listen for account changes and reload the page
    window.ethereum.on('accountsChanged', () => {
      window.location.reload();
    });

    return {
      success: true,
      address: accounts[0],
    };
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const isWalletConnected = () => isConnected;

export const getWalletAddress = async () => {
  if (!signer) return null;
  return await signer.getAddress();
};

export const releaseFunds = async (recipient: string, amount: string) => {
  try {
    if (!daoContract || !signer) {
      throw new Error('Wallet not connected');
    }

    // Convert the amount to a BigNumber assuming 18 decimals.
    const amountInWei = ethers.parseUnits(amount, 18);

    const tx = await daoContract.release(recipient, amountInWei);
    await tx.wait();

    return {
      success: true,
      transactionHash: tx.hash,
    };
  } catch (error) {
    console.error('Failed to release funds:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : error,
    };
  }
};

export const releaseUSDC = async (recipient: string, amount: string) => {
  try {
    if (!usdcContract || !signer) {
      throw new Error('Wallet not connected');
    }

    // Convert the amount to USDC's smallest unit (USDC typically has 6 decimals)
    const amountInUnits = ethers.parseUnits(amount, 6);

    const tx = await usdcContract.transfer(recipient, amountInUnits);
    await tx.wait();

    return {
      success: true,
      transactionHash: tx.hash,
    };
  } catch (error) {
    console.error('Failed to release USDC funds:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : error,
    };
  }
};
