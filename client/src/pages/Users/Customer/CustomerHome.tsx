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

              <button className="btn btn-success w-100 mt-3">
                Place Order
              </button>

              <button
                className="btn btn-outline-danger w-100 mt-2"
                onClick={() => setCart([])}
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
