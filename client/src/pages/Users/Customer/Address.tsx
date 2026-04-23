import { useEffect, useState } from "react";
import LocationMap from "../../../components/LocationMap";

interface Location {
  type: "Point";
  coordinates: [number, number];
}

interface CustomerAddress {
  _id: string;
  address: string;
  city: string;
  pincode: string;
  location: Location;
}

const Address = () => {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [errors, setErrors] = useState<{
    address?: string;
    city?: string;
    pincode?: string;
    latitude?: string;
    longitude?: string;
  }>({});

  const resetForm = () => {
    setAddressLine("");
    setCity("");
    setPincode("");
    setLatitude("");
    setLongitude("");
    setEditingId(null);
    setErrors({});
  };

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("http://localhost:8080/api/address", {
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to load addresses");
      }

      setAddresses(data.addresses || []);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while loading addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      fetchAddresses();
    })();
  }, []);

  const validateForm = () => {
    const newErrors: {
      address?: string;
      city?: string;
      pincode?: string;
      latitude?: string;
      longitude?: string;
    } = {};

    if (!addressLine.trim()) newErrors.address = "Address is required";
    if (!city.trim()) newErrors.city = "City is required";
    if (!pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (pincode.length == 6) {
      newErrors.pincode = "Pincode must be 6 chars";
    }

    if (!latitude.trim()) {
      newErrors.latitude = "Latitude is required";
    } else if (isNaN(Number(latitude))) {
      newErrors.latitude = "Latitude must be a number";
    }

    if (!longitude.trim()) {
      newErrors.longitude = "Longitude is required";
    } else if (isNaN(Number(longitude))) {
      newErrors.longitude = "Longitude must be a number";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        address: addressLine.trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        location: {
          type: "Point" as const,
          coordinates: [Number(longitude), Number(latitude)] as [
            number,
            number,
          ],
        },
      };

      const url = editingId
        ? `http://localhost:8080/api/address/${editingId}`
        : "http://localhost:8080/api/address";

      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.message ||
            (editingId ? "Failed to update address" : "Failed to add address"),
        );
      }

      if (editingId) {
        setAddresses((prev) =>
          prev.map((item) => (item._id === editingId ? data.address : item)),
        );
      } else {
        setAddresses((prev) => [data.address, ...prev]);
      }

      resetForm();
    } catch (err) {
      console.error(err);
      alert("Something went wrong while saving the address");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: CustomerAddress) => {
    setEditingId(item._id);
    setAddressLine(item.address);
    setCity(item.city);
    setPincode(item.pincode);
    setLongitude(String(item.location.coordinates[0] ?? ""));
    setLatitude(String(item.location.coordinates[1] ?? ""));
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this address?");
    if (!confirmed) return;

    try {
      const res = await fetch(`http://localhost:8080/api/address/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete address");
      }

      setAddresses((prev) => prev.filter((item) => item._id !== id));

      if (editingId === id) resetForm();
    } catch (err) {
      console.error(err);
      alert("Something went wrong while deleting the address");
    }
  };

  return (
    <div className="container mt-4">
      <h3>My Addresses</h3>

      <div className="row mt-3 g-4 align-items-start">
        <div className="col-12 col-lg-5">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">
                {editingId ? "Edit Address" : "Add Address"}
              </h5>

              <form onSubmit={handleSubmit}>
                {/* Address */}
                <div className="mb-3">
                  <label className="form-label">Address Line</label>
                  <input
                    className={`form-control ${errors.address ? "is-invalid" : ""}`}
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    disabled={submitting}
                  />
                  {errors.address && (
                    <small className="text-danger">{errors.address}</small>
                  )}
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">City</label>
                    <input
                      className={`form-control ${errors.city ? "is-invalid" : ""}`}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      disabled={submitting}
                    />
                    {errors.city && (
                      <small className="text-danger">{errors.city}</small>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Pincode</label>
                    <input
                      className={`form-control ${errors.pincode ? "is-invalid" : ""}`}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      disabled={submitting}
                    />
                    {errors.pincode && (
                      <small className="text-danger">{errors.pincode}</small>
                    )}
                  </div>
                </div>

                {/* Lat + Lng */}
                <div className="row g-3 mt-1">
                  <div className="col-md-6">
                    <label className="form-label">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      className={`form-control ${errors.latitude ? "is-invalid" : ""}`}
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      disabled={submitting}
                    />
                    {errors.latitude && (
                      <small className="text-danger">{errors.latitude}</small>
                    )}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      className={`form-control ${errors.longitude ? "is-invalid" : ""}`}
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      disabled={submitting}
                    />
                    {errors.longitude && (
                      <small className="text-danger">{errors.longitude}</small>
                    )}
                  </div>
                </div>

                {/* Map */}
                <div className="mb-3 mt-3">
                  <label className="form-label d-block">
                    Select Location on Map
                  </label>

                  <LocationMap
                    latitude={latitude}
                    longitude={longitude}
                    setLatitude={setLatitude}
                    setLongitude={setLongitude}
                  />
                </div>

                <div className="d-flex gap-2 mt-3">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting
                      ? "Saving..."
                      : editingId
                        ? "Update Address"
                        : "Add Address"}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={resetForm}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE (UNCHANGED LOGIC) */}
        <div className="col-12 col-lg-7">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Saved Addresses</h5>

              {loading ? (
                <p className="mb-0">Loading...</p>
              ) : error ? (
                <p className="text-danger mb-0">{error}</p>
              ) : addresses.length === 0 ? (
                <p className="text-muted mb-0">No addresses saved yet.</p>
              ) : (
                <div className="row g-3">
                  {addresses.map((item) => (
                    <div className="col-12 col-md-6" key={item._id}>
                      <div className="card h-100 border">
                        <div className="card-body">
                          <h6 className="card-title mb-2">{item.address}</h6>

                          <p className="mb-1">
                            <strong>City:</strong> {item.city}
                          </p>

                          <p className="mb-1">
                            <strong>Pincode:</strong> {item.pincode}
                          </p>

                          <p className="mb-3">
                            <strong>Coordinates:</strong>{" "}
                            {item.location.coordinates[1]},{" "}
                            {item.location.coordinates[0]}
                          </p>

                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEdit(item)}
                            >
                              Edit
                            </button>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(item._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Address;
