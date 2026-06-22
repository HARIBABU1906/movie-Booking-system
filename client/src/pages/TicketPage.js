import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "../components/layout";
import TicketCard from "../components/TicketCard";
import { fetchBooking } from "../api/movieApi";
import { QRCodeCanvas } from "qrcode.react";

export default function TicketPage() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBooking() {
      try {
        const data = await fetchBooking(id);
        setBooking(data);
      } catch (error) {
        console.error("Booking not found");
      } finally {
        setLoading(false);
      }
    }

    if (!state?.selectedSeats) {
      loadBooking();
    } else {
      setBooking({
        ...state,
        movieName: state.movie.name,
        bookingCode: id.slice(-8).toUpperCase(),
        bookingDate: new Date().toLocaleDateString(),
        seats: state.selectedSeats,
      });
      setLoading(false);
    }
  }, [id, state]);

  const handlePrint = () => window.print();

  if (loading) {
    return (
      <Layout>
        <div className="container app-shell-inner flex-center">
          <div className="loader-ring"></div>
        </div>
      </Layout>
    );
  }

  if (!booking) {
    return (
      <Layout>
        <div className="container app-shell-inner flex-center">
          <div className="glass-card error-state animate-entrance">
            <h2 className="premium-font">Ticket Not Found</h2>
            <button className="primary-btn" onClick={() => navigate("/")}>Browse Movies</button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container app-shell-inner ticket-view-wrapper">
        <header className="ticket-header animate-fade">
          <h1 className="page-title premium-font">Your E-Ticket</h1>
          <p className="page-subtitle">Show this QR code at the cinema entry</p>
        </header>

        <div className="ticket-display-zone animate-entrance">
          <div className="ticket-wrapper-premium">
            <TicketCard booking={booking} />
            <div className="ticket-perforation">
              <div className="circle left"></div>
              <div className="line"></div>
              <div className="circle right"></div>
            </div>
            <div className="ticket-footer-action glass-card">
              <div className="qr-box-mini">
                <p className="scan-label">SCAN AT SCREEN ENTRY</p>
                <div className="qr-container-premium">
                  <QRCodeCanvas 
                    value={`BOOKING:${booking.bookingCode || id}`} 
                    size={140}
                    bgColor={"transparent"}
                    fgColor={"#00b562"}
                    level={"H"}
                    includeMargin={false}
                  />
                  <div className="qr-decor-tl"></div>
                  <div className="qr-decor-br"></div>
                </div>
                <p className="booking-id-text">{booking.bookingCode || id}</p>
              </div>
              <div className="action-btns">
                <button className="secondary-btn" onClick={handlePrint}>Print / Export PDF</button>
                <button className="primary-btn" onClick={() => navigate("/")}>Back to Movies</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .ticket-view-wrapper { max-width: 600px; margin: 4rem auto; min-height: 80vh; }
        .ticket-header { text-align: center; margin-bottom: 3rem; }
        
        .ticket-wrapper-premium {
          position: relative;
          filter: drop-shadow(0 30px 60px rgba(0,0,0,0.5));
          animation: floatTicket 4s infinite alternate ease-in-out;
        }
        
        @keyframes floatTicket {
          from { transform: translateY(0); }
          to { transform: translateY(-15px); }
        }

        .ticket-perforation {
          position: relative; height: 40px; background: var(--bg-surface);
          display: flex; align-items: center; justify-content: center;
          margin: 0 1px; border-left: 1px solid var(--glass-border); border-right: 1px solid var(--glass-border);
        }
        .ticket-perforation .line { width: 90%; height: 2px; border-bottom: 2px dashed rgba(255,255,255,0.1); }
        .ticket-perforation .circle {
          position: absolute; width: 30px; height: 30px; background: var(--bg-deep);
          border-radius: 50%; top: 5px;
        }
        .circle.left { left: -15px; border-right: 1px solid var(--glass-border); }
        .circle.right { right: -15px; border-left: 1px solid var(--glass-border); }
        
        .ticket-footer-action {
          border-top: none; border-radius: 0 0 20px 20px; padding: 2.5rem;
          display: flex; flex-direction: column; gap: 2rem;
        }
        .qr-box-mini { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
        .scan-label { font-size: 0.7rem; letter-spacing: 4px; color: var(--accent-green); font-weight: 800; margin-bottom: 5px; }
        .qr-container-premium { 
          position: relative; padding: 15px; background: rgba(255,255,255,0.05); 
          border-radius: 12px; border: 1px solid var(--glass-border);
        }
        .qr-decor-tl { position: absolute; top: -5px; left: -5px; width: 20px; height: 20px; border-left: 3px solid var(--accent-green); border-top: 3px solid var(--accent-green); }
        .qr-decor-br { position: absolute; bottom: -5px; right: -5px; width: 20px; height: 20px; border-right: 3px solid var(--accent-green); border-bottom: 3px solid var(--accent-green); }
        .booking-id-text { font-family: 'Outfit'; font-weight: 800; color: var(--white); opacity: 0.8; letter-spacing: 2px; margin-top: 10px; }
        
        .action-btns { display: flex; flex-direction: column; gap: 1rem; }
        
        @media print {
          .top-nav, .action-btns, .ticket-header { display: none; }
          .ticket-view-wrapper { margin: 0; padding: 0; }
          .ticket-wrapper-premium { animation: none; transform: none; }
        }
      `}</style>
    </Layout>
  );
}
