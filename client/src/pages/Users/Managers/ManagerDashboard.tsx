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
  image: string;
  avgPrepTimeMinutes?: number;
  rejectionRate?: number;
}

interface Category {
  _id: string;
  name: string;
}

interface MenuItem {
  _id: string;
  name: string;
  image?: string;
  description?: string;
  price: number;
  category: Category | string;
  isAvailable: boolean;
}

const ManagerDashboard = () => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [restaurantRes, menuRes] = await Promise.all([
          fetch("http://localhost:8080/api/restaurant/me", {
            credentials: "include",
          }),
          fetch("http://localhost:8080/api/menu/items/my", {
            credentials: "include",
          }),
        ]);

        if (!restaurantRes.ok) {
          const data = await restaurantRes.json().catch(() => ({}));
          setError(data.message || "Failed to load restaurant");
          return;
        }

        if (!menuRes.ok) {
          const data = await menuRes.json().catch(() => ({}));
          setError(data.message || "Failed to load menu items");
          return;
        }

        const restaurantData = await restaurantRes.json();
        const menuData = await menuRes.json();

        setRestaurant(restaurantData.restaurant);
        setMenuItems(menuData.items || []);
      } catch (err) {
        console.error(err);
        setError("Something went wrong while fetching dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleAddRestaurantClick = () => {
    navigate("/manager/restaurant");
  };

  const handleEditRestaurantClick = () => {
    if (!restaurant) return;
    navigate(`/manager/restaurant/${restaurant._id}`);
  };

  const handleManageMenuClick = () => {
    navigate("/manager/menu-item");
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
      <h3>Restauran Dashboard</h3>
      <div className="row mt-3 g-4 align-items-start">
        <div className="col-12 col-lg-4">
          <div className="card h-100">
            {restaurant.image && (
              <img
                src={restaurant.image}
                alt={restaurant.name}
                style={{
                  maxHeight: "200px",
                  width: "100%",
                  objectFit: "contain",
                }}
              />
            )}

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
                  <strong>Avg prep time:</strong>{" "}
                  {restaurant.avgPrepTimeMinutes} minutes
                </p>
              )}
              {typeof restaurant.rejectionRate === "number" && (
                <p className="card-text mb-1">
                  <strong>Rejection rate:</strong> {restaurant.rejectionRate} %
                </p>
              )}

              <div className="mt-3 d-flex flex-wrap gap-2">
                <button
                  className="btn btn-outline-primary"
                  onClick={handleEditRestaurantClick}
                >
                  Edit Restaurant
                </button>

                <button
                  className="btn btn-outline-dark"
                  onClick={handleManageMenuClick}
                >
                  Manage Menu
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

        <div className="col-12 col-lg-8">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="card-title mb-0">Menu Items</h4>
                <button
                  className="btn btn-primary"
                  onClick={handleManageMenuClick}
                >
                  Add Menu Item
                </button>
              </div>

              {menuItems.length === 0 ? (
                <p className="text-muted mb-0">
                  No menu items found for this restaurant.
                </p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menuItems.map((item) => (
                        <tr key={item._id}>
                          <td>
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                style={{
                                  width: "56px",
                                  height: "56px",
                                  objectFit: "cover",
                                  borderRadius: "8px",
                                }}
                              />
                            ) : (
                              "-"
                            )}
                          </td>
                          <td>
                            <div>{item.name}</div>
                            {item.description && (
                              <small className="text-muted">
                                {item.description}
                              </small>
                            )}
                          </td>
                          <td>
                            {typeof item.category === "string"
                              ? item.category
                              : item.category?.name}
                          </td>
                          <td>Rs. {item.price}</td>
                          <td>
                            {item.isAvailable ? "Available" : "Unavailable"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
