import React, { useState, useEffect } from 'react';
import Map from '../components/Map';
import DisasterSimulator from '../components/DisasterSimulator';
import EventsTimeline from '../components/EventsTimeline';
import { Sensor, DisasterEvent, NGO } from '../types';
import { AlertTriangle, Zap, Droplets, Activity } from 'lucide-react';

const SimulatorPage: React.FC = () => {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [events, setEvents] = useState<DisasterEvent[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Mock Sensors
      const mockSensors: Sensor[] = [
        {
          id: 'sensor-1',
          name: 'Flood Sensor - Bangkok',
          type: 'flood',
          location: { lat: 13.7563, lng: 100.5018 },
          status: 'normal',
          lastReading: 2,
          lastUpdated: new Date().toISOString(),
          peopleKilled: 100000,
          severity: 8,
        },
        {
          id: 'sensor-2',
          name: 'Earthquake Sensor - Tokyo',
          type: 'earthquake',
          location: { lat: 35.6762, lng: 139.6503 },
          status: 'normal',
          lastReading: 1,
          lastUpdated: new Date().toISOString(),
          severity: 5,
          peopleKilled: 1000,
        },
        {
          id: 'sensor-3',
          name: 'Flood Sensor - Mumbai',
          type: 'flood',
          location: { lat: 19.0760, lng: 72.8777 },
          status: 'normal',
          lastReading: 3,
          lastUpdated: new Date().toISOString(),
          severity: 4,
          peopleKilled: 1000,
        },
        {
          id: 'sensor-4',
          name: 'Earthquake Sensor - San Francisco',
          type: 'earthquake',
          location: { lat: 37.7749, lng: -122.4194 },
          status: 'normal',
          lastReading: 2,
          lastUpdated: new Date().toISOString(),
          severity: 3,
          peopleKilled: 1000,
        },
        {
          id: 'sensor-5',
          name: 'Flood Sensor - Jakarta',
          type: 'flood',
          location: { lat: -6.2088, lng: 106.8456 },
          status: 'critical',
          lastReading: 6,
          lastUpdated: new Date().toISOString(),
          peopleKilled: 500000,
          severity: 7,
        },
      ];

      // Mock NGOs
      const mockNGOs: NGO[] = [
        {
          id: 'ngo-1',
          name: 'Flood Relief International',
          walletAddress: '0x1234567890123456789012345678901234567890',
          phone: '+1234567890',
          email: 'info@floodrelief.org',
          location: { lat: 13.8, lng: 100.6 },
          specialization: 'flood',
        },
        {
          id: 'ngo-2',
          name: 'Earthquake Response Team',
          walletAddress: '0x0987654321098765432109876543210987654321',
          phone: '+0987654321',
          email: 'help@earthquakeresponse.org',
          location: { lat: 35.7, lng: 139.7 },
          specialization: 'earthquake',
        },
        {
          id: 'ngo-3',
          name: 'Global Disaster Aid',
          walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
          phone: '+1122334455',
          email: 'contact@globaldisasteraid.org',
          location: { lat: 19.1, lng: 72.9 },
          specialization: 'both',
        },
      ];

      // Mock Events
      const mockEvents: DisasterEvent[] = [
        {
          id: 'event-1',
          sensorId: 'sensor-5',
          type: 'flood',
          severity: 6,
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          location: { lat: -6.2088, lng: 106.8456 },
          fundsReleased: true,
          transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          damageDone: 500000,
          peopleKilled: 10,
        },
      ];

      setSensors(mockSensors);
      setNgos(mockNGOs);
      setEvents(mockEvents);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSensorClick = (sensor: Sensor) => {
    setSelectedSensor(sensor);
  };

  const handleEventCreated = (event: DisasterEvent) => {
    setEvents(prevEvents => [event, ...prevEvents]);
    setSensors(prevSensors =>
      prevSensors.map(s =>
        s.id === event.sensorId
          ? {
              ...s,
              status: event.severity > 7 ? 'critical' : 'warning',
              lastReading: event.severity,
              lastUpdated: event.timestamp,
            }
          : s
      )
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-purple-500 border-r-cyan-500 border-b-transparent border-l-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-black min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-mono bg-gradient-to-r from-pink-500 to-yellow-500 bg-clip-text text-transparent">
          🌋 DISASTER SIMULATOR 
        </h1>
        <p className="mt-3 text-gray-400 font-medium">
          Next-gen crisis simulation interface • Powered by Web3
        </p>
      </div>

      {/* How It Works */}
      <div className="mb-8 bg-gradient-to-br from-gray-800 to-gray-900 border-l-4 border-cyan-500 p-6 rounded-2xl shadow-2xl backdrop-blur-lg">
        <div className="flex gap-4 items-start">
          <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/30">
            <AlertTriangle className="h-8 w-8 text-purple-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-cyan-200 mb-3">Simulation Protocol</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-700/30 p-4 rounded-xl border border-cyan-500/20 hover:border-cyan-400/40 transition-colors">
                <div className="flex items-center mb-3">
                  <Droplets className="h-6 w-6 text-cyan-400 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-200">Flood Systems</h3>
                </div>
                <p className="text-sm text-gray-400">
                  Simulate coastal flooding, river overflow, and tsunami scenarios with dynamic water-level modeling.
                </p>
              </div>
              <div className="bg-gray-700/30 p-4 rounded-xl border border-purple-500/20 hover:border-purple-400/40 transition-colors">
                <div className="flex items-center mb-3">
                  <Activity className="h-6 w-6 text-purple-400 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-200">Seismic Events</h3>
                </div>
                <p className="text-sm text-gray-400">
                  Test earthquake response protocols with customizable magnitude and epicenter parameters.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Map Section */}
        <div className="lg:col-span-2 h-[700px] rounded-2xl overflow-hidden border border-cyan-500/20 bg-gradient-to-br from-gray-800/40 to-gray-900/60 shadow-2xl">
          <Map 
            sensors={sensors} 
            ngos={ngos} 
            events={events}
            onSensorClick={handleSensorClick}
          />
        </div>

        {/* Sidebar: Simulator & Response Flow */}
        <div className="space-y-6">
          <div className="bg-gray-800/60 rounded-2xl border border-cyan-500/20 p-6 shadow-2xl backdrop-blur-sm">
            <DisasterSimulator 
              sensor={selectedSensor} 
              ngos={ngos}
              onEventCreated={handleEventCreated}
            />
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-purple-500/20 p-6 shadow-2xl">
            <div className="flex items-center mb-6">
              <Zap className="h-6 w-6 text-cyan-400 mr-2 animate-pulse" />
              <h3 className="text-xl font-bold text-gray-200">Response Sequence</h3>
            </div>
            <ol className="space-y-5">
              {[
                {
                  step: "1️⃣",
                  title: "Node Selection",
                  desc: "Click any sensor node on the holographic map display."
                },
                {
                  step: "2️⃣", 
                  title: "Parameters Setup",
                  desc: "Calibrate disaster intensity using the quantum slider."
                },
                {
                  step: "3️⃣",
                  title: "Simulation Init",
                  desc: "Activate crisis scenario with biometric confirmation."
                },
                {
                  step: "4️⃣",
                  title: "Auto-Protocols",
                  desc: "Observe decentralized response systems engage."
                }
              ].map((item, index) => (
                <li key={index} className="flex group">
                  <div className="flex-shrink-0 w-9 h-9 bg-cyan-500/10 rounded-lg flex items-center justify-center mr-4 border border-cyan-500/20 group-hover:border-cyan-400/40 transition-all">
                    <span className="text-xl">{item.step}</span>
                  </div>
                  <div>
                    <h4 className="text-gray-300 group-hover:text-cyan-300 transition-colors font-medium">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-400 mt-1">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-6 pt-4 border-t border-cyan-500/10">
              <p className="text-xs font-mono text-cyan-400/80">
                Real-time blockchain verification • AI-powered damage assessment • Multi-chain fund distribution
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Events Timeline */}
      <div className="mt-8">
        <EventsTimeline events={events} ngos={ngos} />
      </div>
    </div>
  );
};

export default SimulatorPage;
