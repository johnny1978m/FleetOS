import "./Card.css";

function Card({ title, value }) {
  return (
    <div className="fleet-card">
      <span className="fleet-card-title">{title}</span>
      <strong className="fleet-card-value">{value}</strong>
    </div>
  );
}

export default Card;