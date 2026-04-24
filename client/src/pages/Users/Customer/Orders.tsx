import { useEffect, useState } from "react";

interface Location {
  type: "Point";
  coordinates: [number, number];
}

interface DeliveryAddressSnapshot {
  address: string;
  city: string;
  pincode: string;
  location: Location;
}

interface OrderItem {
  menuItemId: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  total: number;
}

interface RestaurantSummary {
  _id: string;
  name: string;
  image?: string;
}

interface CustomerOrder {
  _id: string;
  status: string;
  items: OrderItem[];
  subTotal: number;
  deliveryFee?: number;
  total: number;
  deliveryAddressSnapshot: DeliveryAddressSnapshot;
  createdAt: string;
  restaurantId: RestaurantSummary;
}

const Orders = () => {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("http://localhost:8080/api/orders/my", {
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.message || "Failed to load orders");
        }

        const nextOrders = ((data.orders || []) as CustomerOrder[]).filter(
          (order) => order.status !== "DELIVERED",
        );
        setOrders(nextOrders);
        setActiveOrderId(nextOrders[0]?._id ?? null);
      } catch (err) {
        console.error(err);
        setError("Something went wrong while loading your orders.");
        setOrders([]);
        setActiveOrderId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const activeOrder =
    orders.find((order) => order._id === activeOrderId) || null;

  return (
    <div className="container mt-4">
      <h3 className="mb-3">My Orders</h3>

      {loading ? (
        <p>Loading orders...</p>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="alert alert-secondary" role="alert">
          No orders yet.
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-12 col-lg-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title mb-3">Orders</h5>

                <div className="d-flex flex-column gap-3">
                  {orders.map((order) => (
                    <button
                      key={order._id}
                      type="button"
                      className={`card text-start ${
                        activeOrderId === order._id
                          ? "border-dark"
                          : "border-light"
                      }`}
                      onClick={() => setActiveOrderId(order._id)}
                    >
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                          <div className="fw-semibold">
                            {order.restaurantId?.name || "Restaurant"}
                          </div>
                          <span className="badge text-bg-dark">
                            {order.status}
                          </span>
                        </div>
                        <div className="text-muted small mb-2">
                          {new Date(order.createdAt).toLocaleString()}
                        </div>
                        <div className="d-flex flex-column gap-1">
                          {order.items.map((item, index) => (
                            <span
                              key={`${order._id}-${item.menuItemId}-${index}`}
                            >
                              <strong>{item.name}</strong> x <strong>{item.quantity}</strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-8">
            <div className="card h-100">
              <div className="card-body">
                {!activeOrder ? (
                  <p className="text-muted mb-0">
                    Select an order to view its details.
                  </p>
                ) : (
                  <>
                    <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-3">
                      <div>
                        <h4 className="mb-1">
                          {activeOrder.restaurantId?.name || "Restaurant"}
                        </h4>
                        <p className="text-muted mb-1">
                          Order ID: {activeOrder._id}
                        </p>
                        <p className="text-muted mb-0">
                          {new Date(activeOrder.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <span className="badge text-bg-dark">
                        {activeOrder.status}
                      </span>
                    </div>

                    <div className="mb-4">
                      <h6>Items</h6>
                      {activeOrder.items.map((item, index) => (
                        <div
                          key={`${activeOrder._id}-${item.menuItemId}-${index}`}
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

                    <div className="row g-3">
                      <div className="col-12 col-md-7">
                        <h6>Delivery Address</h6>
                        <p className="mb-1">
                          {activeOrder.deliveryAddressSnapshot.address}
                        </p>
                        <p className="mb-0 text-muted">
                          {activeOrder.deliveryAddressSnapshot.city} -{" "}
                          {activeOrder.deliveryAddressSnapshot.pincode}
                        </p>
                      </div>

                      <div className="col-12 col-md-5">
                        <h6>Bill Summary</h6>
                        <div className="d-flex justify-content-between">
                          <span>Subtotal</span>
                          <span>Rs. {activeOrder.subTotal}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span>Delivery Fee</span>
                          <span>Rs. {activeOrder.deliveryFee ?? 0}</span>
                        </div>
                        <div className="d-flex justify-content-between fw-bold mt-2">
                          <span>Total</span>
                          <span>Rs. {activeOrder.total}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
