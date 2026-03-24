import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaTimesCircle } from "react-icons/fa";
import "./PaymentFailed.css";

export default function PaymentFailed() {
  const location = useLocation();
  const navigate = useNavigate();
  const { error } = location.state || {};

  return (
    <div className="payment-failed-container">
      <div className="payment-failed-card">
        <FaTimesCircle className="failed-icon" />
        <h1>Payment Failed</h1>
        <p className="failed-message">
          {error || "Your payment could not be processed. Please try again."}
        </p>

        <div className="failed-actions">
          <button className="btn-primary" onClick={() => navigate("/billing")}>
            Try Again
          </button>
          <button className="btn-secondary" onClick={() => navigate("/home")}>
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}

