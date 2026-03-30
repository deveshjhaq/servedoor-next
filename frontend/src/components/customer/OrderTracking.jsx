import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Phone, Star, Clock, Package, ChefHat, Truck, Home, CheckCircle } from 'lucide-react';
import api from '../../services/api';

// Leaflet CSS must be loaded
import 'leaflet/dist/leaflet.css';

const STATUS_ICON = {
  placed: CheckCircle,
  confirmed: CheckCircle,
  preparing: ChefHat,
  on_way: Truck,
  delivered: Home,
};

const STATUS_COLOR = {
  placed: '#FF5200',
  confirmed: '#FF5200',
  preparing: '#FF5200',
  on_way: '#FF5200',
  delivered: '#008000',
  cancelled: '#EF4444',
};

const OrderTracking = ({ orderId, onClose }) => {
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef = useRef(null);
  const pollingRef = useRef(null);

  const fetchTracking = async () => {
    try {
      const response = await api.orders.track(orderId);
      if (response.data?.success) {
        setTracking(response.data.tracking);
        setError('');
      }
    } catch (err) {
      setError('Tracking info load nahi ho rahi. Retry karein.');
    } finally {
      setLoading(false);
    }
  };

  // Initialize Leaflet map
  useEffect(() => {
    if (!tracking || !mapRef.current) return;
    if (!tracking.currentLocation && !tracking.restaurantLocation) return;

    import('leaflet').then((L) => {
      // Fix default marker icons
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const restLoc = tracking.restaurantLocation || { lat: 19.059, lng: 72.829 };
      const destLoc = tracking.deliveryLocation || { lat: 19.076, lng: 72.877 };
      const curLoc = tracking.currentLocation || restLoc;

      if (!leafletMapRef.current) {
        const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(map);
        leafletMapRef.current = map;

        // Restaurant marker (orange)
        const restIcon = L.divIcon({
          html: `<div style="background:#FF5200;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">🏪</div>`,
          className: '',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });
        L.marker([restLoc.lat, restLoc.lng], { icon: restIcon })
          .addTo(map)
          .bindPopup(restLoc.name || 'Restaurant');

        // Delivery destination marker (home)
        const homeIcon = L.divIcon({
          html: `<div style="background:#008000;color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)">🏠</div>`,
          className: '',
          iconSize: [32, 32],
          iconAnchor: [16, 32],
        });
        L.marker([destLoc.lat, destLoc.lng], { icon: homeIcon })
          .addTo(map)
          .bindPopup('Delivery Location');

        // Route line
        L.polyline([[restLoc.lat, restLoc.lng], [destLoc.lat, destLoc.lng]], {
          color: '#FF5200', weight: 3, opacity: 0.6, dashArray: '8, 8'
        }).addTo(map);

        // Delivery partner marker
        if (tracking.status === 'on_way') {
          const bikeIcon = L.divIcon({
            html: `<div style="background:#1C1C1C;color:white;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid #FF5200;box-shadow:0 2px 8px rgba(0,0,0,0.4);animation:pulse 1.5s infinite">🛵</div>`,
            className: '',
            iconSize: [36, 36],
            iconAnchor: [18, 36],
          });
          markerRef.current = L.marker([curLoc.lat, curLoc.lng], { icon: bikeIcon })
            .addTo(map)
            .bindPopup(`${tracking.deliveryPartner?.name || 'Delivery Partner'} is on the way!`);
        }

        // Fit bounds
        const bounds = L.latLngBounds(
          [restLoc.lat, restLoc.lng],
          [destLoc.lat, destLoc.lng]
        );
        map.fitBounds(bounds, { padding: [40, 40] });
      } else {
        // Update marker position (smooth animation)
        if (markerRef.current && tracking.currentLocation) {
          markerRef.current.setLatLng([curLoc.lat, curLoc.lng]);
        }
      }
    });
  }, [tracking]);

  useEffect(() => {
    fetchTracking();
    // Poll every 15 seconds for status updates
    pollingRef.current = setInterval(fetchTracking, 15000);
    return () => {
      clearInterval(pollingRef.current);
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[200]">
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Tracking load ho raha hai...</p>
        </div>
      </div>
    );
  }

  if (error || !tracking) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[200]">
        <div className="bg-white rounded-2xl p-8 text-center max-w-sm">
          <p className="text-red-500 mb-4">{error || 'Tracking unavailable'}</p>
          <button onClick={onClose} className="bg-orange-500 text-white px-6 py-2 rounded-lg">Close</button>
        </div>
      </div>
    );
  }

  const statusColor = STATUS_COLOR[tracking.status] || '#FF5200';
  const isActive = !['delivered', 'cancelled'].includes(tracking.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[200] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Order Tracking</h2>
            <p className="text-sm text-gray-500 mt-0.5">{tracking.orderId}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="px-5 pt-4">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold"
            style={{ backgroundColor: statusColor }}
            data-testid="order-status-badge"
          >
            <span className="capitalize">{tracking.statusLabel}</span>
            {isActive && (
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            )}
          </div>
          {tracking.estimatedMinutes != null && (
            <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
              <Clock className="w-4 h-4 text-orange-500" />
              Estimated delivery in ~{tracking.estimatedMinutes} minutes
            </p>
          )}
        </div>

        {/* Progress Timeline */}
        <div className="px-5 py-4">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gray-200 z-0" />
            <div
              className="absolute left-5 top-5 w-0.5 z-0 transition-all duration-700"
              style={{
                height: `${(tracking.progress / 100) * 100}%`,
                backgroundColor: statusColor
              }}
            />
            <div className="space-y-4 relative z-10">
              {(tracking.timeline || []).map((step, idx) => {
                const Icon = STATUS_ICON[step.status] || CheckCircle;
                return (
                  <div key={step.status} className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500"
                      style={{
                        backgroundColor: step.done ? statusColor : '#F5F5F5',
                        border: step.current ? `2px solid ${statusColor}` : '2px solid transparent'
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: step.done ? 'white' : '#9CA3AF' }} />
                    </div>
                    <div className="flex-1 min-w-0 pt-1.5">
                      <p className={`text-sm font-semibold ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                      {step.timestamp && (
                        <p className="text-xs text-gray-400 mt-0.5">{step.timestamp}</p>
                      )}
                      {step.current && isActive && (
                        <p className="text-xs mt-0.5 font-medium" style={{ color: statusColor }}>
                          In progress...
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Map (visible when on_way or delivered) */}
        {(tracking.status === 'on_way' || tracking.status === 'delivered') && (
          <div className="mx-5 mb-4 rounded-xl overflow-hidden border border-gray-200">
            <div className="bg-gray-50 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-semibold text-gray-700">Live Delivery Map</span>
              <span className="ml-auto text-xs text-gray-400">Powered by OpenStreetMap</span>
            </div>
            <div
              ref={mapRef}
              style={{ height: '240px', width: '100%' }}
              data-testid="tracking-map"
            />
          </div>
        )}

        {/* Delivery Partner Card */}
        {tracking.deliveryPartner && (
          <div className="mx-5 mb-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
            <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-2">Delivery Partner</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {tracking.deliveryPartner.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{tracking.deliveryPartner.name}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {tracking.deliveryPartner.rating} · {tracking.deliveryPartner.vehicle}
                  </div>
                </div>
              </div>
              <a
                href={`tel:${tracking.deliveryPartner.phone}`}
                className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Phone className="w-4 h-4 text-green-500" />
                Call
              </a>
            </div>
          </div>
        )}

        {/* Delivery Address */}
        {tracking.deliveryLocation?.address && (
          <div className="mx-5 mb-5 p-3 bg-gray-50 rounded-xl flex items-start gap-3">
            <MapPin className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-700">{tracking.deliveryLocation.address}</p>
          </div>
        )}
      </div>

      {/* Pulse animation for delivery marker */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.85; }
        }
      `}</style>
    </div>
  );
};

export default OrderTracking;
