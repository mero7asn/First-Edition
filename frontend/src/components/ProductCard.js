import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const [hovered, setHovered] = useState(false);

  const primaryImage   = product.images?.find(img => img.isPrimary)   || product.images?.[0];
  const secondaryImage = product.images?.find(img => img.isSecondary) || product.images?.[1];

  const isSoldOut = !product.isAvailable || (
    product.sizes &&
    product.sizes.length > 0 &&
    product.sizes.every(s => typeof s === 'object' ? (!s.isAvailable || s.stock <= 0) : false)
  );

  // Count available sizes for the "quick-view" strip
  const availableSizes = (product.sizes || [])
    .filter(s => typeof s === 'object' ? (s.isAvailable && s.stock > 0) : true)
    .map(s => (typeof s === 'object' ? s.size : s));

  return (
    <Link
      to={`/product/${product._id}`}
      className={`product-card ${isSoldOut ? 'sold-out' : ''} ${hovered ? 'is-hovered' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Image container ── */}
      <div className="pc-image-wrap">

        {/* Primary image */}
        {primaryImage && (
          <img
            src={primaryImage.url}
            alt={primaryImage.alt || product.name}
            className="pc-img pc-img--primary"
          />
        )}

        {/* Secondary image (back) – crossfades on hover */}
        {secondaryImage && (
          <img
            src={secondaryImage.url}
            alt={`${product.name} — back view`}
            className="pc-img pc-img--secondary"
          />
        )}

        {/* Gold shimmer overlay on hover */}
        <div className="pc-shimmer" />

        {/* Badges */}
        <div className="pc-badges">
          {product.isFeatured && !isSoldOut && (
            <span className="pc-badge pc-badge--featured">Featured</span>
          )}
          {isSoldOut && (
            <span className="pc-badge pc-badge--sold-out">Sold Out</span>
          )}
        </div>

        {/* "Back view" hint label – appears on hover if secondary exists */}
        {secondaryImage && !isSoldOut && (
          <div className="pc-back-hint">Back View</div>
        )}

        {/* Quick size strip */}
        {availableSizes.length > 0 && !isSoldOut && (
          <div className="pc-sizes">
            {availableSizes.map(sz => (
              <span key={sz} className="pc-size">{sz}</span>
            ))}
          </div>
        )}
      </div>

      {/* ── Info ── */}
      <div className="pc-info">
        {/* Thin gold rule */}
        <div className="pc-rule" />

        <div className="pc-info-inner">
          <div className="pc-text">
            <p className="pc-category">{product.category || 'T-Shirt'}</p>
            <h3 className="pc-name">{product.name}</h3>
          </div>
          <div className="pc-pricing">
            <span className="pc-price">EGP {Number(product.price).toLocaleString('en-EG')}</span>
          </div>
        </div>

        {/* CTA row */}
        <div className="pc-cta">
          {isSoldOut ? (
            <span className="pc-cta-sold">Out of Stock</span>
          ) : (
            <button className="pc-order-btn">Order Now</button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
