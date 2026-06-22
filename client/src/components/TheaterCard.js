export default function TheaterCard({ theater, onPickTime }) {
  return (
    <div className="theater-card glass-card">
      <div className="theater-info">
        <h4 className="theater-name premium-font">{theater.name}</h4>
        <p className="theater-meta">Premium Cinema Experience</p>
      </div>
      <div className="time-grid">
        {(theater.shows || []).map((show) => (
          <button
            key={show.showId}
            className="time-btn"
            onClick={() => onPickTime(theater.name, show.time, show.showId)}
          >
            <span className="time-val">{show.time}</span>
            <span className="time-type">4K | Dolby</span>
          </button>
        ))}
      </div>
      <style jsx>{`
        .theater-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem;
          margin-bottom: 1.5rem;
          gap: 2rem;
        }
        .theater-name {
          font-size: 1.4rem;
          margin: 0;
          color: var(--white);
        }
        .theater-meta {
          color: var(--accent-gold);
          font-size: 0.85rem;
          font-weight: 600;
          margin-top: 4px;
        }
        .time-grid {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .time-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 100px;
          padding: 0.8rem 1.2rem;
          border-radius: 12px;
        }
        .time-val {
          font-size: 1.1rem;
        }
        .time-type {
          font-size: 0.65rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1px;
          opacity: 0.7;
          margin-top: 2px;
        }
        @media (max-width: 768px) {
          .theater-card {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
