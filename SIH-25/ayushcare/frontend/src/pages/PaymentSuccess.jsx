import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import "./PaymentSuccess.css";

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { paymentId, orderId, invoiceId } = location.state || {};

  return (
    <div className="payment-success-container">
      <div className="payment-success-card">
        <FaCheckCircle className="success-icon" />
        <h1>Payment Successful!</h1>
        <p className="success-message">
          Your payment has been processed successfully. Your invoice has been updated.
        </p>
        
        {paymentId && (
          <div className="payment-details">
            <p><strong>Payment ID:</strong> {paymentId}</p>
            {orderId && <p><strong>Order ID:</strong> {orderId}</p>}
            {invoiceId && <p><strong>Invoice ID:</strong> #{invoiceId}</p>}
          </div>
        )}

        <div className="success-actions">
          <button className="btn-primary" onClick={() => navigate("/billing")}>
            View Invoices
          </button>
          <button className="btn-secondary" onClick={() => navigate("/home")}>
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}

