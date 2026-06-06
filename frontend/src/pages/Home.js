import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, dropAPI, cmsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import './Home.css';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [activeDrop, setActiveDrop] = useState(null);
  const [upcomingDrop, setUpcomingDrop] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      const [productsRes, liveDropsRes, upcomingDropsRes, bannersRes] = await Promise.all([
        productAPI.getFeatured(),
        dropAPI.getAll({ status: 'live' }),
        dropAPI.getAll({ status: 'upcoming' }),
        cmsAPI.getActiveBanners()
      ]);
      
      setFeaturedProducts(productsRes.data);
      setActiveDrop(liveDropsRes.data[0]);
      
      if (upcomingDropsRes.data && upcomingDropsRes.data.length > 0) {
        const sortedUpcoming = upcomingDropsRes.data.sort((a, b) => new Date(a.launchDate) - new Date(b.launchDate));
        setUpcomingDrop(sortedUpcoming[0]);
      } else {
        setUpcomingDrop(null);
      }
      
      setBanners(bannersRes.data);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!upcomingDrop) return;

    const timer = setInterval(() => {
      const difference = +new Date(upcomingDrop.launchDate) - +new Date();
      if (difference <= 0) {
        clearInterval(timer);
        setUpcomingDrop(null);
        loadHomeData();
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [upcomingDrop]);

  const heroBanner = banners.find(b => b.position === 'hero');

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>{heroBanner?.title || 'FIRST EDITION'}</h1>
          <p>{heroBanner?.subtitle || 'Limited Edition Premium Streetwear'}</p>
          <Link to="/shop" className="btn btn-primary">
            {heroBanner?.ctaText || 'Shop Now'}
          </Link>
        </div>
      </section>

      {upcomingDrop && (
        <section className="section upcoming-drop-countdown">
          <div className="container">
            <div className="countdown-card">
              <span className="countdown-label">Next Collection Drop Release</span>
              <h2>{upcomingDrop.title}</h2>
              {upcomingDrop.description && <p className="drop-desc">{upcomingDrop.description}</p>}
              <div className="timer-grid">
                <div className="timer-unit">
                  <span className="timer-number">{timeLeft.days}</span>
                  <span className="timer-label">Days</span>
                </div>
                <div className="timer-unit">
                  <span className="timer-number">{timeLeft.hours}</span>
                  <span className="timer-label">Hours</span>
                </div>
                <div className="timer-unit">
                  <span className="timer-number">{timeLeft.minutes}</span>
                  <span className="timer-label">Mins</span>
                </div>
                <div className="timer-unit">
                  <span className="timer-number">{timeLeft.seconds}</span>
                  <span className="timer-label">Secs</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeDrop && (
        <section className="section active-drop">
          <div className="container">
            <div className="drop-header">
              <h2>Latest Drop: {activeDrop.title}</h2>
              <Link to="/shop" className="btn btn-outline">
                View Collection
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="section featured-products">
        <div className="container">
          <h2 className="section-title">Featured Collection</h2>
          <div className="featured-grid">
            {featuredProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          <div className="section-cta">
            <Link to="/shop" className="btn btn-outline">View All Products</Link>
          </div>
        </div>
      </section>

      <section className="section brand-story">
        <div className="container">
          <div className="story-content">
            <h2>First Edition Philosophy</h2>
            <p>
              Every piece tells a story. Limited quantities. Numbered editions. 
              Premium quality. We believe in exclusivity, craftsmanship, and timeless design.
            </p>
            <Link to="/about" className="btn btn-outline">Learn More</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
