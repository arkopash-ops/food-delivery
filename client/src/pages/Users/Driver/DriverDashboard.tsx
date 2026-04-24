import { useEffect, useState } from "react";
import LocationMap from "../../../components/LocationMap";

const DRIVER_HISTORY_STORAGE_KEY = "driverDeliveryHistory";

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

interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface RestaurantSummary {
  _id: string;
  name: string;
  image?: string;
  address?: {
    address?: string;
    city?: string;
    pincode?: string;
  };
}

interface CustomerSummary {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface DeliveryAddressSnapshot {
  address: string;
  city: string;
  pincode: string;
  location: DriverLocation;
}

interface DriverOrder {
  _id: string;
  status: "ASSIGNED" | "PICKED_UP" | "ON_THE_WAY" | "DELIVERED";
  createdAt: string;
  items: OrderItem[];
  subTotal: number;
  deliveryFee?: number;
  total: number;
  restaurantId: RestaurantSummary;
  customerId: CustomerSummary;
  deliveryAddressSnapshot: DeliveryAddressSnapshot;
}

interface DeliveredDriverOrder extends DriverOrder {
  deliveredAt: string;
}

const DriverDashboard = () => {
  const [driver, setDriver] = useState<DriverProfile | null>(null);
  const [order, setOrder] = useState<DriverOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState(false);

  useEffect(() => {
    const fetchDriverDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const [profileRes, orderRes] = await Promise.all([
          fetch("http://localhost:8080/api/driver/me", {
            credentials: "include",
          }),
          fetch("http://localhost:8080/api/driver/me/order", {
            credentials: "include",
          }),
        ]);

        const profileData = await profileRes.json().catch(() => ({}));
        const orderData = await orderRes.json().catch(() => ({}));

        if (!profileRes.ok) {
          throw new Error(
            profileData.message || "Failed to load driver profile",
          );
        }

        if (!orderRes.ok) {
          throw new Error(orderData.message || "Failed to load assigned order");
        }

        setDriver(profileData.driver || null);
        setOrder(orderData.order || null);
      } catch (err) {
        console.error(err);
        setError("Something went wrong while loading your driver dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchDriverDashboard();
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

  const getNextAction = () => {
    if (!order) return null;

    if (order.status === "ASSIGNED") {
      return {
        label: "Mark as Picked Up",
        endpoint: "picked-up",
      };
    }

    if (order.status === "PICKED_UP") {
      return {
        label: "Mark as On The Way",
        endpoint: "on-the-way",
      };
    }

    if (order.status === "ON_THE_WAY") {
      return {
        label: "Mark as Delivered",
        endpoint: "delivered",
      };
    }

    return null;
  };

  const handleUpdateOrderStatus = async () => {
    const nextAction = getNextAction();

    if (!order || !nextAction) return;

    try {
      setUpdatingOrderStatus(true);

      const res = await fetch(
        `http://localhost:8080/api/driver/me/order/${order._id}/${nextAction.endpoint}`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to update order status");
      }

      const updatedOrder = (data.order || null) as DriverOrder | null;

      if (updatedOrder?.status === "DELIVERED") {
        const nextHistoryEntry: DeliveredDriverOrder = {
          ...updatedOrder,
          deliveredAt: new Date().toISOString(),
        };

        try {
          const existingHistory = JSON.parse(
            localStorage.getItem(DRIVER_HISTORY_STORAGE_KEY) || "[]",
          ) as DeliveredDriverOrder[];

          const nextHistory = [
            nextHistoryEntry,
            ...existingHistory.filter(
              (item) => item._id !== nextHistoryEntry._id,
            ),
          ];

          localStorage.setItem(
            DRIVER_HISTORY_STORAGE_KEY,
            JSON.stringify(nextHistory),
          );
        } catch (storageError) {
          console.error("Failed to save driver history", storageError);
        }

        setOrder(null);
        return;
      }

      setOrder(updatedOrder);
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error
          ? err.message
          : "Something went wrong while updating the order status.",
      );
    } finally {
      setUpdatingOrderStatus(false);
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
  const driverLongitude = coordinates?.[0];
  const driverLatitude = coordinates?.[1];
  const nextAction = getNextAction();
  const showRouteMap =
    order?.status === "PICKED_UP" || order?.status === "ON_THE_WAY";

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
                      latitude={String(driverLongitude)}
                      longitude={String(driverLatitude)}
                      height="240px"
                      readOnly
                    />
                  </div>
                  <p className="card-text mb-1">
                    <strong>Latitude:</strong> {driverLatitude}
                  </p>
                  <p className="card-text mb-1">
                    <strong>Longitude:</strong> {driverLongitude}
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

        <div className="col-12 col-lg-6">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start gap-3 mb-3 flex-wrap">
                <div>
                  <h4 className="card-title mb-1">Current Order</h4>
                  <p className="text-muted mb-0">
                    Active delivery assigned to you
                  </p>
                </div>
                {order && (
                  <span className="badge text-bg-dark">{order.status}</span>
                )}
              </div>

              {!order ? (
                <div className="alert alert-secondary mb-0">
                  No active order assigned right now.
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <p className="mb-1">
                      <strong>Restaurant:</strong>{" "}
                      {order.restaurantId?.name || "Restaurant"}
                    </p>
                    <p className="mb-1">
                      <strong>Customer:</strong>{" "}
                      {order.customerId?.name || "Customer"}
                    </p>
                    {order.customerId?.phone && (
                      <p className="mb-1">
                        <strong>Phone:</strong> {order.customerId.phone}
                      </p>
                    )}
                    <p className="mb-0 text-muted">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {showRouteMap && coordinates && (
                    <div className="mb-3">
                      <h6>Driver and Customer Location</h6>
                      <LocationMap
                        latitude={String(driverLatitude)}
                        longitude={String(driverLongitude)}
                        height="260px"
                        readOnly
                        markers={[
                          {
                            latitude: String(driverLongitude),
                            longitude: String(driverLatitude),
                            label: "Driver location",
                          },
                          {
                            latitude: String(
                              order.deliveryAddressSnapshot.location
                                .coordinates[1],
                            ),
                            longitude: String(
                              order.deliveryAddressSnapshot.location
                                .coordinates[0],
                            ),
                            label: "Customer address",
                          },
                        ]}
                      />
                    </div>
                  )}

                  <div className="mb-3">
                    <h6>Delivery Address</h6>
                    <p className="mb-1">
                      {order.deliveryAddressSnapshot.address}
                    </p>
                    <p className="mb-0 text-muted">
                      {order.deliveryAddressSnapshot.city} -{" "}
                      {order.deliveryAddressSnapshot.pincode}
                    </p>
                  </div>

                  <div className="mb-3">
                    <h6>Items</h6>
                    {order.items.map((item, index) => (
                      <div
                        key={`${order._id}-${item.menuItemId}-${index}`}
                        className="d-flex justify-content-between align-items-center py-2 border-bottom"
                      >
                        <div>
                          <strong>{item.name}</strong>
                          <div className="text-muted small">
                            Rs. {item.price} x {item.quantity}
                          </div>
                        </div>
                        <div>Rs. {item.total}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mb-3">
                    <h6>Bill Summary</h6>
                    <div className="d-flex justify-content-between">
                      <span>Subtotal</span>
                      <span>Rs. {order.subTotal}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Delivery Fee</span>
                      <span>Rs. {order.deliveryFee ?? 0}</span>
                    </div>
                    <div className="d-flex justify-content-between fw-bold mt-2">
                      <span>Total</span>
                      <span>Rs. {order.total}</span>
                    </div>
                  </div>

                  {nextAction ? (
                    <button
                      className="btn btn-dark"
                      onClick={handleUpdateOrderStatus}
                      disabled={updatingOrderStatus}
                    >
                      {updatingOrderStatus ? "Updating..." : nextAction.label}
                    </button>
                  ) : (
                    <div className="alert alert-success mb-0">
                      This order has already been completed.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
