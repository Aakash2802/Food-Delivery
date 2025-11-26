import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Package } from 'lucide-react';
import { useSocket } from '../contexts/SocketContext';

// Fix default marker icon issue in Leaflet with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color, icon) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 40px;
        height: 40px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: 20px;
        ">${icon}</div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

const restaurantIcon = createCustomIcon('#ef4444', '🏪');
const deliveryIcon = createCustomIcon('#10b981', '📦');
const driverIcon = createCustomIcon('#3b82f6', '🏍️');

// Component to update map view when markers change
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);

  return null;
};

const OrderTrackingMap = ({ order }) => {
  const { socket, isConnected } = useSocket();
  const [driverLocation, setDriverLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([10.7905, 78.7047]); // Madurai coordinates
  const [mapZoom, setMapZoom] = useState(13);
  const hasSetInitialView = useRef(false);

  // Extract locations from order
  const restaurantLocation = order?.restaurantId?.address?.location?.coordinates;
  const deliveryLocation = order?.deliveryAddress?.location?.coordinates;

  useEffect(() => {
    // Set initial map view based on available locations
    if (!hasSetInitialView.current) {
      if (deliveryLocation && deliveryLocation[0] && deliveryLocation[1]) {
        setMapCenter([deliveryLocation[1], deliveryLocation[0]]);
        setMapZoom(14);
        hasSetInitialView.current = true;
      } else if (restaurantLocation && restaurantLocation[0] && restaurantLocation[1]) {
        setMapCenter([restaurantLocation[1], restaurantLocation[0]]);
        setMapZoom(14);
        hasSetInitialView.current = true;
      }
    }
  }, [restaurantLocation, deliveryLocation]);

  useEffect(() => {
    if (!socket || !isConnected || !order?._id) return;

    // Join the order room for real-time updates
    socket.emit('order:track', order._id);

    // Listen for driver location updates
    const handleDriverLocationUpdate = (data) => {
      console.log('Driver location updated:', data);
      if (data.location) {
        setDriverLocation({
          latitude: data.location.latitude,
          longitude: data.location.longitude,
          timestamp: data.timestamp
        });
      }
    };

    socket.on('driver:locationUpdated', handleDriverLocationUpdate);

    // Cleanup
    return () => {
      socket.off('driver:locationUpdated', handleDriverLocationUpdate);
      socket.emit('order:untrack', order._id);
    };
  }, [socket, isConnected, order?._id]);

  // If driver is assigned but no location yet, try to get initial location from order
  useEffect(() => {
    if (order?.driverId?.currentLocation?.coordinates && !driverLocation) {
      const coords = order.driverId.currentLocation.coordinates;
      if (coords && coords[0] && coords[1]) {
        setDriverLocation({
          latitude: coords[1],
          longitude: coords[0],
          timestamp: order.driverId.currentLocation.updatedAt
        });
      }
    }
  }, [order?.driverId, driverLocation]);

  // Calculate route polyline
  const getRouteCoordinates = () => {
    const points = [];

    if (restaurantLocation && restaurantLocation[0] && restaurantLocation[1]) {
      points.push([restaurantLocation[1], restaurantLocation[0]]);
    }

    if (driverLocation) {
      points.push([driverLocation.latitude, driverLocation.longitude]);
    }

    if (deliveryLocation && deliveryLocation[0] && deliveryLocation[1]) {
      points.push([deliveryLocation[1], deliveryLocation[0]]);
    }

    return points.length >= 2 ? points : null;
  };

  const routeCoordinates = getRouteCoordinates();

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Map Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            Live Tracking
          </h3>
          {isConnected ? (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm opacity-75">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>Connecting...</span>
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="h-96 relative">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className="h-full w-full"
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapUpdater center={mapCenter} zoom={mapZoom} />

          {/* Restaurant Marker */}
          {restaurantLocation && restaurantLocation[0] && restaurantLocation[1] && (
            <Marker
              position={[restaurantLocation[1], restaurantLocation[0]]}
              icon={restaurantIcon}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-bold text-red-600">Restaurant</p>
                  <p className="text-sm">{order?.restaurantId?.name}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Driver Marker */}
          {driverLocation && (
            <Marker
              position={[driverLocation.latitude, driverLocation.longitude]}
              icon={driverIcon}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-bold text-blue-600">Delivery Partner</p>
                  <p className="text-sm">{order?.driverId?.name || 'Driver'}</p>
                  <p className="text-xs text-gray-500">
                    {driverLocation.timestamp && new Date(driverLocation.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Delivery Location Marker */}
          {deliveryLocation && deliveryLocation[0] && deliveryLocation[1] && (
            <Marker
              position={[deliveryLocation[1], deliveryLocation[0]]}
              icon={deliveryIcon}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-bold text-green-600">Delivery Address</p>
                  <p className="text-sm">{order?.deliveryAddress?.street}</p>
                  <p className="text-xs text-gray-500">
                    {order?.deliveryAddress?.city}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Route Polyline */}
          {routeCoordinates && (
            <Polyline
              positions={routeCoordinates}
              color="#3b82f6"
              weight={4}
              opacity={0.6}
              dashArray="10, 10"
            />
          )}
        </MapContainer>
      </div>

      {/* Map Legend */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white">
              🏪
            </div>
            <span className="text-gray-700">Restaurant</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
              🏍️
            </div>
            <span className="text-gray-700">Delivery Partner</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
              📦
            </div>
            <span className="text-gray-700">Your Location</span>
          </div>
        </div>

        {driverLocation && (
          <div className="mt-3 text-xs text-gray-500 text-center">
            Last updated: {new Date(driverLocation.timestamp).toLocaleString('en-IN')}
          </div>
        )}

        {!driverLocation && order?.status === 'assigned' && (
          <div className="mt-3 text-sm text-center text-gray-600">
            <Package className="w-5 h-5 mx-auto mb-1 animate-bounce" />
            Waiting for delivery partner to start tracking...
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTrackingMap;
