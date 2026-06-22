import { useEffect, useState, useCallback, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Layout from "../components/layout";
import SeatLayout from "../components/SeatLayout";
import { fetchShowAvailability, lockSeats } from "../api/movieApi";
import { isLoggedIn } from "../utils/auth";


// Initialize socket connection
const socket = io(process.env.REACT_APP_API_URL || "http://localhost:5000", {
  withCredentials: true,
});

export default function SeatPage() {
  const navigate = useNavigate();
  const { showId } = useParams();
  const { state } = useLocation();
  const [selectedSeats, setSelectedSeats] = useState(state?.selectedSeats || []);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDetails, setShowDetails] = useState(state || null);

  const loadSeats = useCallback(async () => {
    if (!showId) return;
    try {
      const data = await fetchShowAvailability(showId);
      setSeats(data.seats || []);
      
      // Sync show details if they aren't in state (e.g. on refresh)
      if (!showDetails || !showDetails.movie) {
        setShowDetails({
          movie: data.showDetails.movie,
          theater: data.showDetails.theater.name,
          showTime: data.showDetails.showTime,
          showId: showId
        });
      }
    } catch (err) {
      console.warn("Seat Load Error:", err);
      setError("Unable to load seat availability.");
    } finally {
      setLoading(false);
    }
  }, [showId, showDetails]);

  useEffect(() => {
    if (!showId) return;
    loadSeats();
    socket.emit("join-show", showId);
    socket.on("seats-updated", (updatedSeats) => {
      setSeats(updatedSeats);
    });
    return () => {
      socket.emit("leave-show", showId);
      socket.off("seats-updated");
    };
  }, [showId, loadSeats]);

  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((sum, seatId) => {
      const seat = seats.find(s => s.seatId === seatId);
      return sum + (seat ? seat.price : 250);
    }, 0);
  }, [selectedSeats, seats]);

  if (!showId) {
    return (
      <Layout>
        <div className="container app-shell-inner">
          <div className="glass-card empty-state animate-entrance">
            <h3 className="premium-font">Selection Expired</h3>
            <p className="page-subtitle">Please return to the movie page and select your showtime again.</p>
            <button className="primary-btn" onClick={() => navigate("/")}>Browse Movies</button>
          </div>
        </div>
      </Layout>
    );
  }

  const onToggleSeat = (seatId) => {
    setSelectedSeats((current) =>
      current.includes(seatId)
        ? current.filter((id) => id !== seatId)
        : [...current, seatId]
    );
  };

  const handleContinue = async () => {
    if (selectedSeats.length === 0) return;

    // Check if user is logged in
    if (!isLoggedIn()) {
      navigate("/login", { 
        state: { 
          from: window.location.pathname,
          message: "Please sign in to complete your booking.",
          // Preserve current selection state so user can return here
          ...state,
          selectedSeats
        } 
      });
      return;
    }

    try {
      setLoading(true);
      setError(""); // Clear previous errors
      console.log("🚀 Booking attempt:", { showId, seatIds: selectedSeats });
      
      const lockData = await lockSeats({ showId, seatIds: selectedSeats });
      console.log("✅ Seats locked:", lockData);

      navigate("/payment", {
        state: {
          ...showDetails,
          bookingId: lockData.bookingId,
          amount: lockData.totalPrice,
          selectedSeats,
        }
      });
    } catch (err) {
      console.error("❌ Booking error:", err);
      if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Data:", err.response.data);
      }
      
      if (err.response?.status === 401) {
        navigate("/login", { state: { from: window.location.pathname, ...showDetails, selectedSeats } });
      } else {
        // We removed the error-banner UI previously, so we rely on console or alert for now
        // Or we should put back a subtle error.
        alert(err.response?.data?.message || "Booking failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="seat-page-wrapper">
        <div className="seat-hero animate-fade">
          <div className="hero-blur" style={{ backgroundImage: `url(${showDetails?.movie?.poster})` }}></div>
          <div className="hero-content-mini">
            <h1 className="movie-title premium-font">{showDetails?.movie?.name}</h1>
            <p className="movie-meta-pill">
              {showDetails?.theater}  •  {showDetails?.showTime && new Date(showDetails.showTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}  •  {showDetails?.movie?.language}
            </p>
          </div>
        </div>

        <div className="container app-shell-inner seat-interactive-zone">
          {error ? (
            <div className="glass-card error-boundary animate-entrance">
              <h2 className="premium-font">Oops! Something went wrong</h2>
              <p>{error}</p>
              <button className="primary-btn" onClick={() => navigate(-1)}>Try Another Show</button>
            </div>
          ) : (
            <SeatLayout
              seats={seats}
              selectedSeats={selectedSeats}
              onToggleSeat={onToggleSeat}
            />
          )}
        </div>

        <footer className="floating-footer glass-nav">
          <div className="footer-container">
            <div className="selection-preview">
              <div className="preview-item">
                <span className="label">TICKETS</span>
                <span className="value">{selectedSeats.length || 0}</span>
              </div>
              <div className="preview-divider"></div>
              <div className="preview-item">
                <span className="label">TOTAL PRICE</span>
                <span className="value accent-text">₹{totalPrice}</span>
              </div>
            </div>
            
            <button
              className="primary-btn checkout-btn"
              onClick={handleContinue}
              disabled={selectedSeats.length === 0 || loading}
            >
              {loading ? "PROCEEDING..." : `BOOK NOW`}
              <span className="btn-glow"></span>
            </button>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .seat-page-wrapper { margin-top: -20px; }
        .seat-hero {
          position: relative; height: 300px; display: flex; align-items: center; justify-content: center;
          flex-direction: column; overflow: hidden; border-bottom: 1px solid var(--glass-border);
        }
        .hero-blur {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background-size: cover; background-position: center; filter: blur(40px) brightness(0.4);
          transform: scale(1.2); z-index: -1;
        }
        .hero-content-mini { text-align: center; }
        .movie-title { font-size: 3.5rem; margin-bottom: 0.5rem; text-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .movie-meta-pill { 
          display: inline-block; background: rgba(0, 181, 98, 0.1); padding: 8px 25px;
          border-radius: 99px; border: 1px solid rgba(0, 181, 98, 0.2); color: var(--accent-green);
          font-weight: 800; letter-spacing: 1px; text-transform: uppercase; font-size: 0.85rem;
        }


        .seat-interactive-zone { min-height: 80vh; padding-bottom: 150px; }
        
        .floating-footer {
          position: fixed; bottom: 0; left: 0; width: 100%; height: 110px;
          z-index: 1000; display: flex; align-items: center; border-top: 1px solid var(--glass-border);
          background: rgba(0, 0, 0, 0.95); backdrop-filter: blur(20px);
        }
        .footer-container {
          max-width: 1400px; margin: 0 auto; width: 100%; padding: 0 5%;
          display: flex; justify-content: space-between; align-items: center;
        }
        .selection-preview { display: flex; align-items: center; gap: 3rem; }
        .preview-item { display: flex; flex-direction: column; }
        .preview-item .label { font-size: 0.7rem; color: var(--text-muted); font-weight: 800; }
        .preview-item .value { font-size: 1.5rem; font-weight: 800; font-family: 'Outfit'; }
        .preview-divider { width: 1px; height: 40px; background: var(--glass-border); }

        .checkout-btn { 
          min-width: 320px; font-size: 1.2rem; letter-spacing: 2px; font-weight: 900;
          background: var(--accent-green); border-radius: 99px;
        }
        .btn-glow { position: absolute; top: 0; left: 0; width: 100%; height: 100%; box-shadow: 0 0 30px rgba(0,181,98,0.4); opacity: 0; transition: 0.3s; }
        .checkout-btn:hover .btn-glow { opacity: 1; }

        @media (max-width: 768px) {
          .movie-title { font-size: 2rem; }
          .footer-container { padding: 0 1rem; }
          .selection-preview { gap: 1rem; }
          .checkout-btn { min-width: 150px; padding: 0.8rem 1.5rem; font-size: 0.9rem; }
        }
      `}</style>
    </Layout>
  );
}
