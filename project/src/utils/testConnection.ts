// Define the Ethereum provider interface
interface EthereumProvider {
  isMetaMask?: boolean;
  request: (request: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
}

// Extend Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

interface ConnectionResult {
  success: boolean;
  account?: string | null;
  error?: string;
}

// Type guard to check if the response is a string array
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

export const testMetaMaskConnection = async (): Promise<ConnectionResult> => {
  try {
    console.log('Testing MetaMask connection...');
    
    // Check if window.ethereum exists
    if (!window.ethereum) {
      const errorMsg = 'MetaMask not detected! Please install the MetaMask extension.';
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }
    
    console.log('MetaMask detected');

    // Check if already connected
    const accountsResponse = await window.ethereum.request({ 
      method: 'eth_accounts' 
    });
    
    if (!isStringArray(accountsResponse)) {
      const errorMsg = 'Invalid response from MetaMask';
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }
    
    console.log('Current accounts:', accountsResponse);

    if (accountsResponse.length > 0) {
      console.log('Already connected with account:', accountsResponse[0]);
      return { 
        success: true, 
        account: accountsResponse[0] 
      };
    }

    // Try to connect
    console.log('Requesting accounts...');
    const newAccountsResponse = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    if (!isStringArray(newAccountsResponse) || newAccountsResponse.length === 0) {
      const errorMsg = 'No accounts found. Please connect an account in MetaMask.';
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }
    
    console.log('Connected with account:', newAccountsResponse[0]);
    return { 
      success: true, 
      account: newAccountsResponse[0] 
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('MetaMask connection error:', errorMessage);
    return { 
      success: false, 
      error: errorMessage 
    };
  }
};
