import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaStar,
  FaPhone,
  FaGlobe,
  FaClock,
  FaUserMd,
  FaFilter,
  FaChevronDown,
  FaChevronUp
} from "react-icons/fa";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./PanchakarmaCenters.css";
import { getCenters } from "../api";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export default function PanchakarmaCenters() {
  const navigate = useNavigate();
  const [searchPincode, setSearchPincode] = useState("");
  const [filteredCenters, setFilteredCenters] = useState([]);
  const [mapVisible, setMapVisible] = useState(true);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [sortBy, setSortBy] = useState("rating");
  const [showFilters, setShowFilters] = useState(false);
  const [centers, setCenters] = useState([]);

  const popularCenters = centers
    .filter(center => center.popular)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  // Handle pincode search
  const handlePincodeSearch = () => {
    if (!searchPincode.trim()) {
      setFilteredCenters(centers);
      return;
    }

    const filtered = centers.filter(center =>
      center.pincode.startsWith(searchPincode) ||
      center.city.toLowerCase().includes(searchPincode.toLowerCase()) ||
      center.state.toLowerCase().includes(searchPincode.toLowerCase())
    );

    setFilteredCenters(filtered);
  };

  // Handle sort change
  const handleSortChange = (sortType) => {
    setSortBy(sortType);
    const sorted = [...filteredCenters].sort((a, b) => {
      if (sortType === "rating") return b.rating - a.rating;
      if (sortType === "doctors") return b.doctors - a.doctors;
      return a.name.localeCompare(b.name);
    });
    setFilteredCenters(sorted);
  };

  // Filter by state
  const filterByState = (state) => {
    if (state === "all") {
      setFilteredCenters(centers);
    } else {
      const filtered = centers.filter(center => center.state === state);
      setFilteredCenters(filtered);
    }
  };

  // Get unique states for filter
  const states = ["all", ...new Set(centers.map(center => center.state))];

  useEffect(() => {
    async function loadCenters() {
      try {
        const token = localStorage.getItem("token");
        const res = await getCenters(token); // call your API
        // Handle both array and object response
        let centersData = res;
        if (res && !Array.isArray(res) && res.data) {
          centersData = res.data;
        } else if (res && !Array.isArray(res) && Array.isArray(res.results)) {
          centersData = res.results;
        }

        if (centersData && Array.isArray(centersData)) {
          // Ensure specialties is an array
          const formattedCenters = centersData.map(center => ({
            ...center,
            specialties: Array.isArray(center.specialties) ? center.specialties : []
          }));
          setCenters(formattedCenters);
          setFilteredCenters(formattedCenters);
        } else {
          console.error("Failed to fetch centers - invalid format:", res);
        }
      } catch (error) {
        console.error("Error loading centers:", error);
      }
    }

    loadCenters();
  }, []);


  // Handle center selection
  const handleCenterSelect = (center) => {
    setSelectedCenter(center);

  };


  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handlePincodeSearch();
    }
  };

  return (
    <div className="panchakarma-centers-root">
      {/* Hero Section */}
      <div className="centers-hero">
        <div className="hero-content">
          <h1>Find Panchakarma Centers</h1>
          <p className="hero-subtitle">
            Discover authentic Ayurvedic healing centers across India
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="centers-main">

        <div className="search-section">
          <div className="search-container">
            <div className="search-box">
              <FaMapMarkerAlt className="search-icon" />
              <input
                type="text"
                placeholder="Enter PIN Code, City or State"
                value={searchPincode}
                onChange={(e) => setSearchPincode(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button className="search-btn" onClick={handlePincodeSearch}>
                <FaSearch />
                <span>Search</span>
              </button>
            </div>

            {/* Quick Filters */}
            <div className="quick-filters">
              <button
                className="filter-toggle"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FaFilter />
                <span>Filters</span>
                {showFilters ? <FaChevronUp /> : <FaChevronDown />}
              </button>

              {showFilters && (
                <div className="filter-options">
                  <div className="filter-group">
                    <label>Sort by:</label>
                    <div className="sort-buttons">
                      <button
                        className={`sort-btn ${sortBy === "rating" ? "active" : ""}`}
                        onClick={() => handleSortChange("rating")}
                      >
                        Highest Rated
                      </button>
                      <button
                        className={`sort-btn ${sortBy === "doctors" ? "active" : ""}`}
                        onClick={() => handleSortChange("doctors")}
                      >
                        Most Doctors
                      </button>
                      <button
                        className={`sort-btn ${sortBy === "name" ? "active" : ""}`}
                        onClick={() => handleSortChange("name")}
                      >
                        A to Z
                      </button>
                    </div>
                  </div>

                  <div className="filter-group">
                    <label>Filter by State:</label>
                    <div className="state-filters">
                      {states.map(state => (
                        <button
                          key={state}
                          className="state-btn"
                          onClick={() => filterByState(state)}
                        >
                          {state === "all" ? "All States" : state}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Map Section */}
        {mapVisible && (
          <div className="map-section">
            <div className="map-header">
              <h2>
                <FaMapMarkerAlt /> Centers Map
              </h2>
              <button
                className="map-toggle"
                onClick={() => setMapVisible(false)}
              >
                Hide Map
              </button>
            </div>
            <div className="map-container">
              {centers.length > 0 && (
                <MapContainer
                  center={[20.5937, 78.9629]} // Center of India
                  zoom={5}
                  style={{ height: "100%", width: "100%", borderRadius: "12px" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {centers.map((center) => {
                    if (center.latitude && center.longitude) {
                      return (
                        <Marker
                          key={center.id}
                          position={[center.latitude, center.longitude]}
                          eventHandlers={{
                            click: () => handleCenterSelect(center),
                          }}
                        >
                          <Popup>
                            <div>
                              <h3>{center.name}</h3>
                              <p>{center.city}, {center.state}</p>
                              <p>Rating: {center.rating} ⭐</p>
                              <button onClick={() => handleCenterSelect(center)}>
                                View Details
                              </button>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    }
                    return null;
                  })}
                </MapContainer>
              )}
            </div>
          </div>
        )}

        {/* Show Map Button when hidden */}
        {!mapVisible && (
          <div className="show-map-section">
            <button
              className="show-map-btn"
              onClick={() => setMapVisible(true)}
            >
              <FaMapMarkerAlt /> Show Map
            </button>
          </div>
        )}

        {/* Popular Centers Section */}
        <section className="popular-centers">
          <h2>🏆 Popular Panchakarma Centers</h2>
          <p className="section-subtitle">Top-rated centers across India</p>

          <div className="popular-cards">
            {popularCenters.map(center => (
              <div
                key={center.id}
                className="popular-card"
                onClick={() => handleCenterSelect(center)}
              >
                <div className="popular-card-header">
                  <div className="center-rating">
                    <FaStar className="star-icon" />
                    <span>{center.rating}</span>
                  </div>
                  <div className="center-location">
                    <FaMapMarkerAlt />
                    <span>{center.city}, {center.state}</span>
                  </div>
                </div>

                <h3>{center.name}</h3>
                <p className="center-address">{center.address}</p>

                <div className="center-specialties">
                  {center.specialties.map((spec, index) => (
                    <span key={index} className="specialty-tag">{spec}</span>
                  ))}
                </div>

                <div className="center-details">
                  <div className="detail-item">
                    <FaUserMd />
                    <span>{center.doctors} Doctors</span>
                  </div>
                  <div className="detail-item">
                    <FaClock />
                    <span>{center.timing}</span>
                  </div>
                </div>

                <button className="view-center-btn">View Details</button>
              </div>
            ))}
          </div>
        </section>

        {/* All Centers Section */}
        <section className="all-centers">
          <div className="section-header">
            <h2>All Centers ({filteredCenters.length})</h2>
            <div className="results-info">
              Showing centers {searchPincode ? `for "${searchPincode}"` : "across India"}
            </div>
          </div>

          {filteredCenters.length === 0 ? (
            <div className="no-results">
              <FaSearch className="no-results-icon" />
              <h3>No centers found</h3>
              <p>Try searching with a different PIN code or city name</p>
            </div>
          ) : (
            <div className="centers-grid">
              {filteredCenters.map(center => (
                <div key={center.id} className="center-card">
                  <div className="card-header">
                    <div className="center-main-info">
                      <h3>{center.name}</h3>
                      <div className="center-location-badge">
                        <FaMapMarkerAlt />
                        <span>{center.city}, {center.state} - {center.pincode}</span>
                      </div>
                    </div>
                    <div className="center-rating-badge">
                      <FaStar />
                      <span>{center.rating}</span>
                    </div>
                  </div>

                  <p className="center-address">{center.address}</p>

                  <div className="center-specialties">
                    {center.specialties.slice(0, 3).map((spec, index) => (
                      <span key={index} className="specialty-tag">{spec}</span>
                    ))}
                    {center.specialties.length > 3 && (
                      <span className="specialty-more">+{center.specialties.length - 3} more</span>
                    )}
                  </div>

                  <div className="center-contact">
                    <div className="contact-item">
                      <FaPhone />
                      <span>{center.phone}</span>
                    </div>
                    <div className="contact-item">
                      <FaGlobe />
                      <a href={`https://${center.website}`} target="_blank" rel="noopener noreferrer">
                        {center.website}
                      </a>
                    </div>
                    <div className="contact-item">
                      <FaClock />
                      <span>{center.timing}</span>
                    </div>
                    <div className="contact-item">
                      <FaUserMd />
                      <span>{center.doctors} Ayurvedic Doctors</span>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button
                      className="action-btn primary"
                      onClick={() => navigate(`/centers/${center.id}`)}
                    >
                      Book Appointment
                    </button>
                    <button
                      className="action-btn secondary"
                      onClick={() => handleCenterSelect(center)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Selected Center Modal */}
        {selectedCenter && (
          <div className="center-modal-overlay" onClick={() => setSelectedCenter(null)}>
            <div className="center-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedCenter.name}</h2>
                <button className="close-modal" onClick={() => setSelectedCenter(null)}>
                  ×
                </button>
              </div>

              <div className="modal-content">
                <div className="modal-rating">
                  <FaStar className="star-icon" />
                  <span className="rating-value">{selectedCenter.rating}</span>
                  <span className="rating-text">Excellent</span>
                </div>

                <div className="modal-location">
                  <FaMapMarkerAlt />
                  <div>
                    <p>{selectedCenter.address}</p>
                    <p>{selectedCenter.city}, {selectedCenter.state} - {selectedCenter.pincode}</p>
                  </div>
                </div>

                <div className="modal-specialties">
                  <h4>Specialties</h4>
                  <div className="specialties-list">
                    {selectedCenter.specialties.map((spec, index) => (
                      <span key={index} className="specialty-tag">{spec}</span>
                    ))}
                  </div>
                </div>

                <div className="modal-details">
                  <div className="detail-row">
                    <div className="detail-col">
                      <FaPhone />
                      <span>{selectedCenter.phone}</span>
                    </div>
                    <div className="detail-col">
                      <FaGlobe />
                      <a href={`https://${selectedCenter.website}`} target="_blank" rel="noopener noreferrer">
                        {selectedCenter.website}
                      </a>
                    </div>
                  </div>
                  <div className="detail-row">
                    <div className="detail-col">
                      <FaClock />
                      <span>{selectedCenter.timing}</span>
                    </div>
                    <div className="detail-col">
                      <FaUserMd />
                      <span>{selectedCenter.doctors} Ayurvedic Doctors</span>
                    </div>
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    className="modal-btn primary"
                    onClick={() => navigate(`/centers/${selectedCenter.id}`)}
                  >
                    Book Now
                  </button>
                  <button className="modal-btn secondary">Save Center</button>
                  <button className="modal-btn outline">Get Directions</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}