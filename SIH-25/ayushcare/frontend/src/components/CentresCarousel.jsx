import React, { useState } from "react";

export default function CentresCarousel() {

  // Load images directly from public folder
  const images = [
    "/center1.png",
    "/center2.png",
    "/center3.png",
    "/center4.png"
  ];

  const [pos, setPos] = useState(0);

  const prev = () => setPos(p => Math.max(0, p - 1));
  const next = () => setPos(p => Math.min(images.length - 1, p + 1));

  return (
    <div className="centres-wrapper">
      
      <button className="carousel-arrow left" onClick={prev}>‹</button>

      <div
        className="centres-track"
        style={{
          transform: `translateX(-${pos * 100}%)`,
        }}
      >
        {images.map((src, i) => (
          <div
            key={i}
            className="centre-card"
            style={{
              backgroundImage: `url(${src})`,
            }}
          />
        ))}
      </div>

      <button className="carousel-arrow right" onClick={next}>›</button>

    </div>
  );
}

