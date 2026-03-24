import React from "react";
import card1 from "../assets/nasya.png";
import card2 from "../assets/basti.png";
import card3 from "../assets/raktmoksh.png";
import card4 from "../assets/virachana.png";
import card5 from "../assets/vamana.png";
import "./CardSection.css";

/**
 * Displays 5 responsive cards. Each card has a simple hover animation.
 */
export default function CardsSection() {
  const cards = [
    {
      id: 1,
      title: "Nasya",
      description:
        "A rejuvenating Panchakarma therapy focusing on nasal detox and mental clarity.",
      image: card1,
    },
    {
      id: 2,
      title: "Basti",
      description:
        "A cleansing therapy that removes deep-seated toxins from the colon using herbal oils.",
      image: card2,
    },
    {
      id: 3,
      title: "Raktmokshana",
      description:
        "Purifies the blood and improves circulation through Ayurvedic bloodletting techniques.",
      image: card3,
    },
    {
      id: 4,
      title: "Virechana",
      description:
        "A therapeutic purgation that helps cleanse the liver and digestive tract.",
      image: card4,
    },
    {
      id: 5,
      title: "Vamana",
      description:
        "A detoxification therapy to remove excess Kapha and improve respiratory health.",
      image: card5,
    },
  ];

  return (
    <div className="cards-grid">
      {cards.map((card) => (
        <article key={card.id} className="offering-card">
          <div className="card-media">
            <img src={card.image} alt={card.title} />
          </div>
          <h3 className="card-title">{card.title}</h3>
          <p className="card-desc muted">{card.description}</p>
          <button className="btn-small">Learn more</button>
        </article>
      ))}
    </div>
  );
}
