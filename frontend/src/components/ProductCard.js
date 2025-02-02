// display product information with image, name, price, and add to cart button

import React from "react";
import { Link } from "react-router-dom";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  const { _id, name, price, images, ecoAttributes, averageRating, ecoImpact } =
    product;

  const renderEcoAttributes = () => {
    return Object.entries(ecoAttributes)
      .filter(([_, value]) => value)
      .map(([key]) => (
        <span key={key} className={`eco-badge ${key.toLowerCase()}`}>
          {key.replace(/([A-Z])/g, " $1").trim()}
        </span>
      ));
  };

  const renderEcoImpact = () => {
    return (
      <div className="eco-impact">
        {ecoImpact.carbonFootprint && (
          <span>🌱 {ecoImpact.carbonFootprint}kg CO2 saved</span>
        )}
        {ecoImpact.waterSaved && (
          <span>💧 {ecoImpact.waterSaved}L water saved</span>
        )}
      </div>
    );
  };

  return (
    <div className="product-card">
      <Link to={`/product/${_id}`}>
        <div className="product-image">
          <img src={images[0]} alt={name} />
        </div>
        <div className="product-info">
          <h3>{name}</h3>
          <div className="price">${price.toFixed(2)}</div>
          <div className="rating">
            {"★".repeat(Math.round(averageRating))}
            {"☆".repeat(5 - Math.round(averageRating))}
          </div>
          <div className="eco-attributes">{renderEcoAttributes()}</div>
          {renderEcoImpact()}
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
