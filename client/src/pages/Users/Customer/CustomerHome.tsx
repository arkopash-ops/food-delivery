import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Location {
  type: "Point";
  coordinates: [number, number];
}

interface Address {
  _id: string;
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
}

interface MenuItem {
  _id: string;
  name: string;
  image?: string;
  price: number;
  isAvailable: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
  restaurantId: string;
}

const CustomerHome = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menuItemsByRestaurant, setMenuItemsByRestaurant] = useState<
    Record<string, MenuItem[]>
  >({});
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderMessage, setOrderMessage] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/restaurant", {
          credentials: "include",
        });

        const data = await res.json();
        const restaurantsList = data.restaurants || [];
        setRestaurants(restaurantsList);

        const menus: Record<string, MenuItem[]> = {};

        await Promise.all(
          restaurantsList.map(async (r: Restaurant) => {
            const menuRes = await fetch(
              `http://localhost:8080/api/restaurant/${r._id}/menu`,
              { credentials: "include" },
            );
            const menuData = await menuRes.json();
            menus[r._id] = menuData.items || [];
          }),
        );

        setMenuItemsByRestaurant(menus);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const addToCart = (item: MenuItem, restaurantId: string) => {
    setCart((prev) => {
      if (prev.length > 0 && prev[0].restaurantId !== restaurantId) {
        alert(
          "You can only order from one restaurant at a time. Clear cart first.",
        );
        return prev;
      }

      const existing = prev.find((c) => c._id === item._id);

      if (existing) {
        return prev.map((c) =>
          c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }

      return [...prev, { ...item, quantity: 1, restaurantId }];
    });
  };

  const increaseQty = (id: string) => {
    setCart((prev) =>
      prev.map((c) => (c._id === id ? { ...c, quantity: c.quantity + 1 } : c)),
    );
  };

  const decreaseQty = (id: string) => {
    setCart((prev) =>
      prev
        .map((c) => (c._id === id ? { ...c, quantity: c.quantity - 1 } : c))
        .filter((c) => c.quantity > 0),
    );
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const total = subtotal;

  const fetchAddresses = async () => {
    try {
      setLoadingAddresses(true);
      setOrderError(null);

      const res = await fetch("http://localhost:8080/api/address", {
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to load addresses");
      }

      const savedAddresses = data.addresses || [];
      setAddresses(savedAddresses);

      if (savedAddresses.length > 0) {
        setSelectedAddressId((prev) => prev || savedAddresses[0]._id);
      } else {
        setSelectedAddressId("");
      }
    } catch (error) {
      console.error(error);
      setOrderError("Could not load your saved addresses.");
    } finally {
      setLoadingAddresses(false);
    }
  };

  const openAddressSelection = async () => {
    setOrderMessage(null);
    await fetchAddresses();
  };

  const placeOrder = async () => {
    if (cart.length === 0) {
      setOrderError("Your cart is empty.");
      return;
    }

    if (!selectedAddressId) {
      setOrderError("Please select a delivery address.");
      return;
    }

    try {
      setPlacingOrder(true);
      setOrderError(null);
      setOrderMessage(null);

      const res = await fetch("http://localhost:8080/api/orders", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deliveryAddressId: selectedAddressId,
          items: cart.map((item) => ({
            menuItemId: item._id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Failed to place order");
      }

      setCart([]);
      setOrderMessage("Order placed successfully.");
      alert("Order placed successfully.");
      setSelectedAddressId("");
    } catch (error) {
      console.error(error);
      setOrderError(
        error instanceof Error ? error.message : "Failed to place order.",
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Restaurants</h3>

        <button
          className="btn btn-dark"
          data-bs-toggle="offcanvas"
          data-bs-target="#cartCanvas"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-cart4"
            viewBox="0 0 16 16"
          >
            <path d="M0 2.5A.5.5 0 0 1 .5 2H2a.5.5 0 0 1 .485.379L2.89 4H14.5a.5.5 0 0 1 .485.621l-1.5 6A.5.5 0 0 1 13 11H4a.5.5 0 0 1-.485-.379L1.61 3H.5a.5.5 0 0 1-.5-.5M3.14 5l.5 2H5V5zM6 5v2h2V5zm3 0v2h2V5zm3 0v2h1.36l.5-2zm1.11 3H12v2h.61zM11 8H9v2h2zM8 8H6v2h2zM5 8H3.89l.5 2H5zm0 5a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0m9-1a1 1 0 1 0 0 2 1 1 0 0 0 0-2m-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0" />
          </svg>{" "}
          ({cart.length})
        </button>
      </div>

      {restaurants.map((restaurant) => {
        const items = menuItemsByRestaurant[restaurant._id] || [];

        return (
          <div className="mb-4" key={restaurant._id}>
            <h4 className="mb-3">{restaurant.name}</h4>

            <div className="d-flex gap-3 overflow-auto">
              {items.map((item) => {
                const cartItem = cart.find((c) => c._id === item._id);

                return (
                  <div
                    key={item._id}
                    className="card"
                    style={{ minWidth: "300px" }}
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        className="card-img-top"
                        style={{ height: "220px", objectFit: "cover" }}
                      />
                    )}

                    <div className="card-body">
                      <h6>{item.name}</h6>
                      <small>Rs. {item.price}</small>

                      <div className="mt-2">
                        {cartItem ? (
                          <div className="d-flex gap-2 align-items-center">
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => decreaseQty(item._id)}
                            >
                              -
                            </button>

                            <span>{cartItem.quantity}</span>

                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => increaseQty(item._id)}
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => addToCart(item, restaurant._id)}
                          >
                            Add to Cart
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/*cart offcanvas */}

      <div className="offcanvas offcanvas-end" tabIndex={-1} id="cartCanvas">
        <div className="offcanvas-header">
          <h5>Cart</h5>
          <button className="btn-close" data-bs-dismiss="offcanvas" />
        </div>

        <div className="offcanvas-body">
          {cart.length === 0 ? (
            <p>Cart is empty</p>
          ) : (
            <>
              {cart.map((item) => (
                <div key={item._id} className="mb-3">
                  <div>
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: "100%",
                          height: "140px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          marginBottom: "8px",
                        }}
                      />
                    )}
                  </div>
                  <div className="d-flex justify-content-between">
                    <strong>{item.name}</strong>
                    <span>Rs. {item.price * item.quantity}</span>
                  </div>

                  <div className="d-flex gap-2 align-items-center mt-1">
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => decreaseQty(item._id)}
                    >
                      -
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => increaseQty(item._id)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}

              <hr />

              <div className="d-flex justify-content-between">
                <span>Subtotal</span>
                <span>Rs. {subtotal}</span>
              </div>

              <div className="d-flex justify-content-between fw-bold mt-2">
                <span>Total</span>
                <span>Rs. {total}</span>
              </div>

              {orderMessage && (
                <div className="alert alert-success mt-3 mb-0" role="alert">
                  {orderMessage}
                </div>
              )}

              {orderError && (
                <div className="alert alert-danger mt-3 mb-0" role="alert">
                  {orderError}
                </div>
              )}

              <div className="card mt-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="mb-0">Delivery Address</h6>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={openAddressSelection}
                      disabled={loadingAddresses || placingOrder}
                    >
                      {loadingAddresses ? "Loading..." : "Select Address"}
                    </button>
                  </div>

                  {addresses.length > 0 ? (
                    <div className="d-grid gap-2">
                      {addresses.map((item) => (
                        <label
                          key={item._id}
                          className={`border rounded p-2 ${
                            selectedAddressId === item._id
                              ? "border-primary bg-light"
                              : ""
                          }`}
                        >
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="deliveryAddress"
                              checked={selectedAddressId === item._id}
                              onChange={() => setSelectedAddressId(item._id)}
                              disabled={placingOrder}
                            />
                            <span className="form-check-label">
                              <strong>{item.address}</strong>
                              <br />
                              {item.city} - {item.pincode}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : loadingAddresses ? (
                    <p className="text-muted mb-0">
                      Loading saved addresses...
                    </p>
                  ) : (
                    <div className="mb-0">
                      <p className="text-muted mb-2">
                        No saved addresses found. Add one first to place your
                        order.
                      </p>
                      <Link
                        to="/customer/address"
                        className="btn btn-sm btn-outline-primary"
                      >
                        Manage Addresses
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              <button
                className="btn btn-success w-100 mt-3"
                onClick={placeOrder}
                disabled={
                  placingOrder ||
                  loadingAddresses ||
                  cart.length === 0 ||
                  !selectedAddressId
                }
              >
                {placingOrder ? "Placing Order..." : "Place Order"}
              </button>

              <button
                className="btn btn-outline-danger w-100 mt-2"
                onClick={() => {
                  setCart([]);
                  setOrderError(null);
                  setOrderMessage(null);
                }}
              >
                Clear Cart
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerHome;
