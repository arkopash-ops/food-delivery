import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

type OrderStatus = "PLACED" | "ACCEPTED" | "REJECTED";

interface OrderItem {
  menuItemId: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  total: number;
}

interface DeliveryAddressSnapshot {
  address: string;
  city: string;
  pincode: string;
}

interface CustomerSummary {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

interface ManagerOrder {
  _id: string;
  status: OrderStatus;
  items: OrderItem[];
  subTotal: number;
  deliveryFee?: number;
  total: number;
  deliveryAddressSnapshot: DeliveryAddressSnapshot;
  createdAt: string;
  customerId: CustomerSummary;
}

const tabs: OrderStatus[] = ["PLACED", "ACCEPTED", "REJECTED"];

const actionConfig = {
  accept: {
    label: "Accept",
    endpoint: "accept",
    nextStatus: "ACCEPTED" as OrderStatus,
  },
  reject: {
    label: "Reject",
    endpoint: "reject",
    nextStatus: "REJECTED" as OrderStatus,
  },
  ready: {
    label: "Mark Ready",
    endpoint: "ready",
    nextStatus: "READY" as OrderStatus,
  },
};

const getValidStatus = (value: string | null): OrderStatus => {
  return tabs.includes(value as OrderStatus)
    ? (value as OrderStatus)
    : "PLACED";
};

const Order = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<ManagerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [actingOrderId, setActingOrderId] = useState<string | null>(null);

  const activeStatus = getValidStatus(searchParams.get("status"));
  const focusedOrderId = searchParams.get("orderId");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `http://localhost:8080/api/restaurant/me/order?status=${activeStatus}`,
          {
            credentials: "include",
          },
        );
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.message || "Failed to load orders");
        }

        const nextOrders = (data.orders || []) as ManagerOrder[];
        setOrders(nextOrders);

        const targetOrder =
          nextOrders.find((order) => order._id === focusedOrderId) ||
          nextOrders[0] ||
          null;

        setActiveOrderId(targetOrder?._id ?? null);
      } catch (err) {
        console.error(err);
        setError("Something went wrong while loading orders.");
        setOrders([]);
        setActiveOrderId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [activeStatus, focusedOrderId]);

  const activeOrder =
    orders.find((order) => order._id === activeOrderId) || null;

  const setStatusTab = (status: OrderStatus) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("status", status);
    nextParams.delete("orderId");
    setSearchParams(nextParams);
  };

  const handleOrderClick = (orderId: string) => {
    setActiveOrderId(orderId);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("status", activeStatus);
    nextParams.set("orderId", orderId);
    setSearchParams(nextParams);
  };

  const refreshForStatus = (status: OrderStatus, orderId?: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("status", status);

    if (orderId) {
      nextParams.set("orderId", orderId);
    } else {
      nextParams.delete("orderId");
    }

    setSearchParams(nextParams);
  };

  const handleAction = async (
    orderId: string,
    action: keyof typeof actionConfig,
  ) => {
    const config = actionConfig[action];

    try {
      setActingOrderId(orderId);

      const res = await fetch(
        `http://localhost:8080/api/restaurant/me/order/${orderId}/${config.endpoint}`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || `Failed to ${action} order`);
      }

      refreshForStatus(config.nextStatus, data.order?._id);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to update order");
    } finally {
      setActingOrderId(null);
    }
  };

  const renderActions = (order: ManagerOrder) => {
    if (order.status === "PLACED") {
      return (
        <div className="d-flex gap-2 flex-wrap">
          <button
            className="btn btn-success"
            onClick={() => handleAction(order._id, "accept")}
            disabled={actingOrderId === order._id}
          >
            {actingOrderId === order._id
              ? "Updating..."
              : actionConfig.accept.label}
          </button>
          <button
            className="btn btn-outline-danger"
            onClick={() => handleAction(order._id, "reject")}
            disabled={actingOrderId === order._id}
          >
            {actingOrderId === order._id
              ? "Updating..."
              : actionConfig.reject.label}
          </button>
        </div>
      );
    }

    if (order.status === "ACCEPTED") {
      return (
        <button
          className="btn btn-primary"
          onClick={() => handleAction(order._id, "ready")}
          disabled={actingOrderId === order._id}
        >
          {actingOrderId === order._id
            ? "Updating..."
            : actionConfig.ready.label}
        </button>
      );
    }

    return null;
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Restaurant Orders</h3>

      <div className="d-flex gap-2 flex-wrap mb-4">
        {tabs.map((status) => (
          <button
            key={status}
            className={`btn ${
              activeStatus === status ? "btn-dark" : "btn-outline-dark"
            }`}
            onClick={() => setStatusTab(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-12 col-lg-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title mb-3">{activeStatus} Orders</h5>

                {orders.length === 0 ? (
                  <p className="text-muted mb-0">
                    No {activeStatus.toLowerCase()} orders found.
                  </p>
                ) : (
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
                        onClick={() => handleOrderClick(order._id)}
                      >
                        <div className="card-body">
                          <div className="fw-semibold mb-2">
                            Order #{order._id.slice(-6)}
                          </div>
                          <div className="text-muted small mb-2">
                            {new Date(order.createdAt).toLocaleString()}
                          </div>
                          <div className="d-flex flex-column gap-1">
                            {order.items.map((item, index) => (
                              <span key={`${order._id}-${item.menuItemId}-${index}`}>
                                {item.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
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
                        <h4 className="mb-1">Order Details</h4>
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
                      <h6>Customer</h6>
                      <p className="mb-1">{activeOrder.customerId?.name}</p>
                      <p className="mb-1 text-muted">
                        {activeOrder.customerId?.email}
                      </p>
                      <p className="mb-0 text-muted">
                        {activeOrder.customerId?.phone}
                      </p>
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

                    <div className="row g-3 mb-4">
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

                    {renderActions(activeOrder)}
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

export default Order;
