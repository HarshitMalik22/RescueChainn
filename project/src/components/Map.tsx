import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Sensor, NGO, DisasterEvent } from '../types';
// import { AlertTriangle, Droplets, Activity } from 'lucide-react';

// Fix for Leaflet marker icons in React
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
  sensors: Sensor[];
  ngos: NGO[];
  events: DisasterEvent[];
  onSensorClick: (sensor: Sensor) => void;
}

const Map: React.FC<MapProps> = ({ sensors, ngos, events, onSensorClick }) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0]);
  const [zoom, setZoom] = useState(2);

  useEffect(() => {
    // If we have sensors, center the map on the first one
    if (sensors.length > 0) {
      setMapCenter([sensors[0].location.lat, sensors[0].location.lng]);
      setZoom(5);
    }
  }, [sensors]);

  const getSensorIcon = (type: 'flood' | 'earthquake', status: 'normal' | 'warning' | 'critical') => {
    const color = status === 'normal' ? 'green' : status === 'warning' ? 'orange' : 'red';
    
    return L.divIcon({
      html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">
        ${type === 'flood' ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>' : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h1"></path><path d="M7 12h1"></path><path d="M12 2v1"></path><path d="M12 7v1"></path><path d="M12 12v1"></path><path d="M12 17v1"></path><path d="M12 22v1"></path><path d="M17 12h1"></path><path d="M22 12h1"></path><path d="m4.93 4.93.7.7"></path><path d="m19.07 4.93-.7.7"></path><path d="m15.12 15.12-.7.7"></path><path d="m4.93 19.07.7-.7"></path></svg>'}
      </div>`,
      className: '',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  const getNGOIcon = (specialization: 'flood' | 'earthquake' | 'both') => {
    const color = specialization === 'flood' ? 'blue' : specialization === 'earthquake' ? 'purple' : 'teal';
    
    return L.divIcon({
      html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
      </div>`,
      className: '',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
  };

  const getEventCircle = (event: DisasterEvent) => {
    const color = event.type === 'flood' ? 'blue' : 'orange';
    const radius = event.severity * 10000; // Scale based on severity
    
    return (
      <Circle
        key={event.id}
        center={[event.location.lat, event.location.lng]}
        radius={radius}
        pathOptions={{
          color,
          fillColor: color,
          fillOpacity: 0.2,
        }}
      >
        <Popup>
          <div>
            <h3 className="font-bold">{event.type.toUpperCase()} Event</h3>
            <p>Severity: {event.severity}/10</p>
            <p>Time: {new Date(event.timestamp).toLocaleString()}</p>
            <p>Funds Released: {event.fundsReleased ? 'Yes' : 'No'}</p>
            {event.transactionHash && (
              <p>
                {/*<a 
                  href={https:mumbai.polygonscan.com/tx/${event.transactionHash}}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >


                  View Transaction
                </a>*/}

<a 
                  href={`https://mumbai.polygonscan.com/tx/${event.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View Transaction
                </a>
                </p>
            )}
          </div>
        </Popup>
      </Circle>
    );
  };

  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden shadow-lg">
      <MapContainer 
        center={mapCenter} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Render Sensors */}
        {sensors.map(sensor => (
          <Marker
            key={sensor.id}
            position={[sensor.location.lat, sensor.location.lng]}
            icon={getSensorIcon(sensor.type, sensor.status)}
            eventHandlers={{
              click: () => onSensorClick(sensor),
            }}
          >
            <Popup>
              <div>
                <h3 className="font-bold">{sensor.name}</h3>
                <p>Type: {sensor.type}</p>
                <p>Status: {sensor.status}</p>
                <p>Last Reading: {sensor.lastReading}</p>
                <p>Last Updated: {new Date(sensor.lastUpdated).toLocaleString()}</p>
                <p>Severity: {sensor.severity}</p>
                
                <button 
                  className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm"
                  onClick={() => onSensorClick(sensor)}
                >
                  Trigger Event
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Render NGOs */}
        {ngos.map(ngo => (
          <Marker
            key={ngo.id}
            position={[ngo.location.lat, ngo.location.lng]}
            icon={getNGOIcon(ngo.specialization)}
          >
            <Popup>
              <div>
                <h3 className="font-bold">{ngo.name}</h3>
                <p>Specialization: {ngo.specialization}</p>
                <p>Wallet: {'${ngo.walletAddress.substring(0, 6)}...${ngo.walletAddress.substring(38)}'}</p>
                <p>Contact: {ngo.phone}</p>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* Render Disaster Events */}
        {events.map(event => getEventCircle(event))}
      </MapContainer>
    </div>
  );
};

// eslint-disable-next-line no-irregular-whitespace
export default Map;