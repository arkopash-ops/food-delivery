// src/pages/manager/RestaurantForm.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// default marker icon
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

interface LocationPickerProps {
  setLatitude: (lat: string) => void;
  setLongitude: (lng: string) => void;
}

const LocationPicker = ({ setLatitude, setLongitude }: LocationPickerProps) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setLatitude(lat.toString());
      setLongitude(lng.toString());
    },
  });
  return null;
};

const Restaurant = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [name, setName] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  const navigate = useNavigate();

  const latNum = parseFloat(latitude) || 0;
  const lngNum = parseFloat(longitude) || 0;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  // fetch restaurant for edit
  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!id) return;
      try {
        setInitialLoading(true);
        const res = await fetch(`http://localhost:8080/api/restaurant/me`, {
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          alert(data.message || "Failed to load restaurant");
          navigate("/manager/dashboard");
          return;
        }

        const r = data.restaurant;
        setName(r.name || "");
        setAddressLine(r.address?.address || "");
        setCity(r.address?.city || "");
        setPincode(r.address?.pincode || "");
        const coords = r.address?.location?.coordinates || [0, 0];
        setLongitude(coords[0]?.toString() ?? "0");
        setLatitude(coords[1]?.toString() ?? "0");
        setIsOpen(Boolean(r.isOpen));
      } catch (err) {
        console.error(err);
        alert("Something went wrong while loading restaurant");
        navigate("/manager/dashboard");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchRestaurant();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append(
        "address",
        JSON.stringify({
          address: addressLine,
          city,
          pincode,
          location: {
            type: "Point",
            coordinates: [lngNum, latNum], // [lng, lat]
          },
        }),
      );
      formData.append("isOpen", String(isOpen));

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const url = isEditMode
        ? `http://localhost:8080/api/restaurant/${id}`
        : "http://localhost:8080/api/restaurant";

      const method = isEditMode ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(
          data.message ||
            (isEditMode
              ? "Failed to update restaurant"
              : "Failed to create restaurant"),
        );
        console.log(res.ok);
        console.log(data);
        return;
      }

      alert(
        isEditMode
          ? "Restaurant updated successfully"
          : "Restaurant created successfully",
      );
      navigate("/manager/dashboard");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="container mt-4">
        <h3>{isEditMode ? "Edit Restaurant" : "Add Restaurant"}</h3>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h3>{isEditMode ? "Edit Restaurant" : "Add Restaurant"}</h3>

      <form onSubmit={handleSubmit} className="mt-3">
        <div className="mb-3">
          <label className="form-label">Restaurant Name</label>
          <input
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Address Line</label>
          <input
            className="form-control"
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">City</label>
          <input
            className="form-control"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Pincode</label>
          <input
            className="form-control"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            required
          />
        </div>

        {/* Map + coordinates */}
        <div className="mb-3">
          <label className="form-label d-block">Select Location on Map</label>
          <MapContainer
            center={[latNum, lngNum]}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: "300px", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <LocationPicker
              setLatitude={setLatitude}
              setLongitude={setLongitude}
            />

            <Marker
              position={[latNum, lngNum]}
              draggable={true}
              eventHandlers={{
                dragend: (e) => {
                  const marker = e.target as L.Marker;
                  const pos = marker.getLatLng();
                  setLatitude(pos.lat.toString());
                  setLongitude(pos.lng.toString());
                },
              }}
            />
          </MapContainer>
          <small className="text-muted">
            Click on the map or drag the marker to set restaurant location.
          </small>
        </div>

        <div className="mb-3">
          <label className="form-label">Latitude</label>
          <input
            className="form-control"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            required
            type="number"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Longitude</label>
          <input
            className="form-control"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            required
            type="number"
          />
        </div>

        <div className="form-check mb-3">
          <input
            id="isOpen"
            className="form-check-input"
            type="checkbox"
            checked={isOpen}
            onChange={(e) => setIsOpen(e.target.checked)}
          />
          <label htmlFor="isOpen" className="form-check-label">
            Is Open
          </label>
        </div>

        <div className="mb-3">
          <label className="form-label">Restaurant Image</label>
          <input
            type="file"
            className="form-control"
            accept="image/*"
            onChange={handleImageChange}
          />
          <small className="text-muted">
            Optional. Upload restaurant logo or photo.
          </small>
        </div>

        <button className="btn btn-primary" disabled={loading}>
          {loading
            ? isEditMode
              ? "Saving..."
              : "Saving..."
            : isEditMode
              ? "Update Restaurant"
              : "Create Restaurant"}
        </button>
      </form>
    </div>
  );
};

export default Restaurant;
