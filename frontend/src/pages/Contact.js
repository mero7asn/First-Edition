import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import './Contact.css';

const Contact = () => {
  const whatsappNumber = process.env.REACT_APP_WHATSAPP_NUMBER || '+1234567890';

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="contact-hero-inner container">
          <span className="contact-hero-kicker">Direct Support</span>
          <h1>Contact Us</h1>
          <p>Reach out to us directly on WhatsApp for orders, sizing, and any questions.</p>
        </div>
      </div>

      <div className="contact-body">
        <div className="container">
          <div className="contact-grid single">
            <a
              href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=Hi,%20I'd%20like%20to%20ask%20a%20question.`}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-card whatsapp-card"
            >
              <div className="card-icon whatsapp-icon">
                <FaWhatsapp />
              </div>
              <h2>WhatsApp Chat</h2>
              <p>Connect instantly with us to place orders or get your questions answered.</p>
              <span className="btn contact-btn whatsapp-btn">Start Chatting</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
