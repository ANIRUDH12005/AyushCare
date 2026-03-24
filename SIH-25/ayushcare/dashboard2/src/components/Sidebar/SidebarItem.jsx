import React from "react";

const SidebarItem = ({ icon, active, onClick, label }) => {
  return (
    <button
      className={`sidebar-item ${active ? "active" : ""}`}
      onClick={onClick}
      type="button"
      title={label}
    >
      {icon}
      {label && <span className="sidebar-label">{label}</span>}
    </button>
  );
};

export default SidebarItem;
