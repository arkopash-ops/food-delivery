import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LocationMap from "../../../components/LocationMap";

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

  const [errors, setErrors] = useState<{
    name?: string;
    addressLine?: string;
    city?: string;
    pincode?: string;
    latitude?: string;
    longitude?: string;
  }>({});

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

    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = "Restaurant name is required";
    } else if (name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (!addressLine.trim()) {
      newErrors.addressLine = "Address is required";
    }

    if (!city.trim()) {
      newErrors.city = "City is required";
    }

    if (!pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(pincode)) {
      newErrors.pincode = "Enter a valid 6-digit pincode";
    }

    if (!latitude) {
      newErrors.latitude = "Latitude is required";
    } else if (isNaN(Number(latitude))) {
      newErrors.latitude = "Invalid latitude";
    }

    if (!longitude) {
      newErrors.longitude = "Longitude is required";
    } else if (isNaN(Number(longitude))) {
      newErrors.longitude = "Invalid longitude";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

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
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <small className="text-danger">{errors.name}</small>}
        </div>

        <div className="mb-3">
          <label className="form-label">Address Line</label>
          <input
            className={`form-control ${errors.addressLine ? "is-invalid" : ""}`}
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
          />
          {errors.addressLine && (
            <small className="text-danger">{errors.addressLine}</small>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">City</label>
          <input
            className={`form-control ${errors.city ? "is-invalid" : ""}`}
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          {errors.city && <small className="text-danger">{errors.city}</small>}
        </div>

        <div className="mb-3">
          <label className="form-label">Pincode</label>
          <input
            className={`form-control ${errors.pincode ? "is-invalid" : ""}`}
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
          />
          {errors.pincode && (
            <small className="text-danger">{errors.pincode}</small>
          )}
        </div>

        {/* Map + coordinates */}
        <div className="mb-3">
          <label className="form-label d-block">Select Location on Map</label>
          <LocationMap
            latitude={latitude}
            longitude={longitude}
            setLatitude={setLatitude}
            setLongitude={setLongitude}
          />
          <small className="text-muted">
            Click on the map or drag the marker to set restaurant location.
          </small>
        </div>

        <div className="mb-3">
          <label className="form-label">Latitude</label>
          <input
            type="number"
            className={`form-control ${errors.latitude ? "is-invalid" : ""}`}
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
          />
          {errors.latitude && (
            <small className="text-danger">{errors.latitude}</small>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Longitude</label>
          <input
            type="number"
            className={`form-control ${errors.longitude ? "is-invalid" : ""}`}
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
          />
          {errors.longitude && (
            <small className="text-danger">{errors.longitude}</small>
          )}
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
