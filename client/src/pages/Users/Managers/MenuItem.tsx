import { useEffect, useState } from "react";

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

const MenuItemPage = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [errors, setErrors] = useState<{
    name?: string;
    price?: string;
    categoryId?: string;
    description?: string;
  }>({});

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setCategoryId("");
    setIsAvailable(true);
    setImageFile(null);
    setEditingId(null);
  };

  const fetchCategories = async () => {
    const res = await fetch("http://localhost:8080/api/category");
    const data = await res.json();
    setCategories(data.categories || []);
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`http://localhost:8080/api/menu/items/my`, {
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to load menu items");
      }

      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error(err);
      setError("Something went wrong while fetching items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await Promise.all([fetchCategories(), fetchItems()]);
    })();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: {
      name?: string;
      price?: string;
      categoryId?: string;
      description?: string;
    } = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    } else if (name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }

    if (!price) {
      newErrors.price = "Price is required";
    } else if (Number(price) <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (!categoryId) {
      newErrors.categoryId = "Category is required";
    }

    if (description && description.trim().length < 5) {
      newErrors.description = "Description must be at least 5 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      setSubmitting(true);
      setError(null);

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("price", price);
      formData.append("category", categoryId);
      formData.append("isAvailable", String(isAvailable));
      if (description.trim()) {
        formData.append("description", description.trim());
      }
      if (imageFile) {
        formData.append("image", imageFile);
      }

      let res: Response;
      if (!editingId) {
        res = await fetch("http://localhost:8080/api/menu/items", {
          method: "POST",
          credentials: "include",
          body: formData,
        });
      } else {
        res = await fetch(`http://localhost:8080/api/menu/items/${editingId}`, {
          method: "PATCH",
          credentials: "include",
          body: formData,
        });
      }

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.message ||
            (editingId
              ? "Failed to update menu item"
              : "Failed to create menu item"),
        );
      }

      const item: MenuItem = data.item;

      if (!editingId) {
        setItems((prev) => [...prev, item]);
      } else {
        setItems((prev) => prev.map((i) => (i._id === editingId ? item : i)));
      }

      resetForm();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (item: MenuItem) => {
    setEditingId(item._id);
    setName(item.name);
    setDescription(item.description || "");
    setPrice(String(item.price));
    const catId =
      typeof item.category === "string" ? item.category : item.category?._id;
    setCategoryId(catId || "");
    setIsAvailable(item.isAvailable);
    setImageFile(null);
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <h3>Menu Items</h3>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <h3>Menu Items</h3>
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h3>Menu Items</h3>

      {/* form */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">
            {editingId ? "Edit Menu Item" : "Add Menu Item"}
          </h5>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                type="text"
                className={`form-control ${errors.name ? "is-invalid" : ""}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={submitting}
              />
              {errors.name && (
                <small className="text-danger">{errors.name}</small>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className={`form-control ${errors.description ? "is-invalid" : ""}`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={submitting}
              />
              {errors.description && (
                <small className="text-danger">{errors.description}</small>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={`form-control ${errors.price ? "is-invalid" : ""}`}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={submitting}
              />
              {errors.price && (
                <small className="text-danger">{errors.price}</small>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Category *</label>
              <select
                className={`form-select ${errors.categoryId ? "is-invalid" : ""}`}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={submitting}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <small className="text-danger">{errors.categoryId}</small>
              )}
            </div>

            <div className="mb-3 form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="isAvailable"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                disabled={submitting}
              />
              <label className="form-check-label" htmlFor="isAvailable">
                Available
              </label>
            </div>

            <div className="mb-3">
              <label className="form-label">Image</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setImageFile(file);
                }}
                disabled={submitting}
              />
            </div>

            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting
                  ? "Saving..."
                  : editingId
                    ? "Update Item"
                    : "Add Item"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                  disabled={submitting}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* table */}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Description</th>
            <th>Category</th>
            <th>Price</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={6}>No menu items found.</td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item._id}>
                <td>
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td>{item.name}</td>
                <td>{item.description}</td>
                <td>
                  {typeof item.category === "string"
                    ? item.category
                    : item.category?.name}
                </td>
                <td>₹{item.price}</td>
                <td>{item.isAvailable ? "Available" : "Unavailable"}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => handleEditClick(item)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MenuItemPage;
