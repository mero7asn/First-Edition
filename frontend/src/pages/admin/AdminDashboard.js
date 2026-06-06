import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    inStock: 0,
    soldOut: 0,
    featuredProducts: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const { data } = await productAPI.getAll();
      
      const inStockCount = data.filter(p => {
        if (!p.isAvailable) return false;
        const normalizedSizes = (p.sizes || []).map(s => 
          typeof s === 'string' ? { size: s, stock: 1, isAvailable: true } : s
        );
        if (normalizedSizes.length === 0) return true;
        return normalizedSizes.some(s => s.isAvailable && s.stock > 0);
      }).length;

      const soldOutCount = data.filter(p => {
        if (!p.isAvailable) return true;
        const normalizedSizes = (p.sizes || []).map(s => 
          typeof s === 'string' ? { size: s, stock: 1, isAvailable: true } : s
        );
        if (normalizedSizes.length === 0) return false;
        return normalizedSizes.every(s => !s.isAvailable || s.stock <= 0);
      }).length;

      setStats({
        totalProducts: data.length,
        inStock: inStockCount,
        soldOut: soldOutCount,
        featuredProducts: data.filter(p => p.isFeatured).length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <Link to="/admin/products/new" className="btn btn-primary">
            Add New Product
          </Link>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Products</h3>
            <p className="stat-number">{stats.totalProducts}</p>
          </div>
          <div className="stat-card">
            <h3>In Stock</h3>
            <p className="stat-number">{stats.inStock}</p>
          </div>
          <div className="stat-card">
            <h3>Sold Out</h3>
            <p className="stat-number">{stats.soldOut}</p>
          </div>
          <div className="stat-card">
            <h3>Featured</h3>
            <p className="stat-number">{stats.featuredProducts}</p>
          </div>
        </div>

        <div className="admin-actions">
          <Link to="/admin/products" className="action-card">
            <h3>Manage Products</h3>
            <p>Add, edit, or delete products</p>
          </Link>
          <Link to="/admin/drops" className="action-card">
            <h3>Manage Drops</h3>
            <p>Schedule collection releases and countdowns</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
