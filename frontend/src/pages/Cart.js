import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FiTrash2 } from 'react-icons/fi';
import './Cart.css';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="cart empty-cart">
        <div className="container">
          <h1>Your Cart is Empty</h1>
          <Link to="/shop" className="btn btn-primary">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart">
      <div className="container">
        <h1>Shopping Cart</h1>
        
        <div className="cart-layout">
          <div className="cart-items">
            {cart.map(item => (
              <div key={`${item.product._id}-${item.variant.size}-${item.variant.color}`} className="cart-item">
                <img 
                  src={item.product.images[0]?.url} 
                  alt={item.product.name} 
                  className="cart-item-image"
                />
                
                <div className="cart-item-details">
                  <h3>{item.product.name}</h3>
                  <p className="cart-item-meta">
                    Size: {item.variant.size} | Color: {item.variant.color}
                  </p>
                  <p className="cart-item-price">${item.product.price}</p>
                </div>

                <div className="cart-item-actions">
                  <input
                    type="number"
                    min="1"
                    max={item.variant.stock}
                    value={item.quantity}
                    onChange={(e) => updateQuantity(
                      item.product._id, 
                      item.variant.size, 
                      item.variant.color, 
                      Number(e.target.value)
                    )}
                    className="quantity-input"
                  />
                  <button 
                    onClick={() => removeFromCart(item.product._id, item.variant.size, item.variant.color)}
                    className="remove-btn"
                  >
                    <FiTrash2 />
                  </button>
                </div>

                <div className="cart-item-total">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>
            <button onClick={handleCheckout} className="btn btn-primary checkout-btn">
              Proceed to Checkout
            </button>
            <Link to="/shop" className="continue-shopping">Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
