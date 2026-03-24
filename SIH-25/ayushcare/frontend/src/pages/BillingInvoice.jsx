import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { apiGet, apiPost } from "../api";
import "./BillingInvoice.css";

// Load Razorpay script
const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => resolve(null);
    document.body.appendChild(script);
  });
};

export default function BillingInvoice() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [invoiceStatus, setInvoiceStatus] = useState("Unpaid");
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      // Load invoices from API - you may need to create this endpoint
      // For now, using mock data
      const mockInvoice = {
        id: 1,
        invoice_no: "INV-1001",
        date: "2025-02-21",
        patient_name: "MAHI SHARMA",
        phone: "+91 98765 43210",
        address: "Jabalpur, India",
        therapies: [
          { name: "Panchakarma Detox Package", qty: 1, price: 12000, total: 12000 },
          { name: "Abhyanga + Shirodhara Combo", qty: 2, price: 2200, total: 4400 },
          { name: "Herbal Oils & Medication Kit", qty: 1, price: 1200, total: 1200 },
          { name: "Virechana Cleansing", qty: 1, price: 6000, total: 6000 },
          { name: "Nasya (Nasal Therapy)", qty: 1, price: 1500, total: 1500 },
        ],
        subtotal: 17600,
        discount: 600,
        total: 17000,
        status: "pending",
      };
      setInvoices([mockInvoice]);
      setSelectedInvoice(mockInvoice);
      setInvoiceStatus(mockInvoice.status === "paid" ? "Paid" : "Unpaid");
    } catch (error) {
      console.error("Error loading invoices:", error);
    }
  };

  const handlePayNow = async () => {
    if (!selectedInvoice) return;

    setLoading(true);
    try {
      // Load Razorpay
      const Razorpay = await loadRazorpay();
      if (!Razorpay) {
        toast.error("Failed to load payment gateway");
        setLoading(false);
        return;
      }

      // Create payment order
      const orderRes = await apiPost(
        "/api/payment/create-order/",
        {
          invoiceId: selectedInvoice.id,
          amount: selectedInvoice.total,
          currency: "INR",
        },
        token
      );

      if (!orderRes || !orderRes.success) {
        toast.error(orderRes?.message || "Failed to create payment order");
        setLoading(false);
        return;
      }

      // Initialize Razorpay checkout
      const options = {
        key: orderRes.key,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: "AyushCare Wellness Center",
        description: `Payment for Invoice ${selectedInvoice.invoice_no}`,
        order_id: orderRes.orderId,
        handler: async function (response) {
          // Verify payment
          const verifyRes = await apiPost(
            "/api/payment/verify/",
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              invoice_id: selectedInvoice.id,
            },
            token
          );

          if (verifyRes && verifyRes.success) {
            toast.success("Payment successful!");
            navigate("/payment-success", {
              state: {
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                invoiceId: selectedInvoice.id,
              },
            });
          } else {
            toast.error(verifyRes?.message || "Payment verification failed");
            navigate("/payment-failed", {
              state: {
                error: verifyRes?.message || "Payment verification failed",
              },
            });
          }
        },
        prefill: {
          name: selectedInvoice.patient_name,
          contact: selectedInvoice.phone,
        },
        theme: {
          color: "#1f4d2b",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            toast.info("Payment cancelled");
          },
        },
      };

      const razorpayInstance = new Razorpay(options);
      razorpayInstance.open();
      setLoading(false);
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("An error occurred during payment");
      setLoading(false);
    }
  };

  if (!selectedInvoice) {
    return <div className="invoice-wrapper">Loading invoice...</div>;
  }

  const therapies = selectedInvoice.therapies || [];

  return (
    <div className="invoice-wrapper">
      <aside className="invoice-side">
        <h2 className="invoice-heading-vertical">INVOICE</h2>

        <div className="brand-box">
          <h3>Your Logo</h3>
          <p>AyushCare Wellness Center</p>
        </div>

        <div className="details-side">
          <p><strong>Invoice No:</strong> {selectedInvoice.invoice_no}</p>
          <p><strong>Date:</strong> {new Date(selectedInvoice.date).toLocaleDateString()}</p>
          <p><strong>Account:</strong> #{selectedInvoice.id}</p>
        </div>

        <div className="terms-box">
          <h4>Terms & Conditions</h4>
          <p>Payment is due within 7 working days.</p>
          <p>No refund after therapy has begun.</p>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT */}
      <main className="invoice-main">
        <header className="invoice-top">
          <div>
            <h2>Invoice To</h2>
            <p><strong>MAHI SHARMA</strong></p>
            <p>+91 98765 43210</p>
            <p>Jabalpur, India</p>
          </div>

          <div>
            <h2>Invoice From</h2>
            <p><strong>AyushCare Hospital</strong></p>
            <p>+91 88444 66231</p>
            <p>Wellness Street, Bhopal</p>
          </div>
        </header>

        {/* TABLE */}
        <table className="invoice-table">
          <thead>
            <tr>
              <th>ITEM DESCRIPTION</th>
              <th>QTY</th>
              <th>PRICE</th>
              <th>TOTAL</th>
            </tr>
          </thead>

          <tbody>
            {therapies.map((t, index) => (
              <tr key={index}>
                <td>{t.name}</td>
                <td>{t.qty}</td>
                <td>₹{t.price.toLocaleString()}</td>
                <td>₹{t.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* SUMMARY */}
        <div className="summary-box">
          <p>Subtotal: <span>₹{selectedInvoice.subtotal.toLocaleString()}</span></p>
          <p>Discount: <span>₹{selectedInvoice.discount.toLocaleString()}</span></p>
          <p>Grand Total: <strong>₹{selectedInvoice.total.toLocaleString()}</strong></p>
        </div>

        {/* PAYMENT LOGIC BUTTON */}
        <div className="payment-actions">
          {invoiceStatus === "Paid" ? (
            <button className="paid-stamp">PAID</button>
          ) : (
            <>
              <button className="unpaid-stamp">UNPAID</button>
              <button className="pay-now-btn" onClick={handlePayNow} disabled={loading}>
                {loading ? "Processing..." : "Pay Now"}
              </button>
            </>
          )}
        </div>

        <button className="download-btn">Download PDF</button>
      </main>
    </div>
  );
}