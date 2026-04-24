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
  price: number;
  quantity: number;
  total: number;
}

interface RatingValue {
  rating: number;
  comment?: string;
}

interface RestaurantSummary {
  _id: string;
  name: string;
}

interface DriverSummary {
  _id: string;
  driverId?: {
    _id: string;
    name: string;
    phone?: string;
  };
}

interface DeliveredOrder {
  _id: string;
  status: string;
  items: OrderItem[];
  subTotal: number;
  deliveryFee?: number;
  total: number;
  deliveryAddressSnapshot: DeliveryAddressSnapshot;
  createdAt: string;
  restaurantId: RestaurantSummary;
  driverId?: DriverSummary | null;
  restaurantRating?: RatingValue | null;
  driverRating?: RatingValue | null;
}

interface RatingFormState {
  restaurantRating: string;
  restaurantComment: string;
  driverRating: string;
  driverComment: string;
}

const createInitialFormState = (order: DeliveredOrder): RatingFormState => ({
  restaurantRating: order.restaurantRating?.rating
    ? String(order.restaurantRating.rating)
    : "",
  restaurantComment: order.restaurantRating?.comment || "",
  driverRating: order.driverRating?.rating
    ? String(order.driverRating.rating)
    : "",
  driverComment: order.driverRating?.comment || "",
});

const History = () => {
  const [orders, setOrders] = useState<DeliveredOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [ratingForms, setRatingForms] = useState<
    Record<string, RatingFormState>
  >({});
  const [submittingOrderId, setSubmittingOrderId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("http://localhost:8080/api/orders/my", {
          credentials: "include",
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.message || "Failed to load history");
        }

        const deliveredOrders = (
          (data.orders || []) as DeliveredOrder[]
        ).filter((order) => order.status === "DELIVERED");

        setOrders(deliveredOrders);
        setActiveOrderId(deliveredOrders[0]?._id ?? null);
        setRatingForms(
          deliveredOrders.reduce<Record<string, RatingFormState>>(
            (acc, order) => {
              acc[order._id] = createInitialFormState(order);
              return acc;
            },
            {},
          ),
        );
      } catch (err) {
        console.error(err);
        setError("Something went wrong while loading your delivered orders.");
        setOrders([]);
        setActiveOrderId(null);
        setRatingForms({});
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const activeOrder =
    orders.find((order) => order._id === activeOrderId) || null;
  const activeForm = activeOrder
    ? ratingForms[activeOrder._id] || createInitialFormState(activeOrder)
    : null;
  const driverName = activeOrder?.driverId?.driverId?.name || "Driver";

  const handleFormChange = (
    orderId: string,
    field: keyof RatingFormState,
    value: string,
  ) => {
    setRatingForms((prev) => ({
      ...prev,
      [orderId]: {
        ...(prev[orderId] || {
          restaurantRating: "",
          restaurantComment: "",
          driverRating: "",
          driverComment: "",
        }),
        [field]: value,
      },
    }));
  };

  const handleSubmitRatings = async () => {
    if (!activeOrder || !activeForm) return;

    const payload: {
      restaurantRating?: RatingValue;
      driverRating?: RatingValue;
    } = {};

    if (activeForm.restaurantRating) {
      payload.restaurantRating = {
        rating: Number(activeForm.restaurantRating),
        comment: activeForm.restaurantComment.trim() || undefined,
      };
    }

    if (activeOrder.driverId && activeForm.driverRating) {
      payload.driverRating = {
        rating: Number(activeForm.driverRating),
        comment: activeForm.driverComment.trim() || undefined,
      };
    }

    if (!payload.restaurantRating && !payload.driverRating) {
      alert("Please add at least one rating before submitting.");
      return;
    }

    try {
      setSubmittingOrderId(activeOrder._id);

      const res = await fetch(
        `http://localhost:8080/api/orders/${activeOrder._id}/rating`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to save ratings");
      }

      const updatedOrder = data.order as DeliveredOrder;
      setOrders((prev) =>
        prev.map((order) =>
          order._id === updatedOrder._id ? updatedOrder : order,
        ),
      );
      setRatingForms((prev) => ({
        ...prev,
        [updatedOrder._id]: createInitialFormState(updatedOrder),
      }));
      alert("Ratings saved successfully.");
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to save ratings.");
    } finally {
      setSubmittingOrderId(null);
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Order History</h3>

      {loading ? (
        <p>Loading delivered orders...</p>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="alert alert-secondary" role="alert">
          No delivered orders yet.
        </div>
      ) : (
        <div className="row g-4">
          <div className="col-12 col-lg-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title mb-3">Delivered Orders</h5>

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
                          <span className="badge text-bg-success">
                            {order.status}
                          </span>
                        </div>
                        <div className="text-muted small mb-2">
                          {new Date(order.createdAt).toLocaleString()}
                        </div>
                        <div className="small">
                          Restaurant rating:{" "}
                          {order.restaurantRating?.rating
                            ? `${order.restaurantRating.rating}/5`
                            : "Pending"}
                        </div>
                        <div className="small">
                          Driver rating:{" "}
                          {order.driverRating?.rating
                            ? `${order.driverRating.rating}/5`
                            : "Pending"}
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
                {!activeOrder || !activeForm ? (
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

                      <span className="badge text-bg-success">
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

                    <div className="border rounded p-3">
                      <h5 className="mb-3">Ratings</h5>

                      <div className="row g-3">
                        <div className="col-12 col-md-6">
                          <label
                            htmlFor={`restaurant-rating-${activeOrder._id}`}
                            className="form-label"
                          >
                            Restaurant Rating
                          </label>
                          <select
                            id={`restaurant-rating-${activeOrder._id}`}
                            className="form-select"
                            value={activeForm.restaurantRating}
                            onChange={(event) =>
                              handleFormChange(
                                activeOrder._id,
                                "restaurantRating",
                                event.target.value,
                              )
                            }
                          >
                            <option value="">Select rating</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                          </select>
                          <textarea
                            className="form-control mt-2"
                            rows={3}
                            placeholder="Write about the restaurant experience"
                            value={activeForm.restaurantComment}
                            onChange={(event) =>
                              handleFormChange(
                                activeOrder._id,
                                "restaurantComment",
                                event.target.value,
                              )
                            }
                          />
                        </div>

                        <div className="col-12 col-md-6">
                          <label
                            htmlFor={`driver-rating-${activeOrder._id}`}
                            className="form-label"
                          >
                            {driverName} Rating
                          </label>
                          <select
                            id={`driver-rating-${activeOrder._id}`}
                            className="form-select"
                            value={activeForm.driverRating}
                            onChange={(event) =>
                              handleFormChange(
                                activeOrder._id,
                                "driverRating",
                                event.target.value,
                              )
                            }
                            disabled={!activeOrder.driverId}
                          >
                            <option value="">Select rating</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                          </select>
                          <textarea
                            className="form-control mt-2"
                            rows={3}
                            placeholder="Write about the delivery experience"
                            value={activeForm.driverComment}
                            onChange={(event) =>
                              handleFormChange(
                                activeOrder._id,
                                "driverComment",
                                event.target.value,
                              )
                            }
                            disabled={!activeOrder.driverId}
                          />
                        </div>
                      </div>

                      <div className="mt-3 d-flex justify-content-between align-items-center gap-3 flex-wrap">
                        <button
                          type="button"
                          className="btn btn-dark"
                          onClick={handleSubmitRatings}
                          disabled={submittingOrderId === activeOrder._id}
                        >
                          {submittingOrderId === activeOrder._id
                            ? "Saving..."
                            : "Save Ratings"}
                        </button>
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

export default History;
