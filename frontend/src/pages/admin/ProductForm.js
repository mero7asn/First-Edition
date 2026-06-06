import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productAPI, uploadAPI } from '../../services/api';
import sanitizeInput from '../../utils/sanitize';
import { toast } from 'react-toastify';
import './ProductForm.css';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState({ primary: false, secondary: false, others: false });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    images: [],
    sizes: [],
    colors: [],
    isAvailable: true,
    isFeatured: false,
    whatsappNumber: ''
  });

  useEffect(() => { if (id) loadProduct(); }, [id]);

  const loadProduct = async () => {
    try {
      const { data } = await productAPI.getOne(id);
      setFormData({
        ...data,
        sizes: (data.sizes || []).map(s =>
          typeof s === 'string' ? { size: s, stock: 10, isAvailable: true } : s
        )
      });
    } catch {
      toast.error('Failed to load product');
    }
  };

  // Derived views of images by role
  const primaryImage   = formData.images.find(img => img.isPrimary);
  const secondaryImage = formData.images.find(img => img.isSecondary);
  const otherImages    = formData.images.filter(img => !img.isPrimary && !img.isSecondary);

  const handleUpload = async (files, role) => {
    if (!files.length) return;
    setUploading(prev => ({ ...prev, [role]: true }));
    try {
      const { data } = await uploadAPI.uploadImages(files);
      const newImgs = data.map(img => ({
        ...img,
        isPrimary:   role === 'primary',
        isSecondary: role === 'secondary'
      }));

      setFormData(prev => {
        let images = [...prev.images];

        if (role === 'primary') {
          // Replace existing primary
          images = images.filter(i => !i.isPrimary);
          images = [newImgs[0], ...images];
        } else if (role === 'secondary') {
          // Replace existing secondary
          images = images.filter(i => !i.isSecondary);
          images = [images[0] || null, newImgs[0], ...images.slice(1)].filter(Boolean);
        } else {
          // Append to others
          images = [...images, ...newImgs];
        }
        return { ...prev, images };
      });

      toast.success(`${role.charAt(0).toUpperCase() + role.slice(1)} image uploaded`);
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(prev => ({ ...prev, [role]: false }));
    }
  };

  const removeImage = (url) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter(i => i.url !== url) }));
  };

  const handleSizeToggle = (size) => {
    const exists = formData.sizes.some(s => s.size === size);
    setFormData(prev => ({
      ...prev,
      sizes: exists
        ? prev.sizes.filter(s => s.size !== size)
        : [...prev.sizes, { size, stock: 10, isAvailable: true }]
    }));
  };

  const updateSize = (size, field, value) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.map(s => s.size === size ? { ...s, [field]: value } : s)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!primaryImage) return toast.error('Please upload a primary (front) image');
    setLoading(true);
    try {
      if (id) {
        await productAPI.update(id, formData);
        toast.success('Product updated');
      } else {
        await productAPI.create(formData);
        toast.success('Product created');
      }
      navigate('/admin/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const UploadZone = ({ role, label, description, image, multiple }) => (
    <div className={`image-zone image-zone--${role}`}>
      <div className="image-zone-header">
        <span className={`image-zone-badge badge--${role}`}>{label}</span>
        <p className="image-zone-desc">{description}</p>
      </div>
      {image ? (
        <div className="image-zone-preview">
          <img src={image.url} alt={label} />
          <button type="button" className="image-zone-remove" onClick={() => removeImage(image.url)}>✕ Remove</button>
        </div>
      ) : (
        <label className={`upload-zone-label ${uploading[role] ? 'uploading' : ''}`}>
          <input
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={e => handleUpload(Array.from(e.target.files), role)}
            hidden
          />
          <div className="upload-zone-inner">
            <span className="upload-zone-icon">{role === 'primary' ? '🖼️' : role === 'secondary' ? '🔄' : '📷'}</span>
            <span>{uploading[role] ? 'Uploading…' : `Upload ${label}`}</span>
          </div>
        </label>
      )}
    </div>
  );

  return (
    <div className="product-form-page">
      <div className="container">
        <h1>{id ? 'Edit Product' : 'Add New Product'}</h1>

        <form onSubmit={handleSubmit} className="product-form">

          {/* Basic Info */}
          <div className="form-section">
            <h3>Basic Info</h3>
            <div className="form-group">
              <label>Product Name *</label>
              <input type="text" value={formData.name}
                onChange={e => setFormData({ ...formData, name: sanitizeInput(e.target.value) })} required />
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea value={formData.description} rows="4"
                onChange={e => setFormData({ ...formData, description: sanitizeInput(e.target.value) })} required />
            </div>
            <div className="form-group">
              <label>Price (EGP) *</label>
              <input type="number" step="0.01" min="0" value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })} required />
            </div>
          </div>

          {/* Images — 3 zones */}
          <div className="form-section">
            <h3>Product Images</h3>
            <div className="image-zones-grid">
              <UploadZone
                role="primary"
                label="Primary — Front"
                description="Shown on product card by default"
                image={primaryImage}
              />
              <UploadZone
                role="secondary"
                label="Secondary — Back"
                description="Shown when hovering the product card"
                image={secondaryImage}
              />
            </div>

            {/* Others */}
            <div className="image-zone image-zone--others">
              <div className="image-zone-header">
                <span className="image-zone-badge badge--others">Gallery Images</span>
                <p className="image-zone-desc">Additional images shown only on the product detail page</p>
              </div>
              <label className={`upload-zone-label ${uploading.others ? 'uploading' : ''}`}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => handleUpload(Array.from(e.target.files), 'others')}
                  hidden
                />
                <div className="upload-zone-inner">
                  <span className="upload-zone-icon">📷</span>
                  <span>{uploading.others ? 'Uploading…' : '+ Add Gallery Images'}</span>
                </div>
              </label>
              {otherImages.length > 0 && (
                <div className="image-previews">
                  {otherImages.map((img, i) => (
                    <div key={i} className="image-preview">
                      <img src={img.url} alt={`Gallery ${i + 1}`} />
                      <div className="image-preview-actions">
                        <button type="button" className="remove-img" onClick={() => removeImage(img.url)}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sizes & Availability */}
          <div className="form-section">
            <h3>Sizes &amp; Availability</h3>
            <div className="sizes-stock-list">
              {SIZES.map(size => {
                const sizeItem = formData.sizes.find(s => s.size === size);
                return (
                  <div key={size} className={`size-stock-row ${sizeItem ? 'active' : ''}`}>
                    <label className="checkbox-label">
                      <input type="checkbox" checked={!!sizeItem} onChange={() => handleSizeToggle(size)} />
                      <span className="size-label">{size}</span>
                    </label>
                    {sizeItem && (
                      <div className="size-stock-fields">
                        <div className="field-group">
                          <label>Stock</label>
                          <input type="number" min="0" className="stock-input"
                            value={sizeItem.stock}
                            onChange={e => updateSize(size, 'stock', parseInt(e.target.value) || 0)} />
                        </div>
                        <label className="availability-toggle">
                          <input type="checkbox" checked={sizeItem.isAvailable}
                            onChange={e => updateSize(size, 'isAvailable', e.target.checked)} />
                          Available
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Colors */}
          <div className="form-section">
            <h3>Colors</h3>
            <div className="form-group">
              <label>Available Colors (comma separated)</label>
              <input type="text" placeholder="e.g. Black, White, Navy"
                value={formData.colors.join(', ')}
                onChange={e => setFormData({ ...formData, colors: sanitizeInput(e.target.value).split(',').map(c => c.trim()).filter(Boolean) })} />
            </div>
          </div>

          {/* Settings */}
          <div className="form-section">
            <h3>Settings</h3>
            <div className="form-group">
              <label>WhatsApp Number</label>
              <input type="text" placeholder="+1234567890" value={formData.whatsappNumber}
                onChange={e => setFormData({ ...formData, whatsappNumber: sanitizeInput(e.target.value) })} />
            </div>
            <div className="form-checkboxes">
              <label className="checkbox-label">
                <input type="checkbox" checked={formData.isAvailable}
                  onChange={e => setFormData({ ...formData, isAvailable: e.target.checked })} />
                Available for sale
              </label>
              <label className="checkbox-label">
                <input type="checkbox" checked={formData.isFeatured}
                  onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })} />
                Featured on homepage
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading || Object.values(uploading).some(Boolean)}>
              {loading ? 'Saving...' : (id ? 'Update Product' : 'Create Product')}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/products')}>
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ProductForm;
