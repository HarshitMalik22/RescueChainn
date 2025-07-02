import React, { useState } from 'react';
import { Sensor, DisasterEvent, NGO } from '../types';
import { releaseFunds, releaseUSDC } from '../utils/blockchain';
import { sendSMS } from '../utils/twilio';
import { AlertTriangle, Droplets, Activity, DollarSign, Zap } from 'lucide-react';

interface DisasterSimulatorProps {
  sensor: Sensor | null;
  ngos: NGO[];
  onEventCreated: (event: DisasterEvent) => void;
}

const DisasterSimulator: React.FC<DisasterSimulatorProps> = ({ 
  sensor, 
  ngos,
  onEventCreated 
}) => {
  const [severity, setSeverity] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fundType, setFundType] = useState<'MATIC' | 'USDC'>('USDC');
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    transactionHash?: string;
  } | null>(null);

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return 'bg-green-500';
    if (severity <= 6) return 'bg-yellow-500';
    if (severity <= 8) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getSeverityLabel = (severity: number) => {
    if (severity <= 3) return 'Low Risk';
    if (severity <= 6) return 'Moderate';
    if (severity <= 8) return 'High Risk';
    return 'Critical';
  };

  const calculateFundAmount = (severity: number) => {
    // Base amount increases with severity
    const baseAmount = severity * 0.1;
    return Math.max(0.1, baseAmount).toFixed(2);
  };

  const handleSimulateDisaster = async () => {
    if (!sensor) return;

    setIsProcessing(true);
    setResult(null);

    try {
      const newEvent: DisasterEvent = {
        id: `event-${Date.now()}`,
        sensorId: sensor.id,
        type: sensor.type,
        severity,
        timestamp: new Date().toISOString(),
        location: sensor.location,
        fundsReleased: false,
        damageDone: Math.floor(severity * 1.5 * 100000), // Damage in USD
        peopleKilled: Math.floor(severity * 0.3),
      };

      // Find relevant NGOs based on disaster type and proximity
      const relevantNGOs = ngos.filter(
        ngo => ngo.specialization === sensor.type || ngo.specialization === 'both'
      );

      if (relevantNGOs.length === 0) {
        setResult({
          success: false,
          message: 'No relevant NGOs found for this disaster type.',
        });
        setIsProcessing(false);
        return;
      }

      // Select the closest NGO (simplified - in reality would use geolocation)
      const closestNGO = relevantNGOs[0];
      const fundsToRelease = calculateFundAmount(severity);

      // Choose release function based on fund type
      const releaseResult = fundType === 'USDC' 
        ? await releaseUSDC(closestNGO.walletAddress, fundsToRelease)
        : await releaseFunds(closestNGO.walletAddress, fundsToRelease);

      if (releaseResult.success) {
        newEvent.fundsReleased = true;
        newEvent.transactionHash = releaseResult.transactionHash;

        // Send SMS notification
        const message = `🚨 DISASTER ALERT 🚨
${sensor.type.toUpperCase()} detected at ${sensor.name}
Severity: ${severity}/10 (${getSeverityLabel(severity)})
Funds Released: ${fundsToRelease} ${fundType}
Location: ${sensor.location.lat.toFixed(4)}, ${sensor.location.lng.toFixed(4)}
Please respond immediately. Transaction: ${releaseResult.transactionHash?.substring(0, 10)}...`;
        
        await sendSMS(closestNGO.phone, message);

        setResult({
          success: true,
          message: `✅ Emergency Response Activated!
• ${fundsToRelease} ${fundType} released to ${closestNGO.name}
• SMS alert sent to response team
• Blockchain transaction confirmed`,
          transactionHash: releaseResult.transactionHash,
        });

        onEventCreated(newEvent);
      } else {
        setResult({
          success: false,
          message: `❌ Fund Release Failed: ${releaseResult.error || 'Unknown error'}`,
        });
      }
    } catch (error) {
      console.error('Error simulating disaster:', error);
      setResult({
        success: false,
        message: '❌ Simulation failed. Please check your wallet connection and try again.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!sensor) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-cyan-500/20 shadow-2xl">
        <div className="text-center">
          <div className="p-4 bg-cyan-500/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-cyan-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-200 mb-2">Disaster Simulator</h2>
          <p className="text-gray-400">Select a sensor node on the map to begin crisis simulation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl border border-cyan-500/20 shadow-2xl">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-cyan-500/10 rounded-lg mr-3">
          <Zap className="h-6 w-6 text-cyan-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-200">Crisis Simulator</h2>
      </div>
      
      {/* Selected Sensor Info */}
      <div className="mb-6 p-4 bg-gray-700/30 rounded-xl border border-gray-600/30">
        <div className="flex items-center mb-3">
          {sensor.type === 'flood' ? (
            <Droplets className="text-blue-400 mr-2 h-5 w-5" />
          ) : (
            <Activity className="text-orange-400 mr-2 h-5 w-5" />
          )}
          <h3 className="text-lg font-semibold text-gray-200">{sensor.name}</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-400">Type:</span>
            <span className="ml-2 text-gray-200 capitalize">{sensor.type}</span>
          </div>
          <div>
            <span className="text-gray-400">Status:</span>
            <span className={`ml-2 font-medium ${
              sensor.status === 'normal' 
                ? 'text-green-400' 
                : sensor.status === 'warning' 
                  ? 'text-orange-400' 
                  : 'text-red-400'
            }`}>
              {sensor.status.toUpperCase()}
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-400">Coordinates:</span>
            <span className="ml-2 text-gray-200 font-mono text-xs">
              {sensor.location.lat.toFixed(4)}, {sensor.location.lng.toFixed(4)}
            </span>
          </div>
        </div>
      </div>

      {/* Fund Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Emergency Fund Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFundType('USDC')}
            className={`p-3 rounded-lg border transition-all ${
              fundType === 'USDC'
                ? 'border-green-500 bg-green-500/10 text-green-400'
                : 'border-gray-600 bg-gray-700/30 text-gray-400 hover:border-gray-500'
            }`}
          >
            <DollarSign className="h-5 w-5 mx-auto mb-1" />
            <span className="text-sm font-medium">USDC</span>
            <p className="text-xs opacity-75">Stable Coin</p>
          </button>
          <button
            onClick={() => setFundType('MATIC')}
            className={`p-3 rounded-lg border transition-all ${
              fundType === 'MATIC'
                ? 'border-purple-500 bg-purple-500/10 text-purple-400'
                : 'border-gray-600 bg-gray-700/30 text-gray-400 hover:border-gray-500'
            }`}
          >
            <Zap className="h-5 w-5 mx-auto mb-1" />
            <span className="text-sm font-medium">MATIC</span>
            <p className="text-xs opacity-75">Native Token</p>
          </button>
        </div>
      </div>

      {/* Severity Control */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm font-medium text-gray-300">
            Disaster Severity
          </label>
          <div className="text-right">
            <span className="text-lg font-bold text-gray-200">{severity}/10</span>
            <p className="text-xs text-gray-400">{getSeverityLabel(severity)}</p>
          </div>
        </div>
        
        <input
          type="range"
          min="1"
          max="10"
          value={severity}
          onChange={(e) => setSeverity(Number(e.target.value))}
          className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
        
        <div className="w-full bg-gray-700 rounded-full h-3 mt-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${getSeverityColor(severity)}`}
            style={{ width: `${severity * 10}%` }}
          />
        </div>
        
        <div className="mt-3 p-3 bg-gray-700/30 rounded-lg">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Estimated Damage:</span>
            <span className="text-gray-200 font-medium">
              ${(severity * 1.5 * 100000).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-400">Fund Release:</span>
            <span className="text-gray-200 font-medium">
              {calculateFundAmount(severity)} {fundType}
            </span>
          </div>
        </div>
      </div>

      {/* Trigger Button */}
      <button
        onClick={handleSimulateDisaster}
        disabled={isProcessing}
        className={`w-full py-4 px-6 rounded-xl font-medium text-white transition-all ${
          isProcessing 
            ? 'bg-gray-600 cursor-not-allowed' 
            : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-xl'
        }`}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Initiating Emergency Protocol...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <AlertTriangle className="mr-2 h-5 w-5" />
            🚨 TRIGGER DISASTER EVENT
          </span>
        )}
      </button>
      
      {/* Result Display */}
      {result && (
        <div className={`mt-6 p-4 rounded-xl border ${
          result.success 
            ? 'bg-green-900/20 border-green-500/30 text-green-300' 
            : 'bg-red-900/20 border-red-500/30 text-red-300'
        }`}>
          <div className="whitespace-pre-line text-sm">
            {result.message}
          </div>
          {result.transactionHash && (
            <a
              href={`https://mumbai.polygonscan.com/tx/${result.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center mt-3 text-blue-400 hover:text-blue-300 text-sm"
            >
              <span>View on PolygonScan</span>
              <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default DisasterSimulator;