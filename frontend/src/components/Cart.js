// shopping cart component
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./Cart.css";

const Cart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ecoImpact, setEcoImpact] = useState(null);

  useEffect(() => {
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    try {
      const response = await fetch("/api/cart", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setCart(data.items);
      setEcoImpact(data.ecoImpact);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const response = await fetch(`/api/cart/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) throw new Error("Failed to update cart");

      fetchCart();
    } catch (error) {
      setError(error.message);
    }
  };

  const removeItem = async (productId) => {
    try {
      await fetch(`/api/cart/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      fetchCart();
    } catch (error) {
      setError(error.message);
    }
  };

  const checkout = async () => {
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Checkout failed");

      const order = await response.json();
      navigate(`/order/${order._id}`);
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) return <div>Loading cart...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="cart-container">
      <h2>Your Shopping Cart</h2>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <button onClick={() => navigate("/shop")}>Continue Shopping</button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.product._id} className="cart-item">
                <img src={item.product.images[0]} alt={item.product.name} />
                <div className="item-details">
                  <h3>{item.product.name}</h3>
                  <p className="price">${item.product.price}</p>
                  <div className="quantity-controls">
                    <button
                      onClick={() =>
                        updateQuantity(item.product._id, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product._id, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="remove-item"
                    onClick={() => removeItem(item.product._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="eco-impact">
              <h3>Your Eco Impact</h3>
              <p>🌱 Carbon Saved: {ecoImpact.carbonSaved}kg</p>
              <p>💧 Water Saved: {ecoImpact.waterSaved}L</p>
              <p>♻️ Plastic Reduced: {ecoImpact.plasticReduced}kg</p>
            </div>

            <div className="cart-total">
              <h3>
                Total: $
                {cart
                  .reduce(
                    (sum, item) => sum + item.product.price * item.quantity,
                    0
                  )
                  .toFixed(2)}
              </h3>
              <button className="checkout-button" onClick={checkout}>
                Proceed to Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
