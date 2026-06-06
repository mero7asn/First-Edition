import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { productAPI } from '../services/api';
import { toast } from 'react-toastify';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => { loadProduct(); }, [id]);

  const loadProduct = async () => {
    try {
      const { data } = await productAPI.getOne(id);
      setProduct(data);

      // Default selected image = primary
      const primary = data.images?.find(img => img.isPrimary) || data.images?.[0];
      setSelectedImage(primary || null);

      const normalizedSizes = (data.sizes || []).map(s =>
        typeof s === 'string' ? { size: s, stock: 1, isAvailable: true } : s
      );
      const firstAvailable = normalizedSizes.find(s => s.isAvailable && s.stock > 0);
      if (firstAvailable) setSelectedSize(firstAvailable.size);
      else if (normalizedSizes.length > 0) setSelectedSize(normalizedSizes[0].size);

      if (data.colors?.length > 0) setSelectedColor(data.colors[0]);
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Product not found');
    }
  };

  const normalizedSizes = product
    ? (product.sizes || []).map(s =>
        typeof s === 'string' ? { size: s, stock: 1, isAvailable: true } : s
      )
    : [];

  const selectedSizeObj    = normalizedSizes.find(s => s.size === selectedSize);
  const isSizeOutOfStock   = selectedSizeObj ? (!selectedSizeObj.isAvailable || selectedSizeObj.stock <= 0) : true;
  const isProductSoldOut   = !product?.isAvailable || normalizedSizes.every(s => !s.isAvailable || s.stock <= 0);

  const handleBuyOnWhatsApp = () => {
    if (!product) return;
    if (!selectedSize) { toast.warning('Please select a size'); return; }
    if (product.colors?.length > 0 && !selectedColor) { toast.warning('Please select a color'); return; }

    const imageUrl   = primaryImage?.url || '';
    const productUrl = `${window.location.origin}/products/${product._id}`;
    const message =
`Hi, I'd like to order:

*${product.name}*
🎨 Color: ${selectedColor || 'N/A'}
📏 Size: ${selectedSize}

🖼️ Image: ${imageUrl}
🔗 Product: ${productUrl}`;

    const whatsappNumber = product.whatsappNumber || '+1234567890';
    window.open(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (!product) return <div className="loading">Loading...</div>;

  // Separate images by role
  const primaryImage   = product.images?.find(img => img.isPrimary)   || product.images?.[0];
  const secondaryImage = product.images?.find(img => img.isSecondary) || null;
  const galleryImages  = product.images?.filter(img => !img.isPrimary && !img.isSecondary) || [];

  // Thumbnails = primary + secondary + gallery
  const thumbnails = [
    primaryImage,
    secondaryImage,
    ...galleryImages
  ].filter(Boolean);

  return (
    <div className="product-detail">
      <div className="container">
        <div className="product-layout">

          {/* ── Image Panel ── */}
          <div className="product-images">

            {/* Main large image */}
            <div className="main-image">
              {selectedImage && (
                <img
                  src={selectedImage.url}
                  alt={selectedImage.alt || product.name}
                />
              )}

            </div>

            {/* Thumbnails row */}
            {thumbnails.length > 1 && (
              <div className="image-thumbnails">
                {thumbnails.map((img, index) => (
                  <div
                    key={index}
                    className={`thumbnail-wrap ${selectedImage?.url === img.url ? 'active' : ''}`}
                    onClick={() => setSelectedImage(img)}
                  >
                    <img src={img.url} alt={img.alt || `View ${index + 1}`} />

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Info Panel ── */}
          <div className="product-details">
            <h1>{product.name}</h1>
            <p className="price">EGP {Number(product.price).toLocaleString('en-EG')}</p>

            {isProductSoldOut && <div className="unavailable-badge">SOLD OUT</div>}
            {!isProductSoldOut && !product.isAvailable && <div className="unavailable-badge">Currently Unavailable</div>}

            <p className="description">{product.description}</p>

            {normalizedSizes.length > 0 && (
              <div className="info-section">
                <h3>Select Size</h3>
                <div className="selector-group">
                  {normalizedSizes.map(s => {
                    const isOutOfStock = !s.isAvailable || s.stock <= 0;
                    return (
                      <button
                        key={s.size}
                        type="button"
                        className={`selector-badge ${selectedSize === s.size ? 'active' : ''} ${isOutOfStock ? 'disabled' : ''}`}
                        onClick={() => !isOutOfStock && setSelectedSize(s.size)}
                        disabled={isOutOfStock}
                      >
                        {s.size} {isOutOfStock ? '(Sold Out)' : `(${s.stock} left)`}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {product.colors?.length > 0 && (
              <div className="info-section">
                <h3>Select Color</h3>
                <div className="selector-group">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`selector-badge ${selectedColor === color ? 'active' : ''}`}
                      onClick={() => setSelectedColor(color)}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              className="btn btn-primary whatsapp-btn"
              onClick={handleBuyOnWhatsApp}
              disabled={isProductSoldOut || isSizeOutOfStock}
            >
              {isProductSoldOut ? 'Sold Out' : isSizeOutOfStock ? 'Selected Size Out of Stock' : 'Order Now'}
            </button>

            <div className="product-notice">
              <p>✓ Contact us on WhatsApp to complete your purchase</p>
              <p>✓ We'll confirm availability and payment details</p>
              <p>✓ Fast response during business hours</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
