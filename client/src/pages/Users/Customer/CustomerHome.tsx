import { useEffect, useState } from "react";

interface Location {
  type: "Point";
  coordinates: [number, number];
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
  image?: string;
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

const CustomerHome = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItemsByRestaurant, setMenuItemsByRestaurant] = useState<
    Record<string, MenuItem[]>
  >({});
  const [expandedRestaurantId, setExpandedRestaurantId] = useState<
    string | null
  >(null);
  const [loadingMenuId, setLoadingMenuId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        setError(null);

        const restaurantsRes = await fetch("http://localhost:8080/api/restaurant", {
          credentials: "include",
        });

        if (!restaurantsRes.ok) {
          const data = await restaurantsRes.json().catch(() => ({}));
          throw new Error(data.message || "Failed to load restaurants");
        }

        const restaurantsData = await restaurantsRes.json();
        setRestaurants(restaurantsData.restaurants || []);
      } catch (err) {
        console.error(err);
        setError("Something went wrong while loading restaurants");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const handleRestaurantClick = async (restaurant: Restaurant) => {
    if (expandedRestaurantId === restaurant._id) {
      setExpandedRestaurantId(null);
      return;
    }

    setExpandedRestaurantId(restaurant._id);

    if (menuItemsByRestaurant[restaurant._id]) {
      return;
    }

    try {
      setLoadingMenuId(restaurant._id);

      const menuRes = await fetch(
        `http://localhost:8080/api/restaurant/${restaurant._id}/menu`,
        {
          credentials: "include",
        },
      );

      if (!menuRes.ok) {
        const data = await menuRes.json().catch(() => ({}));
        throw new Error(data.message || `Failed to load menu for ${restaurant.name}`);
      }

      const menuData = await menuRes.json();
      setMenuItemsByRestaurant((prev) => ({
        ...prev,
        [restaurant._id]: menuData.items || [],
      }));
    } catch (err) {
      console.error(err);
      setError("Something went wrong while loading the menu");
    } finally {
      setLoadingMenuId(null);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <h3>Restaurants</h3>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <h3>Restaurants</h3>
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h3>Restaurants</h3>

      {restaurants.length === 0 ? (
        <div className="alert alert-info mt-3">No restaurants found.</div>
      ) : (
        <div className="d-grid gap-4 mt-3">
          {restaurants.map((restaurant) => {
            const isExpanded = expandedRestaurantId === restaurant._id;
            const items = menuItemsByRestaurant[restaurant._id] || [];

            return (
            <div className="card" key={restaurant._id}>
              <div className="card-body">
                <button
                  type="button"
                  className="btn text-start w-100 p-0 border-0 bg-transparent"
                  onClick={() => handleRestaurantClick(restaurant)}
                >
                  <div className="row g-4 align-items-start">
                    <div className="col-12 col-lg-4">
                      {restaurant.image && (
                        <img
                          src={restaurant.image}
                          alt={restaurant.name}
                          className="img-fluid rounded mb-3"
                          style={{
                            width: "100%",
                            maxHeight: "220px",
                            objectFit: "cover",
                          }}
                        />
                      )}

                      <h4 className="mb-2">{restaurant.name}</h4>
                      <p className="mb-1">
                        <strong>Status:</strong>{" "}
                        {restaurant.isOpen ? "Open" : "Closed"}
                      </p>
                      <p className="mb-1">
                        <strong>Address:</strong> {restaurant.address.address},{" "}
                        {restaurant.address.city} - {restaurant.address.pincode}
                      </p>
                      {typeof restaurant.avgPrepTimeMinutes === "number" && (
                        <p className="mb-1">
                          <strong>Avg prep time:</strong>{" "}
                          {restaurant.avgPrepTimeMinutes} minutes
                        </p>
                      )}
                      {typeof restaurant.rejectionRate === "number" && (
                        <p className="mb-0">
                          <strong>Rejection rate:</strong>{" "}
                          {restaurant.rejectionRate}%
                        </p>
                      )}
                    </div>

                    <div className="col-12 col-lg-8 d-flex justify-content-lg-end align-items-start">
                      <span className="badge text-bg-dark fs-6">
                        {isExpanded ? "Hide Menu" : "Show Menu"}
                      </span>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-4 border-top pt-4">
                    <h5 className="mb-3">Menu Items</h5>

                    {loadingMenuId === restaurant._id ? (
                      <p className="text-muted mb-0">Loading menu...</p>
                    ) : items.length === 0 ? (
                      <p className="text-muted mb-0">
                        No menu items available for this restaurant.
                      </p>
                    ) : (
                      <div className="row g-3">
                        {items.map((item) => (
                          <div className="col-12 col-md-6" key={item._id}>
                            <div className="card h-100">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="card-img-top"
                                  style={{ height: "180px", objectFit: "cover" }}
                                />
                              )}
                              <div className="card-body">
                                <div className="d-flex justify-content-between gap-3">
                                  <h6 className="card-title mb-1">{item.name}</h6>
                                  <strong>Rs. {item.price}</strong>
                                </div>
                                <p className="text-muted mb-2">
                                  {typeof item.category === "string"
                                    ? item.category
                                    : item.category?.name}
                                </p>
                                {item.description && (
                                  <p className="card-text small mb-2">
                                    {item.description}
                                  </p>
                                )}
                                <span
                                  className={`badge ${
                                    item.isAvailable
                                      ? "text-bg-success"
                                      : "text-bg-secondary"
                                  }`}
                                >
                                  {item.isAvailable ? "Available" : "Unavailable"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerHome;
