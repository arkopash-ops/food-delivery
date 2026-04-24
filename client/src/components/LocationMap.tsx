import L from "leaflet";
import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
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
  markers?: {
    latitude: string;
    longitude: string;
    label?: string;
  }[];
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

const FitBounds = ({ points }: { points: [number, number][] }) => {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 13);
      return;
    }

    map.fitBounds(points, { padding: [40, 40] });
  }, [map, points]);

  return null;
};

const LocationMap = ({
  latitude,
  longitude,
  setLatitude,
  setLongitude,
  height = "300px",
  readOnly = false,
  markers,
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

  const parsedMarkers =
    markers?.filter((marker) => {
      const markerLat = Number(marker.latitude);
      const markerLng = Number(marker.longitude);

      return (
        Number.isFinite(markerLat) &&
        Number.isFinite(markerLng) &&
        marker.latitude !== "" &&
        marker.longitude !== ""
      );
    }) || [];

  const mapPoints: [number, number][] =
    parsedMarkers.length > 0
      ? parsedMarkers.map((marker) => [
          Number(marker.latitude),
          Number(marker.longitude),
        ])
      : [center];

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

      {parsedMarkers.length > 0 ? (
        <FitBounds points={mapPoints} />
      ) : (
        <RecenterMap center={center} />
      )}
      {!readOnly && (
        <MapClickHandler
          setLatitude={setLatitude}
          setLongitude={setLongitude}
        />
      )}

      {parsedMarkers.length > 0 ? (
        parsedMarkers.map((marker) => (
          <Marker
            key={`${marker.latitude}-${marker.longitude}-${marker.label || "point"}`}
            position={[Number(marker.latitude), Number(marker.longitude)]}
          >
            {marker.label ? <Popup>{marker.label}</Popup> : null}
          </Marker>
        ))
      ) : (
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
      )}
    </MapContainer>
  );
};

export default LocationMap;
