import React, { useState, useEffect } from 'react';
import Map from '../components/Map';
import DisasterSimulator from '../components/DisasterSimulator';
import EventsTimeline from '../components/EventsTimeline';
import { Sensor, DisasterEvent, NGO } from '../types';
import { AlertTriangle, Users, DollarSign } from 'lucide-react';

const Dashboard: React.FC = () => {
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
          transactionHash:
            '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-screen mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-black  min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-mono bg-gradient-to-r from-pink-500 to-yellow-500 bg-clip-text text-transparent">
          Disaster Response Dashboard
        </h1>
        <p className="mt-3 text-gray-400 font-medium">
          Monitor real-time disaster data and blockchain-powered relief fund distribution
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div className="bg-gray-800 overflow-hidden shadow-xl rounded-xl border border-gray-700">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-900/30 rounded-lg p-3">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-300 truncate">
                    Active Disasters
                  </dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-100">
                      {events.filter(e => !e.fundsReleased).length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 overflow-hidden shadow-xl rounded-xl border border-gray-700">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-900/30 rounded-lg p-3">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-300 truncate">
                    Registered NGOs
                  </dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-100">{ngos.length}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 overflow-hidden shadow-xl rounded-xl border border-gray-700">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-900/30 rounded-lg p-3">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-300 truncate">
                    Funds Distributed
                  </dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-100">
                      {events
                        .filter(e => e.fundsReleased)
                        .reduce((sum, e) => sum + (e.severity * 0.1), 0)
                        .toFixed(2)}{' '}
                      USDC
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Map Section */}
        <div className="lg:col-span-2 h-[600px] rounded-xl overflow-hidden border border-gray-700 shadow-xl bg-gradient-to-br from-gray-800/40 to-gray-900/60">
          <Map 
            sensors={sensors} 
            ngos={ngos} 
            events={events}
            onSensorClick={handleSensorClick}
          />
        </div>

        {/* Sidebar: Simulator */}
        <div className="space-y-6">
          <div className="border border-gray-700 rounded-xl shadow-xl overflow-hidden bg-gray-800/70 backdrop-blur-md">
            <DisasterSimulator 
              sensor={selectedSensor} 
              ngos={ngos}
              onEventCreated={handleEventCreated}
            />
          </div>
        </div>
      </div>

      {/* Events Timeline */}
      <div className="mt-8">
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl p-6">
          <EventsTimeline events={events} ngos={ngos} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
