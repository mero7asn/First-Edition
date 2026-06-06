import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../../services/api';
import { toast } from 'react-toastify';
import './AdminProducts.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data } = await productAPI.getAll();
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (id) => {
    try {
      await productAPI.toggleAvailability(id);
      toast.success('Availability updated');
      loadProducts();
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await productAPI.delete(id);
      toast.success('Product deleted');
      loadProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="admin-products">
      <div className="container">
        <div className="admin-header">
          <h1>Manage Products</h1>
          <Link to="/admin/products/new" className="btn btn-primary">
            Add New Product
          </Link>
        </div>

        <div className="products-table">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id}>
                  <td>
                    <img 
                      src={product.images?.[0]?.url} 
                      alt={product.name}
                      className="product-thumb"
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>${product.price}</td>
                  <td>
                    <span className={`status-badge ${product.isAvailable ? 'available' : 'unavailable'}`}>
                      {product.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td>
                    {product.isFeatured ? '⭐ Yes' : 'No'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link to={`/admin/products/edit/${product._id}`} className="btn-edit">
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleToggleAvailability(product._id)}
                        className="btn-toggle"
                      >
                        Toggle
                      </button>
                      <button 
                        onClick={() => handleDelete(product._id)}
                        className="btn-delete"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
