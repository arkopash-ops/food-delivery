import { useEffect, useState } from "react";
import LocationMap from "../../../components/LocationMap";

interface DriverLocation {
  type: "Point";
  coordinates: [number, number];
  updatedAt?: string;
}

interface DriverProfile {
  _id: string;
  driverId: string;
  isAvailable: boolean;
  currentLocation?: DriverLocation | null;
}

const DriverDashboard = () => {
  const [driver, setDriver] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  useEffect(() => {
    const fetchDriverProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("http://localhost:8080/api/driver/me", {
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.message || "Failed to load driver profile");
        }

        setDriver(data.driver || null);
      } catch (err) {
        console.error(err);
        setError("Something went wrong while loading your driver profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchDriverProfile();
  }, []);

  const handleToggleAvailability = async () => {
    if (!driver) return;

    try {
      setUpdatingAvailability(true);

      const res = await fetch("http://localhost:8080/api/driver/is-available", {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isAvailable: !driver.isAvailable }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to update availability");
      }

      setDriver(data.driver);
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error
          ? err.message
          : "Something went wrong while updating availability.",
      );
    } finally {
      setUpdatingAvailability(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <h3>Driver Dashboard</h3>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <h3>Driver Dashboard</h3>
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="container mt-4">
        <h3>Driver Dashboard</h3>
        <div className="alert alert-info">Driver profile not found yet.</div>
      </div>
    );
  }

  const coordinates = driver.currentLocation?.coordinates;
  const latitude = coordinates?.[0];
  const longitude = coordinates?.[1];

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Driver Dashboard</h3>

      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <h4 className="card-title">Profile</h4>
              <p className="card-text mb-1">
                <strong>Status:</strong>{" "}
                {driver.isAvailable ? "Available" : "Unavailable"}
              </p>
              <p className="card-text mb-1">
                <strong>Driver ID:</strong> {driver.driverId}
              </p>
              {coordinates ? (
                <>
                  <div className="mb-3">
                    <LocationMap
                      latitude={String(latitude)}
                      longitude={String(longitude)}
                      height="240px"
                      readOnly
                    />
                  </div>
                  <p className="card-text mb-1">
                    <strong>Longitude:</strong> {longitude}
                  </p>
                  <p className="card-text mb-1">
                    <strong>Latitude:</strong> {latitude}
                  </p>
                </>
              ) : (
                <p className="card-text mb-1">
                  <strong>Current location:</strong> Not updated yet
                </p>
              )}
              {driver.currentLocation?.updatedAt && (
                <p className="card-text mb-0">
                  <strong>Last location update:</strong>{" "}
                  {new Date(driver.currentLocation.updatedAt).toLocaleString()}
                </p>
              )}

              <button
                className={`btn ${
                  driver.isAvailable ? "btn-warning" : "btn-success"
                }`}
                onClick={handleToggleAvailability}
                disabled={updatingAvailability}
              >
                {updatingAvailability
                  ? "Updating..."
                  : driver.isAvailable
                    ? "Mark as Unavailable"
                    : "Mark as Available"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
