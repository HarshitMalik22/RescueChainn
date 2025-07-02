import React, { useState, useEffect } from 'react';
import Map from '../components/Map';
import DisasterSimulator from '../components/DisasterSimulator';
import EventsTimeline from '../components/EventsTimeline';
import { Sensor, DisasterEvent, NGO } from '../types';
import { AlertTriangle, Users, DollarSign, RefreshCw } from 'lucide-react';
import { fetchSensors, fetchNGOs, fetchDisasterEvents, createDisasterEvent, updateSensorStatus } from '../utils/supabaseData';

const Dashboard: React.FC = () => {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [ngos, setNgos] = useState<NGO[]>([]);
  const [events, setEvents] = useState<DisasterEvent[]>([]);
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [sensorsData, ngosData, eventsData] = await Promise.all([
        fetchSensors(),
        fetchNGOs(),
        fetchDisasterEvents()
      ]);

      setSensors(sensorsData);
      setNgos(ngosData);
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSensorClick = (sensor: Sensor) => {
    setSelectedSensor(sensor);
  };

  const handleEventCreated = async (event: DisasterEvent) => {
    // Save to Supabase
    const savedEvent = await createDisasterEvent(event);
    
    if (savedEvent) {
      setEvents(prevEvents => [savedEvent, ...prevEvents]);
      
      // Update sensor status
      const newStatus = event.severity > 7 ? 'critical' : 'warning';
      await updateSensorStatus(event.sensorId, newStatus, event.severity, event.severity);
      
      // Update local sensor state
      setSensors(prevSensors =>
        prevSensors.map(s =>
          s.id === event.sensorId
            ? {
                ...s,
                status: newStatus,
                lastReading: event.severity,
                lastUpdated: event.timestamp,
                severity: event.severity
              }
            : s
        )
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-purple-500 border-r-cyan-500 border-b-transparent border-l-transparent mx-auto mb-4"></div>
          <p className="text-cyan-400 text-lg">Loading RescueChainn Dashboard...</p>
          <p className="text-gray-400 text-sm mt-2">Connecting to Supabase...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-400 mb-2">Connection Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-black min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold font-mono bg-gradient-to-r from-pink-500 to-yellow-500 bg-clip-text text-transparent">
              Disaster Response Dashboard
            </h1>
            <p className="mt-3 text-gray-400 font-medium">
              Monitor real-time disaster data and blockchain-powered relief fund distribution
            </p>
          </div>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
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