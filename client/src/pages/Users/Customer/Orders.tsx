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

        setOrders(data.orders || []);
      } catch (err) {
        console.error(err);
        setError("Something went wrong while loading your orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>My Orders</h3>
      </div>

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
        <div className="row g-3">
          {orders.map((order) => (
            <div className="col-12" key={order._id}>
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                    <div>
                      <h5 className="mb-1">
                        {order.restaurantId?.name || "Restaurant"}
                      </h5>
                      <p className="text-muted mb-1">
                        Order ID: {order._id}
                      </p>
                      <p className="text-muted mb-0">
                        Placed on{" "}
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <span className="badge text-bg-dark">{order.status}</span>
                  </div>

                  <hr />

                  <div className="mb-3">
                    <h6 className="mb-2">Items</h6>
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

                  <div className="row g-3">
                    <div className="col-12 col-md-7">
                      <h6 className="mb-2">Delivery Address</h6>
                      <p className="mb-1">
                        {order.deliveryAddressSnapshot.address}
                      </p>
                      <p className="mb-0 text-muted">
                        {order.deliveryAddressSnapshot.city} -{" "}
                        {order.deliveryAddressSnapshot.pincode}
                      </p>
                    </div>

                    <div className="col-12 col-md-5">
                      <h6 className="mb-2">Bill Summary</h6>
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
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
