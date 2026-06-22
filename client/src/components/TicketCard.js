import { QRCodeCanvas } from "qrcode.react";

export default function TicketCard({ booking }) {
  if (!booking) return null;

  // The booking object structure might differ depending on whether it's populated or raw
  const movieName = booking.showId?.movieId?.name || booking.movieName || "Movie";
  const theaterName = booking.showId?.theaterId?.name || booking.theater || "Theater";
  const showTime = new Date(booking.showId?.showTime || booking.showTime).toLocaleString();
  const seats = Array.isArray(booking.seats) ? booking.seats.join(", ") : booking.seats;

  return (
    <div className="ticket-container">
      <div className="ticket-main glass-card">
        <div className="ticket-header">
          <div className="brand-dot"></div>
          <h3 className="premium-font">E-TICKET</h3>
          <div className="booking-id-tag">ID: {String(booking._id || booking.id).substring(0, 8)}</div>
        </div>

        <div className="ticket-body">
          <div className="ticket-info-section">
            <h1 className="movie-title premium-font">{movieName}</h1>
            <div className="info-grid">
              <div className="info-item">
                <label>THEATER</label>
                <strong>{theaterName}</strong>
              </div>
              <div className="info-grid-row">
                <div className="info-item">
                  <label>DATE & TIME</label>
                  <strong>{showTime}</strong>
                </div>
                <div className="info-item">
                  <label>SEATS</label>
                  <strong className="accent-text">{seats}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="ticket-qr-section">
            <div className="qr-wrapper">
              <QRCodeCanvas 
                value={booking.ticketQrCode || `BOOKING_${booking._id}`} 
                size={120} 
                bgColor={"transparent"}
                fgColor={"#64ffda"}
                level={"H"}
              />
            </div>
            <p className="qr-hint">Scan at the entrance</p>
          </div>
        </div>

        <div className="ticket-footer">
          <div className="admit-one">★★ ADMIT ONE ★★</div>
          <div className="price-tag">Rs. {booking.totalPrice || booking.amount}</div>
        </div>
      </div>

      <style jsx>{`
        .ticket-container {
          max-width: 700px;
          margin: 2rem auto;
          perspective: 1000px;
        }
        .ticket-main {
          display: flex;
          flex-direction: column;
          border-left: 6px solid var(--accent-gold);
          overflow: hidden;
          animation: ticketSlide 0.6s ease-out;
        }
        @keyframes ticketSlide { from { transform: rotateX(-10deg) translateY(20px); opacity: 0; } to { transform: rotateX(0) translateY(0); opacity: 1; } }
        
        .ticket-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 1rem 2rem; border-bottom: 1px dashed var(--glass-border);
          background: rgba(255, 255, 255, 0.02);
        }
        .brand-dot { width: 12px; height: 12px; background: var(--accent-gold); border-radius: 50%; }
        .booking-id-tag { font-size: 0.7rem; color: var(--text-muted); font-family: monospace; }
        
        .ticket-body {
          display: grid; grid-template-columns: 1fr 180px; gap: 2rem; padding: 2.5rem 2rem;
        }
        .movie-title { font-size: 2.5rem; margin-bottom: 2rem; color: var(--white); line-height: 1; }
        .info-grid { display: flex; flex-direction: column; gap: 1.5rem; }
        .info-grid-row { display: flex; gap: 3rem; }
        .info-item label { display: block; font-size: 0.65rem; letter-spacing: 2px; color: var(--text-muted); margin-bottom: 6px; }
        .info-item strong { font-size: 1.1rem; color: var(--text-primary); }
        
        .ticket-qr-section {
          background: rgba(0, 0, 0, 0.2); border-radius: 12px;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 1.5rem; border: 1px solid var(--glass-border);
        }
        .qr-wrapper { padding: 10px; background: rgba(255, 255, 255, 0.05); border-radius: 8px; }
        .qr-hint { font-size: 0.6rem; color: var(--accent-cyan); text-transform: uppercase; margin-top: 10px; font-weight: 700; letter-spacing: 1px; }
        
        .ticket-footer {
          display: flex; justify-content: space-between; align-items: center;
          padding: 1.5rem 2rem; background: rgba(0, 0, 0, 0.3);
          border-top: 1px dashed var(--glass-border);
        }
        .admit-one { color: var(--accent-gold); font-size: 0.8rem; font-weight: 800; letter-spacing: 4px; }
        .price-tag { color: var(--accent-cyan); font-weight: 800; font-size: 1.2rem; }
        
        @media (max-width: 650px) {
          .ticket-body { grid-template-columns: 1fr; }
          .ticket-qr-section { order: -1; width: 100%; }
          .movie-title { font-size: 1.8rem; }
        }
      `}</style>
    </div>
  );
}
