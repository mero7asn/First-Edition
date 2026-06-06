import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <section className="about-hero">
        <div className="container">
          <span className="hero-subtitle">The Philosophy of Exclusivity</span>
          <h1>First Edition</h1>
          <p className="hero-tagline">Wearable Art. Strictly Limited. Never Re-released.</p>
        </div>
      </section>

      <section className="about-content">
        <div className="container">
          <div className="about-grid">
            <div className="story-block">
              <h2>Our Story</h2>
              <p>
                First Edition (FE) was founded on a simple realization: modern fashion has lost its value of rarity. 
                Mass-produced clothing has made fashion disposable. We reject the copy-paste culture.
              </p>
              <p>
                We produce premium streetwear in extremely limited batches. Each collection—what we call a "Drop"—is 
                numbered and cataloged. Once a design is sold out, it is gone forever, archived in our history but never 
                to be printed again.
              </p>
            </div>
            <div className="values-block">
              <h2>The Three Pillars</h2>
              <div className="value-item">
                <span className="value-num">01</span>
                <div>
                  <h3>Numbered Exclusivity</h3>
                  <p>Every single item is part of a certified, limited run. It guarantees you are wearing something truly rare.</p>
                </div>
              </div>
              <div className="value-item">
                <span className="value-num">02</span>
                <div>
                  <h3>Premium Craftsmanship</h3>
                  <p>Heavyweight cotton, premium blends, hand-stitched detailing, and premium printing processes that stand the test of time.</p>
                </div>
              </div>
              <div className="value-item">
                <span className="value-num">03</span>
                <div>
                  <h3>Direct Connection</h3>
                  <p>We don't use automated checkouts, algorithms, or complex shipping forms. You deal directly with our admin over WhatsApp for a customized, human relationship.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
