import { useNavigate } from "react-router-dom";
import { isLoggedIn } from "../utils/auth";

export default function MovieCard({ movie }) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (!isLoggedIn()) {
      navigate("/login", { state: { from: "/", message: "Please login to book tickets" } });
      return;
    }
    navigate(`/theaters/${movie.id || movie._id}`, { state: { movie } });
  };

  return (
    <div className="movie-card glass-card animate-entrance" onClick={handleCardClick}>
      <div className="poster-container">
        <img 
          src={movie.poster || movie.posterUrl || "https://via.placeholder.com/300x450?text=No+Poster"} 
          alt={movie.name} 
          className="movie-poster"
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/300x450?text=No+Poster";
          }}
        />
        <div className="poster-overlay">
          <button className="quick-book-btn">Book Now</button>
        </div>
        {movie.rating && (
          <div className="rating-badge">
            <span className="star">★</span> {movie.rating}
          </div>
        )}
      </div>
      
      <div className="movie-details">
        <h4 className="movie-title premium-font">{movie.name}</h4>
        <div className="movie-meta">
          <span className="lang">{movie.language}</span>
          <span className="dot">•</span>
          <span className="genre">{movie.district}</span>
        </div>
      </div>

      <style jsx>{`
        .movie-card {
          position: relative;
          cursor: pointer;
          transition: var(--transition-smooth);
          height: auto;
          width: 100%;
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          border-radius: 16px;
          overflow: hidden;
          box-sizing: border-box;
        }
        .movie-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 15px rgba(0, 181, 98, 0.1);
          border-color: var(--accent-green);
        }
        .poster-container {
          position: relative;
          width: 100%;
          padding-top: 150%; /* Strictly 2:3 Aspect Ratio */
          overflow: hidden;
          background: #000;
          flex-shrink: 0;
        }
        .movie-poster {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transition: transform 0.6s var(--transition-smooth);
        }
        .movie-card:hover .movie-poster { transform: scale(1.08); }
        
        .poster-overlay {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, transparent 60%);
          display: flex;
          align-items: flex-end; justify-content: center;
          padding-bottom: 1.5rem;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 2;
        }
        .movie-card:hover .poster-overlay { opacity: 1; }
        
        .quick-book-btn {
          background: var(--accent-green);
          color: var(--white);
          border: none;
          padding: 0.6rem 1.4rem;
          border-radius: 99px;
          font-weight: 800;
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.5px;
          transform: translateY(10px);
          transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .movie-card:hover .quick-book-btn { transform: translateY(0); }
        
        .rating-badge {
          position: absolute;
          top: 12px; right: 12px;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--accent-green);
          border: 1px solid rgba(0, 181, 98, 0.3);
          display: flex; align-items: center; gap: 4px;
          z-index: 5;
        }
        
        .movie-details { 
          padding: 1rem 0.8rem; 
          height: 100px; /* STRICTLY FIXED HEIGHT */
          display: flex; 
          flex-direction: column; 
          justify-content: center;
          background: rgba(255, 255, 255, 0.01);
          box-sizing: border-box;
          flex-shrink: 0;
        }
        .movie-title { 
          margin: 0 0 4px; 
          font-size: 1rem; 
          font-weight: 800; 
          white-space: nowrap; 
          overflow: hidden; 
          text-overflow: ellipsis; 
          color: var(--text-primary); 
          line-height: 1.2;
          max-width: 100%;
        }
        .movie-meta { 
          display: flex; 
          align-items: center; 
          gap: 6px; 
          font-size: 0.75rem; 
          color: var(--text-muted); 
          font-weight: 600; 
        }
        .dot { color: var(--accent-green); font-size: 1.2rem; line-height: 0; }
      `}</style>
    </div>
  );
}
