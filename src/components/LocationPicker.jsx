import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix the default Leaflet marker icon when bundled (Vite).
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Cairo — used until the user picks a point.
const DEFAULT_CENTER = [30.0444, 31.2357];

const isNum = (v) => v !== "" && v !== null && v !== undefined && Number.isFinite(Number(v));

function Recenter({ lat, lng, enabled }) {
  const map = useMap();
  useEffect(() => {
    if (enabled) {
      map.setView([Number(lat), Number(lng)], map.getZoom() || 13);
    }
  }, [lat, lng, enabled, map]);
  return null;
}

function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

/**
 * Leaflet + OpenStreetMap location picker.
 * Click anywhere or drag the pin to choose the pickup location.
 */
const LocationPicker = ({ lat, lng, onChange, onAddress }) => {
  const hasPoint = isNum(lat) && isNum(lng);
  const center = hasPoint ? [Number(lat), Number(lng)] : DEFAULT_CENTER;

  const reverseGeocode = async (newLat, newLng) => {
    if (!onAddress) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}&accept-language=en&addressdetails=1`,
        { headers: { Accept: "application/json" } },
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.display_name) onAddress(data.display_name);
      }
    } catch {
      // Reverse geocoding is best-effort; the user can type the address.
    }
  };

  const handlePick = (newLat, newLng) => {
    onChange?.(newLat, newLng);
    reverseGeocode(newLat, newLng);
  };

  return (
    <div
      className="rounded-xl overflow-hidden border border-gray-200"
      style={{ height: 320 }}
    >
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom
        className="w-full h-full"
        style={{ zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hasPoint && (
          <Marker
            position={[Number(lat), Number(lng)]}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const p = e.target.getLatLng();
                handlePick(p.lat, p.lng);
              },
            }}
          />
        )}
        <ClickHandler onPick={handlePick} />
        <Recenter lat={lat} lng={lng} enabled={hasPoint} />
      </MapContainer>
    </div>
  );
};

export default LocationPicker;
