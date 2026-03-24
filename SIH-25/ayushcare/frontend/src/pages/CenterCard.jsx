// src/pages/CenterCard.jsx
import React from "react";
import "./CenterCard.css";

export default function CenterCard({ center, onOpen }) {
  // Use image URLs from serializer (image1_url, image2_url) or fallback to direct paths
  const image1Url = center.image1_url || (center.image1 ? `${import.meta.env.VITE_API_URL || "http://localhost:8000"}${center.image1}` : null);
  const image2Url = center.image2_url || (center.image2 ? `${import.meta.env.VITE_API_URL || "http://localhost:8000"}${center.image2}` : null);
  
  return (
    <div className="center-card">
      <div className="center-card-left">
        <div className="images-grid">
          <img 
            src={image1Url || "/placeholder1.jpg"} 
            alt={center.name}
            onError={(e) => {
              e.target.src = "/placeholder1.jpg";
            }}
          />
          <img 
            src={image2Url || "/placeholder2.jpg"} 
            alt={center.name}
            onError={(e) => {
              e.target.src = "/placeholder2.jpg";
            }}
          />
        </div>
        {center.map_image_url && (
          <div className="map-preview">
            <img 
              src={center.map_image_url} 
              alt="map"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        )}
      </div>

      <div className="center-card-right">
        <h3>{center.name}</h3>
        <p className="muted">{center.city}, {center.state}</p>
        <p className="address">{center.address}</p>
        <p><strong>Phone:</strong> {center.contact_number}</p>
        {center.description && <p className="description">{center.description}</p>}

        <div className="center-actions">
          <button onClick={() => onOpen(center.id)}>View Details & Book</button>
        </div>
      </div>
    </div>
  );
}
