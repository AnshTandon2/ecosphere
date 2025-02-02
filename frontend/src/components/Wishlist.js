// a wishlist component that allows users to add products to their wishlist and view them later

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./Wishlist.css";

const Wishlist = () => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const response = await fetch("/api/wishlist", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch wishlist");

      const data = await response.json();
      setWishlist(data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const response = await fetch(`/api/wishlist/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to remove from wishlist");

      setWishlist(wishlist.filter((item) => item.product._id !== productId));
      showNotification("Product removed from wishlist");
    } catch (error) {
      setError(error.message);
    }
  };

  const addToCart = async (productId) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          productId,
          quantity: 1,
        }),
      });

      if (!response.ok) throw new Error("Failed to add to cart");

      showNotification("Product added to cart");
    } catch (error) {
      setError(error.message);
    }
  };

  const shareWishlist = async (email) => {
    try {
      const response = await fetch("/api/wishlist/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error("Failed to share wishlist");

      setShareModalOpen(false);
      showNotification("Wishlist shared successfully");
    } catch (error) {
      setError(error.message);
    }
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const moveToTop = async (productId) => {
    try {
      const response = await fetch(`/api/wishlist/reorder`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ productId, position: 0 }),
      });

      if (!response.ok) throw new Error("Failed to reorder wishlist");

      fetchWishlist();
    } catch (error) {
      setError(error.message);
    }
  };

  const ShareModal = () => (
    <div className="share-modal">
      <div className="modal-content">
        <h3>Share Your Wishlist</h3>
        <input
          type="email"
          placeholder="Enter email address"
          onChange={(e) => setSelectedProduct(e.target.value)}
        />
        <div className="modal-actions">
          <button onClick={() => shareWishlist(selectedProduct)}>Share</button>
          <button onClick={() => setShareModalOpen(false)}>Cancel</button>
        </div>
      </div>
    </div>
  );

  if (loading)
    return <div className="wishlist-loading">Loading wishlist...</div>;
  if (error) return <div className="wishlist-error">Error: {error}</div>;

  return (
    <div className="wishlist-container">
      <div className="wishlist-header">
        <h2>My Wishlist ({wishlist.length} items)</h2>
        <button
          className="share-button"
          onClick={() => setShareModalOpen(true)}
          disabled={wishlist.length === 0}
        >
          Share Wishlist
        </button>
      </div>

      {wishlist.length === 0 ? (
        <div className="empty-wishlist">
          <h3>Your wishlist is empty</h3>
          <p>
            Add items to your wishlist while shopping to save them for later!
          </p>
          <Link to="/shop" className="shop-button">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="wishlist-grid">
          {wishlist.map((item, index) => (
            <div key={item.product._id} className="wishlist-item">
              <div className="item-image">
                <img src={item.product.images[0]} alt={item.product.name} />
                {index !== 0 && (
                  <button
                    className="move-top-button"
                    onClick={() => moveToTop(item.product._id)}
                    title="Move to top"
                  >
                    ↑
                  </button>
                )}
              </div>
              <div className="item-details">
                <h3>{item.product.name}</h3>
                <p className="price">${item.product.price.toFixed(2)}</p>
                <div className="eco-badges">
                  {Object.entries(item.product.ecoAttributes)
                    .filter(([_, value]) => value)
                    .map(([key]) => (
                      <span key={key} className="eco-badge">
                        {key}
                      </span>
                    ))}
                </div>
                <div className="stock-status">
                  {item.product.stock > 0 ? (
                    <span className="in-stock">In Stock</span>
                  ) : (
                    <span className="out-of-stock">Out of Stock</span>
                  )}
                </div>
                <div className="item-actions">
                  <button
                    className="add-to-cart"
                    onClick={() => addToCart(item.product._id)}
                    disabled={item.product.stock === 0}
                  >
                    Add to Cart
                  </button>
                  <button
                    className="remove-button"
                    onClick={() => removeFromWishlist(item.product._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {shareModalOpen && <ShareModal />}

      {notification && <div className="notification">{notification}</div>}
    </div>
  );
};

export default Wishlist;
