import React, { useState } from 'react';
import { Sensor, DisasterEvent, NGO } from '../types';
import { releaseFunds } from '../utils/blockchain';
import { sendSMS } from '../utils/twilio';
import { AlertTriangle, Droplets, Activity } from 'lucide-react';

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
        damageDone: Math.floor(severity * 1.5),
        peopleKilled: Math.floor(severity * 0.3),
      };

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

      const fundsToRelease = (severity * 0.1).toFixed(2);
      const closestNGO = relevantNGOs[0];

      const releaseResult = await releaseFunds(
        closestNGO.walletAddress,
        fundsToRelease
      );

      if (releaseResult.success) {
        newEvent.fundsReleased = true;
        newEvent.transactionHash = releaseResult.transactionHash;

        const message = `ALERT: ${sensor.type.toUpperCase()} disaster detected near your area. 
                        Severity: ${severity}/10. ${fundsToRelease} ETH has been released to 
                        your wallet. Please respond immediately.`;
        
        await sendSMS(closestNGO.phone, message);

        setResult({
          success: true,
          message: `Disaster event created. ${fundsToRelease} USDC released to ${closestNGO.name}. SMS notification sent.`,
          transactionHash: releaseResult.transactionHash,
        });

        onEventCreated(newEvent);
      } else {
        setResult({
          success: false,
          message: 'Failed to release funds. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error simulating disaster:', error);
      setResult({
        success: false,
        message: 'An error occurred while simulating the disaster.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!sensor) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Disaster Simulator</h2>
        <p className="text-gray-600">Select a sensor on the map to simulate a disaster event.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Disaster Simulator</h2>
      
      <div className="mb-4 p-4 bg-gray-100 rounded-lg">
        <div className="flex items-center mb-2">
          {sensor.type === 'flood' ? (
            <Droplets className="text-blue-500 mr-2" />
          ) : (
            <Activity className="text-orange-500 mr-2" />
          )}
          <h3 className="text-lg font-semibold">{sensor.name}</h3>
        </div>
        <p className="text-sm text-gray-600 mb-1">Type: {sensor.type}</p>
        <p className="text-sm text-gray-600 mb-1">
          Location: {sensor.location.lat.toFixed(4)}, {sensor.location.lng.toFixed(4)}
        </p>
        <p className="text-sm text-gray-600">
          Status: 
          <span className={`ml-1 font-medium ${
            sensor.status === 'normal' 
              ? 'text-green-500' 
              : sensor.status === 'warning' 
                ? 'text-orange-500' 
                : 'text-red-500'
          }`}>
            {sensor.status}
          </span>
        </p>
      </div>

      <div className="mb-4">
        <label 
          htmlFor="severity-slider" 
          className="block text-sm font-medium text-gray-700 mb-2"
          id="severity-label"
        >
          Severity Level: {severity}/10
        </label>
        <input
          id="severity-slider"
          type="range"
          min="1"
          max="10"
          value={severity}
          onChange={(e) => setSeverity(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          aria-valuemin={1}
          aria-valuemax={10}
          aria-valuenow={severity}
          aria-labelledby="severity-label"
          aria-describedby="severity-value"
        />
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div
            className={`h-2.5 rounded-full ${getSeverityColor(severity)}`}
            style={{ width: `${severity * 10}%` }}
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={10}
            aria-valuenow={severity}
          />
        </div>
        <span id="severity-value" className="sr-only">
          Current severity level: {severity} out of 10
        </span>
      </div>

      <button
        onClick={handleSimulateDisaster}
        disabled={isProcessing}
        className={`w-full py-2 px-4 rounded-md font-medium text-white ${
          isProcessing 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-red-500 hover:bg-red-600'
        }`}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Processing...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <AlertTriangle className="mr-2" size={18} />
            Trigger Disaster Event
          </span>
        )}
      </button>
      
      {result && (
        <div className={`mt-4 p-4 rounded-md ${
          result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <p>{result.message}</p>
          {result.transactionHash && (
            <a
              href={`https://mumbai.polygonscan.com/tx/${result.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline mt-2 inline-block"
            >
              View Transaction
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default DisasterSimulator;
