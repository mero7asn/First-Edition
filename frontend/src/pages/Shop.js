import React, { useState, useEffect } from 'react';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import './Shop.css';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    sort: 'newest',
    size: '',
    color: '',
    category: ''
  });
  const [loading, setLoading] = useState(true);

  // Fetch unique categories and colors on mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const { data } = await productAPI.getAll();
        const colors = Array.from(new Set(data.flatMap(p => p.colors || [])));
        const categories = Array.from(new Set(data.map(p => p.category).filter(Boolean)));
        setAvailableColors(colors);
        setAvailableCategories(categories);
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data } = await productAPI.getAll(filters);
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      sort: 'newest',
      size: '',
      color: '',
      category: ''
    });
  };

  return (
    <div className="shop">
      <div className="container">
        <div className="shop-header">
          <h1>Shop Collection</h1>
          <div className="filters-container">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filters-row">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {availableCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={filters.size}
                onChange={(e) => handleFilterChange('size', e.target.value)}
                className="filter-select"
              >
                <option value="">All Sizes</option>
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(sz => (
                  <option key={sz} value={sz}>{sz}</option>
                ))}
              </select>

              <select
                value={filters.color}
                onChange={(e) => handleFilterChange('color', e.target.value)}
                className="filter-select"
              >
                <option value="">All Colors</option>
                {availableColors.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>

              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="sort-select"
              >
                <option value="newest">Newest</option>
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>

              {(filters.category || filters.size || filters.color || filters.search) && (
                <button onClick={handleResetFilters} className="btn-reset">
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="no-products">No products found</div>
        ) : (
          <div className="grid grid-4">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
