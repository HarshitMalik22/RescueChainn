import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, BarChart3, Shield, Menu, X, ExternalLink, Newspaper, LogOut, User } from 'lucide-react';
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
    <header className="bg-gradient-to-r from-gray-900 via-black to-gray-800 shadow-2xl border-b border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left Section: Logo & Navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center group">
                <div className="relative">
                  <Shield className="h-8 w-8 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                  <div className="absolute inset-0 h-8 w-8 bg-cyan-400/20 rounded-full animate-pulse group-hover:animate-none"></div>
                </div>
                <span className="ml-3 text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  RescueChain
                </span>
              </Link>
            </div>
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all ${
                  location.pathname === '/' 
                    ? 'border-cyan-400 text-cyan-400 shadow-lg shadow-cyan-400/20' 
                    : 'border-transparent text-gray-300 hover:text-cyan-300 hover:border-gray-500'
                }`}
              >
                <BarChart3 className="mr-2 h-5 w-5" />
                Dashboard
              </Link>
              <Link
                to="/simulator"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all ${
                  location.pathname === '/simulator'
                    ? 'border-cyan-400 text-cyan-400 shadow-lg shadow-cyan-400/20'
                    : 'border-transparent text-gray-300 hover:text-cyan-300 hover:border-gray-500'
                }`}
              >
                <AlertTriangle className="mr-2 h-5 w-5" />
                Disaster Simulator
              </Link>
              <Link
                to="/news"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all ${
                  location.pathname === '/news'
                    ? 'border-cyan-400 text-cyan-400 shadow-lg shadow-cyan-400/20'
                    : 'border-transparent text-gray-300 hover:text-cyan-300 hover:border-gray-500'
                }`}
              >
                <Newspaper className="mr-2 h-5 w-5" />
                News Intelligence
              </Link>
            </nav>
          </div>

          {/* Right Section: User, Wallet & UPI Payment */}
          <div className="hidden md:flex items-center space-x-4">
            {/* User Info */}
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-gray-800/50 px-3 py-2 rounded-lg border border-gray-700/50">
                  <User className="h-4 w-4 text-cyan-400" />
                  <span className="text-gray-300 text-sm">
                    {user.user_metadata?.name || user.email?.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center px-3 py-2 border border-gray-600 text-sm font-medium rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 hover:border-gray-500 transition-all"
                >
                  <LogOut className="mr-1 h-4 w-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-300 hover:text-cyan-300 text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Wallet Connection */}
            {walletAddress ? (
              <div className="flex items-center bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 px-4 py-2 rounded-lg text-green-300 text-sm">
                <div className="h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse" />
                <span className="font-mono">{formatWalletAddress(walletAddress)}</span>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                disabled={isConnecting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
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
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all"
            >
              NGO Donation
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-700/50">
            <div className="pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className={`block pl-3 pr-4 py-3 border-l-4 text-base font-medium transition-all ${
                  location.pathname === '/'
                    ? 'bg-gray-800 border-cyan-400 text-cyan-400'
                    : 'border-transparent text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <BarChart3 className="mr-3 h-5 w-5" />
                  Dashboard
                </div>
              </Link>
              <Link
                to="/simulator"
                className={`block pl-3 pr-4 py-3 border-l-4 text-base font-medium transition-all ${
                  location.pathname === '/simulator'
                    ? 'bg-gray-800 border-cyan-400 text-cyan-400'
                    : 'border-transparent text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <AlertTriangle className="mr-3 h-5 w-5" />
                  Disaster Simulator
                </div>
              </Link>
              <Link
                to="/news"
                className={`block pl-3 pr-4 py-3 border-l-4 text-base font-medium transition-all ${
                  location.pathname === '/news'
                    ? 'bg-gray-800 border-cyan-400 text-cyan-400'
                    : 'border-transparent text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Newspaper className="mr-3 h-5 w-5" />
                  News Intelligence
                </div>
              </Link>
              
              {/* Mobile User Section */}
              <div className="pl-3 pr-4 py-3 border-t border-gray-700 mt-2">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-gray-300">
                      <User className="h-4 w-4 text-cyan-400" />
                      <span className="text-sm">
                        {user.user_metadata?.name || user.email?.split('@')[0]}
                      </span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      className="block px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="block px-3 py-2 text-sm text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded transition-all"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
                
                {/* Mobile Wallet Connection */}
                {walletAddress ? (
                  <div className="mt-3 inline-flex items-center bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 px-3 py-2 rounded-lg text-green-300 text-sm">
                    <div className="h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse" />
                    <span className="font-mono">{formatWalletAddress(walletAddress)}</span>
                  </div>
                ) : (
                  <button
                    onClick={handleConnectWallet}
                    disabled={isConnecting}
                    className="w-full mt-3 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
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
          <div className="bg-red-900/20 border border-red-500/30 text-red-300 p-4 rounded-lg text-sm">
            {error}
          </div>
        </div>
      )}

      {/* UPI Payment Modal */}
      {showUPIModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl border border-gray-700/50 shadow-2xl relative max-w-sm mx-4">
            <button
              onClick={() => setShowUPIModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl transition-colors"
            >
              &times;
            </button>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-white mb-2">NGO Donation</h3>
              <p className="text-gray-400 mb-6">Scan QR code to donate via UPI</p>
              <img
                src={ngoQRCode}
                alt="UPI QR Code"
                className="w-64 h-64 mx-auto rounded-xl border-2 border-gray-600 shadow-lg"
              />
              <p className="text-sm text-gray-500 mt-4">
                Secure payment powered by UPI
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;