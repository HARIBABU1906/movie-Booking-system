export default function SeatLayout({ seats, selectedSeats, onToggleSeat }) {
  if (!seats || seats.length === 0) {
    return (
      <div className="empty-seats animate-fade">
        <div className="skeleton-loader"></div>
        <p>Initializing seat matrix...</p>
      </div>
    );
  }

  return (
    <div className="seat-selection-container animate-fade">
      <div className="screen-container">
        <div className="curved-screen"></div>
        <div className="screen-glow"></div>
        <span>PREMIUM CINEMA HALL</span>
      </div>

      <div className="seat-grid-wrapper">
        <div className="seat-layout">
          {seats.map((seat) => {
            const isSelected = selectedSeats.includes(seat.seatId);
            const isBooked = seat.status === "BOOKED";
            const isLocked = seat.status === "LOCKED";
            
            return (
              <button
                key={seat.seatId}
                type="button"
                className={`seat-btn ${isSelected ? "selected" : ""} ${
                  isBooked ? "booked" : ""
                } ${isLocked ? "locked" : ""}`.trim()}
                onClick={() => !isBooked && !isLocked && onToggleSeat(seat.seatId)}
                disabled={isBooked || isLocked}
              >
                <div className="seat-headrest"></div>
                <span className="seat-id">{seat.seatId}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="seat-legend glass-card">
        <div className="legend-item"><span className="dot available"></span> Available</div>
        <div className="legend-item"><span className="dot selected"></span> Selected</div>
        <div className="legend-item"><span className="dot locked"></span> Reserved</div>
        <div className="legend-item"><span className="dot booked"></span> Booked</div>
      </div>

      <style jsx>{`
        .seat-selection-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 3rem 0;
          perspective: 1500px;
        }

        .screen-container {
          width: 90%;
          text-align: center;
          margin-bottom: 5rem;
          position: relative;
        }
        .curved-screen {
          height: 12px;
          background: #ffffff;
          border-radius: 50% / 100% 100% 0 0;
          box-shadow: 0 15px 50px rgba(0, 181, 98, 0.4), 0 0 20px rgba(255, 255, 255, 0.6);
          margin-bottom: 2rem;
          transform: rotateX(-15deg);
        }
        .screen-glow {
          position: absolute;
          top: 15px; left: 10%; width: 80%; height: 60px;
          background: radial-gradient(ellipse at center, rgba(0, 181, 98, 0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        .screen-container span {
          font-size: 0.75rem;
          letter-spacing: 12px;
          color: var(--text-muted);
          font-weight: 800;
          text-transform: uppercase;
        }

        .seat-grid-wrapper {
          padding: 2.5rem;
          background: rgba(0, 0, 0, 0.4);
          border-radius: 40px;
          border: 1px solid var(--glass-border);
          box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.3);
        }

        .seat-layout {
          display: grid;
          grid-template-columns: repeat(10, 1fr);
          gap: 15px;
          transform: rotateX(25deg);
          transform-style: preserve-3d;
        }

        .seat-btn {
          position: relative;
          width: 40px;
          height: 44px;
          background: var(--bg-surface);
          border: 1px solid var(--glass-border);
          border-radius: 12px 12px 8px 8px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          padding-bottom: 6px;
        }
        .seat-headrest {
          position: absolute;
          top: 4px; width: 24px; height: 10px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .seat-id { font-size: 10px; font-weight: 700; color: var(--text-muted); }

        .seat-btn:hover:not(:disabled) {
          background: var(--bg-hover);
          transform: translateZ(10px) scale(1.1);
          border-color: var(--accent-green);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
        }
        .seat-btn:hover:not(:disabled) .seat-id { color: var(--white); }

        .seat-btn.selected {
          background: var(--accent-green);
          border-color: var(--accent-green);
          box-shadow: 0 0 20px rgba(0, 181, 98, 0.5);
          transform: translateZ(15px);
        }
        .seat-btn.selected .seat-id { color: var(--white); }
        .seat-btn.selected .seat-headrest { background: rgba(0, 0, 0, 0.1); }

        .seat-btn.booked {
          background: var(--text-muted);
          opacity: 0.1;
          cursor: not-allowed;
        }
        .seat-btn.locked {
          background: #ff4d4d;
          border-color: #ff4d4d;
          cursor: not-allowed;
          animation: pulse-danger 1.5s infinite;
        }

        .seat-legend {
          display: flex; gap: 2.5rem; margin-top: 4rem;
          padding: 1.2rem 3rem; border-radius: 100px;
        }
        .legend-item { display: flex; align-items: center; gap: 10px; font-size: 0.9rem; color: var(--text-secondary); }
        .dot { width: 12px; height: 12px; border-radius: 50%; }
        .dot.available { background: var(--bg-surface); border: 1px solid var(--glass-border); }
        .dot.selected { background: var(--accent-green); box-shadow: 0 0 10px var(--accent-green); }
        .dot.locked { background: #ff4d4d; }
        .dot.booked { background: var(--text-muted); opacity: 0.5; }

        @keyframes pulse-danger {
          0% { box-shadow: 0 0 0 0 rgba(230, 57, 70, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(230, 57, 70, 0); }
          100% { box-shadow: 0 0 0 0 rgba(230, 57, 70, 0); }
        }

        @media (max-width: 600px) {
          .seat-layout { grid-template-columns: repeat(6, 1fr); gap: 10px; }
          .seat-btn { width: 35px; height: 40px; }
          .seat-legend { gap: 1rem; padding: 1rem; flex-wrap: wrap; justify-content: center; }
        }
      `}</style>
    </div>
  );
}
