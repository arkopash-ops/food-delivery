// src/pages/manager/ManagerDashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Location {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

interface Address {
  address: string;
  city: string;
  pincode: string;
  location: Location;
}

interface Restaurant {
  _id: string;
  name: string;
  address: Address;
  isOpen: boolean;
  avgPrepTimeMinutes?: number;
  rejectionRate?: number;
}

const ManagerDashboard = () => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:8080/api/restaurant/me", {
          credentials: "include",
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.message || "Failed to load restaurant");
          return;
        }

        const data = await res.json();
        setRestaurant(data.restaurant);
      } catch (err) {
        console.error(err);
        setError("Something went wrong while fetching restaurant");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, []);

  const handleAddRestaurantClick = () => {
    navigate("/manager/restaurant");
  };

  const handleEditRestaurantClick = () => {
    if (!restaurant) return;
    navigate(`/manager/restaurant/${restaurant._id}`);
  };

  const handleToggleOpen = async () => {
    if (!restaurant) return;

    try {
      setToggling(true);

      const res = await fetch(
        `http://localhost:8080/api/restaurant/${restaurant._id}/is-open`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isOpen: !restaurant.isOpen }),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.message || "Failed to update status");
        return;
      }

      const data = await res.json();
      // your controller returns { success: true, restaurant }
      setRestaurant(data.restaurant);
    } catch (err) {
      console.error(err);
      alert("Something went wrong while updating status");
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <h3>Manager Dashboard</h3>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <h3>Manager Dashboard</h3>
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="container mt-4">
        <h3>Manager Dashboard</h3>
        <div className="alert alert-info mt-3">
          You have not created a restaurant yet.
        </div>
        <button className="btn btn-primary" onClick={handleAddRestaurantClick}>
          Add Restaurant
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h3>Manager Dashboard</h3>

      <div className="card mt-3">
        <div className="card-body">
          <h4 className="card-title">{restaurant.name}</h4>
          <p className="card-text mb-1">
            <strong>Address:</strong> {restaurant.address.address},{" "}
            {restaurant.address.city} - {restaurant.address.pincode}
          </p>
          <p className="card-text mb-1">
            <strong>Status:</strong> {restaurant.isOpen ? "Open" : "Closed"}
          </p>
          {typeof restaurant.avgPrepTimeMinutes === "number" && (
            <p className="card-text mb-1">
              <strong>Avg prep time:</strong> {restaurant.avgPrepTimeMinutes}{" "}
              minutes
            </p>
          )}
          {typeof restaurant.rejectionRate === "number" && (
            <p className="card-text mb-1">
              <strong>Rejection rate:</strong> {restaurant.rejectionRate} %
            </p>
          )}

          <div className="mt-3 d-flex gap-2">
            <button
              className="btn btn-outline-primary"
              onClick={handleEditRestaurantClick}
            >
              Edit Restaurant
            </button>

            <button
              className={`btn ${
                restaurant.isOpen ? "btn-warning" : "btn-success"
              }`}
              onClick={handleToggleOpen}
              disabled={toggling}
            >
              {toggling
                ? "Updating..."
                : restaurant.isOpen
                  ? "Mark as Closed"
                  : "Mark as Open"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
