import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, BarChart3, Shield, Users, Menu, X, ExternalLink, Newspaper, LogOut } from 'lucide-react';
import { connectWallet, getWalletAddress, isWalletConnected } from '../utils/blockchain';
import { getCurrentUser, signOut } from '../utils/supabase';
import ngoQRCode from '../assets/qrImage.jpg';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUPIModal, setShowUPIModal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkConnections = async () => {
      // Check wallet connection
      if (isWalletConnected()) {
        const address = await getWalletAddress();
        setWalletAddress(address);
      }
      
      // Check user authentication
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    
    checkConnections();
  }, []);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const result = await connectWallet();
      if (result?.success && result.address) {
        setWalletAddress(result.address);
      } else {
        setError(result?.error || 'Wallet connection failed');
      }
    } catch (err) {
      setError('Failed to connect wallet');
      console.error(err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const formatWalletAddress = (address: string) => 
    `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;

  return (
    <header className="bg-gradient-to-r from-blue-900 to-indigo-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left Section: Logo & Navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <Shield className="h-8 w-8 text-blue-300" />
                <span className="ml-2 text-xl font-bold text-white">RescueChain</span>
              </Link>
            </div>
            <nav className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location.pathname === '/' 
                    ? 'border-blue-300 text-white' 
                    : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
                }`}
              >
                <BarChart3 className="mr-1 h-5 w-5" />
                Dashboard
              </Link>
              <Link
                to="/simulator"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location.pathname === '/simulator'
                    ? 'border-blue-300 text-white'
                    : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
                }`}
              >
                <AlertTriangle className="mr-1 h-5 w-5" />
                Disaster Simulator
              </Link>
              <Link
                to="/news"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location.pathname === '/news'
                    ? 'border-blue-300 text-white'
                    : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
                }`}
              >
                <Newspaper className="mr-1 h-5 w-5" />
                News Verification
              </Link>
            </nav>
          </div>

          {/* Right Section: User, Wallet & UPI Payment */}
          <div className="hidden md:flex items-center space-x-4">
            {/* User Info */}
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-gray-300 text-sm">
                  Welcome, {user.user_metadata?.name || user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-full text-gray-300 hover:text-white hover:bg-blue-700 transition-all"
                >
                  <LogOut className="mr-1 h-4 w-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-white text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Wallet Connection */}
            {walletAddress ? (
              <div className="flex items-center bg-blue-800 px-4 py-2 rounded-full text-blue-100 text-sm">
                <span className="mr-2">{formatWalletAddress(walletAddress)}</span>
                <div className="h-2 w-2 rounded-full bg-green-400" />
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-blue-500 hover:bg-blue-600 transition-all"
              >
                {isConnecting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </>
                )}
              </button>
            )}

            {/* UPI Payment Button */}
            <button
              onClick={() => setShowUPIModal(true)}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-green-500 hover:bg-green-600 transition-all"
            >
              NGO UPI Payment
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-200 hover:text-white hover:bg-blue-700"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  location.pathname === '/'
                    ? 'bg-blue-800 border-blue-300 text-white'
                    : 'border-transparent text-gray-300 hover:bg-blue-700 hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Dashboard
                </div>
              </Link>
              <Link
                to="/simulator"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  location.pathname === '/simulator'
                    ? 'bg-blue-800 border-blue-300 text-white'
                    : 'border-transparent text-gray-300 hover:bg-blue-700 hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Disaster Simulator
                </div>
              </Link>
              <Link
                to="/news"
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  location.pathname === '/news'
                    ? 'bg-blue-800 border-blue-300 text-white'
                    : 'border-transparent text-gray-300 hover:bg-blue-700 hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Newspaper className="mr-2 h-5 w-5" />
                  News Verification
                </div>
              </Link>
              
              {/* Mobile User Section */}
              <div className="pl-3 pr-4 py-2 border-t border-gray-700 mt-2">
                {user ? (
                  <div className="space-y-2">
                    <p className="text-gray-300 text-sm">
                      Welcome, {user.user_metadata?.name || user.email}
                    </p>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-blue-700 rounded"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-blue-700 rounded"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="block px-3 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
                
                {/* Mobile Wallet Connection */}
                {walletAddress ? (
                  <div className="mt-2 inline-flex items-center bg-blue-800 px-4 py-2 rounded-full text-blue-100 text-sm">
                    {formatWalletAddress(walletAddress)}
                    <div className="ml-2 h-2 w-2 rounded-full bg-green-400" />
                  </div>
                ) : (
                  <button
                    onClick={handleConnectWallet}
                    disabled={isConnecting}
                    className="w-full mt-2 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-full hover:bg-blue-600"
                  >
                    {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded text-sm">
            {error}
          </div>
        </div>
      )}

      {/* UPI Payment Modal */}
      {showUPIModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg relative max-w-sm">
            <button
              onClick={() => setShowUPIModal(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-2xl"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4">NGO Donation QR Code</h3>
            <img
              src={ngoQRCode}
              alt="UPI QR Code"
              className="w-64 h-64 mx-auto rounded-lg border-2 border-gray-200"
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;