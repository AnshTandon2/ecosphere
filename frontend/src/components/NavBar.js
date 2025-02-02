// navigation bar componenet with eco friendly theme consistent

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./NavBar.css";

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <img src="/logo.svg" alt="EcoSphere" className="navbar-logo" />
        </Link>
      </div>

      <div className={`navbar-menu ${isMenuOpen ? "is-active" : ""}`}>
        <div className="navbar-start">
          <Link to="/shop" className="navbar-item">
            Shop
          </Link>
          <div className="navbar-item has-dropdown">
            <button className="navbar-link">Categories</button>
            <div className="navbar-dropdown">
              <Link to="/category/organic" className="navbar-item">
                Organic
              </Link>
              <Link to="/category/recycled" className="navbar-item">
                Recycled
              </Link>
              <Link to="/category/sustainable" className="navbar-item">
                Sustainable
              </Link>
            </div>
          </div>
          <Link to="/impact" className="navbar-item">
            Eco Impact
          </Link>
        </div>

        <div className="navbar-end">
          <div className="navbar-item">
            <Link to="/cart" className="cart-icon">
              <span className="icon">🛒</span>
            </Link>
          </div>

          {user ? (
            <div className="navbar-item has-dropdown">
              <button className="navbar-link">{user.name}</button>
              <div className="navbar-dropdown">
                <Link to="/dashboard" className="navbar-item">
                  Dashboard
                </Link>
                <Link to="/orders" className="navbar-item">
                  Orders
                </Link>
                <Link to="/wishlist" className="navbar-item">
                  Wishlist
                </Link>
                <hr className="navbar-divider" />
                <button onClick={handleLogout} className="navbar-item">
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="navbar-item">
              <div className="buttons">
                <Link to="/register" className="button is-primary">
                  Sign Up
                </Link>
                <Link to="/login" className="button is-light">
                  Log In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
