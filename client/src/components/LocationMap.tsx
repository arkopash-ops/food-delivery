import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const defaultIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

const DEFAULT_CENTER: [number, number] = [21.170240, 72.831062];

interface LocationMapProps {
  latitude: string;
  longitude: string;
  setLatitude?: (lat: string) => void;
  setLongitude?: (lng: string) => void;
  height?: string;
  readOnly?: boolean;
}

const MapClickHandler = ({
  setLatitude,
  setLongitude,
}: {
  setLatitude?: (lat: string) => void;
  setLongitude?: (lng: string) => void;
}) => {
  useMapEvents({
    click(e) {
      if (!setLatitude || !setLongitude) return;
      setLatitude(e.latlng.lat.toString());
      setLongitude(e.latlng.lng.toString());
    },
  });

  return null;
};

const RecenterMap = ({ center }: { center: [number, number] }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center);
  }, [center, map]);

  return null;
};

const LocationMap = ({
  latitude,
  longitude,
  setLatitude,
  setLongitude,
  height = "300px",
  readOnly = false,
}: LocationMapProps) => {
  const latNum = Number(latitude);
  const lngNum = Number(longitude);

  const hasValidCoordinates =
    Number.isFinite(latNum) &&
    Number.isFinite(lngNum) &&
    latitude !== "" &&
    longitude !== "";

  const center: [number, number] = hasValidCoordinates
    ? [latNum, lngNum]
    : DEFAULT_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={10}
      scrollWheelZoom
      style={{ height, width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <RecenterMap center={center} />
      {!readOnly && (
        <MapClickHandler
          setLatitude={setLatitude}
          setLongitude={setLongitude}
        />
      )}

      <Marker
        position={center}
        draggable={!readOnly}
        eventHandlers={
          readOnly || !setLatitude || !setLongitude
            ? undefined
            : {
                dragend: (e) => {
                  const marker = e.target as L.Marker;
                  const pos = marker.getLatLng();
                  setLatitude(pos.lat.toString());
                  setLongitude(pos.lng.toString());
                },
              }
        }
      />
    </MapContainer>
  );
};

export default LocationMap;
