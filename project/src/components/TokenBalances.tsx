import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { 
  getTokenBalance, 
  getSupportedTokens, 
  getTokenInfo, 
  getMATICBalance,
  TESTNET_TOKENS
} from '../utils/blockchain';

interface TokenBalance {
  symbol: string;
  name: string;
  balance: string;
  logoURI: string;
  formattedBalance: string;
}

const TokenBalances: React.FC = () => {
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const supportedTokens = getSupportedTokens();
      const balancePromises = supportedTokens.map(async (token) => {
        const balance = await getTokenBalance(token.address);
        return {
          symbol: token.symbol,
          name: token.name,
          balance,
          logoURI: token.logoURI,
          formattedBalance: parseFloat(balance).toFixed(4)
        };
      });

      // Add MATIC balance
      const maticBalance = await getMATICBalance();
      const maticToken = {
        symbol: 'MATIC',
        name: 'Matic',
        balance: maticBalance,
        logoURI: 'https://cryptologos.cc/logos/polygon-matic-logo.png',
        formattedBalance: parseFloat(maticBalance).toFixed(4)
      };

      const tokenBalances = await Promise.all(balancePromises);
      setBalances([maticToken, ...tokenBalances]);
    } catch (err) {
      console.error('Error fetching token balances:', err);
      setError('Failed to load token balances. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
    
    // Refresh balances every 30 seconds
    const interval = setInterval(fetchBalances, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchBalances();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 text-sm font-medium text-red-700 hover:text-red-600"
            >
              Try again →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Token Balances</h3>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
      <div className="bg-white overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {balances.map((token, index) => (
            <li key={index} className="px-6 py-4">
              <div className="flex items-center">
                <img className="h-10 w-10 rounded-full" src={token.logoURI} alt={`${token.name} logo`} />
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">{token.name}</div>
                  <div className="text-sm text-gray-500">{token.symbol}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-sm font-medium text-gray-900">{token.formattedBalance}</div>
                  <div className="text-sm text-gray-500">${(parseFloat(token.balance) * 1).toFixed(2)}</div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-gray-50 px-4 py-4 sm:px-6 text-sm text-gray-500 border-t border-gray-200">
        Connected to Polygon Amoy Testnet
      </div>
    </div>
  );
};

export default TokenBalances;
