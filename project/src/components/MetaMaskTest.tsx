import { useEffect, useState } from 'react';
import { useMetaMask } from '../hooks/useMetaMask';

const MetaMaskTest = () => {
  const {
    isConnected,
    isConnecting,
    address,
    error,
    connect,
    disconnect
  } = useMetaMask();
  
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected) {
      setLocalError(null);
    }
  }, [isConnected]);

  useEffect(() => {
    if (error) {
      setLocalError(error);
    }
  }, [error]);

  const handleConnect = async () => {
    setLocalError(null);
    try {
      await connect();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect';
      setLocalError(errorMessage);
      console.error('Connection error:', errorMessage);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setLocalError(null);
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-gray-900 rounded-xl shadow-lg space-y-4">
      <h2 className="text-xl font-bold text-white">MetaMask Connection Test</h2>
      
      <div className="p-4 bg-gray-800 rounded-lg">
        <p className="text-gray-300">
          Status: <span className="font-medium">
            {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Disconnected'}
          </span>
        </p>
        
        {address && (
          <div className="mt-2 p-2 bg-green-900/30 border border-green-500/30 rounded">
            <p className="text-green-400 text-sm">Connected Account:</p>
            <p className="text-green-300 font-mono text-sm break-all">{address}</p>
          </div>
        )}
        
        {(error || localError) && (
          <div className="mt-2 p-2 bg-red-900/30 border border-red-500/30 rounded">
            <p className="text-red-400 text-sm">Error:</p>
            <p className="text-red-300 text-sm">{error || localError}</p>
          </div>
        )}
      </div>
      
      <div className="flex justify-center gap-2">
        {!isConnected ? (
          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
          </button>
        ) : (
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Disconnect
          </button>
        )}
      </div>
      
      <div className="mt-4 text-xs text-gray-400 space-y-1">
        <p>If you encounter issues:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Ensure MetaMask extension is installed and unlocked</li>
          <li>Check if you're on the Mumbai Testnet</li>
          <li>Try refreshing the page</li>
          <li>Check the browser console for detailed errors (F12)</li>
        </ul>
      </div>
    </div>
  );
};

export default MetaMaskTest;
