import React from "react";
import "./Cards.css";

const AppointmentCard = ({ title, count, subtitle }) => {
  return (
    <div className="card-root">
      <h3>{title}</h3>
      <p className="card-count">{count}</p>
      {subtitle && <p className="card-subtitle">{subtitle}</p>}
    </div>
  );
};

export default AppointmentCard;
