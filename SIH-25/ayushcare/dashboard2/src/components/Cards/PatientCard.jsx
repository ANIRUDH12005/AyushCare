import React from "react";
import "./Cards.css";

const PatientCard = ({ name, therapy, time, status, therapist }) => {
  return (
    <div className="card-root">
      <h3>{name}</h3>
      <p className="card-subtitle">{therapy}</p>
      {therapist && <p className="card-therapist">Therapist: {therapist}</p>}
      <p className="card-meta">{time}</p>
      {status && (
        <span className={`status-badge ${status}`}>
          {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
        </span>
      )}
    </div>
  );
};

export default PatientCard;
