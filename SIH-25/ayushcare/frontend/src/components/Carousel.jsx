import React, { useState, useEffect } from "react";

/**
 * Simple carousel (auto-advancing) built with hooks:
 * - images: array of URLs
 * - This is beginner-friendly and editable
 */
export default function Carousel({ images = [] }) {
  const [index, setIndex] = useState(0);

  // auto-advance every 4 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(id);
  }, [images.length]);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <section className="hero-carousel">
      {images.map((src, i) => (
        <div
          key={i}
          className={`hero-slide ${i === index ? "active" : ""}`}
          style={{ backgroundImage: `url(${src})` }}
          role="img"
          aria-label={`Slide ${i + 1}`}
        />
      ))}

      {/* Dots */}
      <div className="carousel-dots">
        {images.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === index ? "active" : ""}`}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}