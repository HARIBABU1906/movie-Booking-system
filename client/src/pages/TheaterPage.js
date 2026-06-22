import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Layout from "../components/layout";
import TheaterCard from "../components/TheaterCard";
import TheaterSkeleton from "../components/TheaterSkeleton";
import { fetchMovies } from "../api/movieApi";
import ReviewSection from "../components/ReviewSection";

export default function TheaterPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMovie, setCurrentMovie] = useState(null);

  useEffect(() => {
    async function loadMovies() {
      try {
        const data = await fetchMovies();
        setMovies(data);
      } catch (error) {
        setMovies([]);
      } finally {
        setLoading(false);
      }
    }

    if (!state?.movie) {
      loadMovies();
    } else {
      setLoading(false);
    }
  }, [state]);

  useEffect(() => {
    if (!loading) {
      const found = state?.movie || movies.find((item) => String(item.id || item._id) === String(id));
      setCurrentMovie(found);
    }
  }, [id, state, movies, loading]);

  if (loading) {
    return (
      <Layout>
        <div className="container app-shell-inner">
          <div className="skeleton-list">
            {[...Array(3)].map((_, i) => <TheaterSkeleton key={i} />)}
          </div>
        </div>
      </Layout>
    );
  }

  if (!currentMovie) {
    return (
      <Layout>
        <div className="container app-shell-inner flex-center">
          <div className="glass-card empty-state animate-entrance">
            <h2 className="premium-font">Movie Not Found</h2>
            <button className="primary-btn" onClick={() => navigate("/")}>Go Back Home</button>
          </div>
        </div>
      </Layout>
    );
  }

  const onPickTime = (theaterName, showTime, showId) => {
    navigate(`/seats/${showId}`, {
      state: { movie: currentMovie, theater: theaterName, showTime, showId },
    });
  };

  const handleReviewAdded = (newReviews, newRating) => {
    setCurrentMovie(prev => ({
      ...prev,
      reviews: newReviews,
      rating: newRating
    }));
  };

  return (
    <Layout>
      <div className="theater-page-wrapper">
        <section className="movie-premium-hero animate-fade">
          <div className="hero-blur-bg" style={{ backgroundImage: `url(${currentMovie.poster || currentMovie.posterUrl})` }}></div>
          <div className="container hero-content-grid">
            <div className="hero-poster-box animate-entrance">
              <img src={currentMovie.poster || currentMovie.posterUrl} alt={currentMovie.name} />
              <div className="poster-glow"></div>
            </div>
            <div className="hero-details text-entrance">
              <div className="meta-row">
                <span className="badge-pill">{currentMovie.language}</span>
                <span className="badge-pill gold">{currentMovie.rating.toFixed(1)}/10</span>
              </div>
              <h1 className="movie-title premium-font">{currentMovie.name}</h1>
              <p className="movie-description">{currentMovie.description}</p>
              <div className="quick-stats">
                <div className="stat-item">
                  <span className="label">Release Date</span>
                  <span className="val">{new Date(currentMovie.releaseDate || Date.now()).toLocaleDateString()}</span>
                </div>
                <div className="stat-item">
                  <span className="label">District</span>
                  <span className="val">{currentMovie.district}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container app-shell-inner">
          <div className="schedule-layout">
            <div className="theater-list-section">
              <header className="section-header">
                <h2 className="section-title premium-font">Available Showtimes</h2>
                <div className="accent-bar"></div>
              </header>

              <div className="theater-grid">
                {currentMovie.theaters && currentMovie.theaters.length > 0 ? (
                  currentMovie.theaters.map((theater, index) => (
                    <div className="stagger-item" key={`${theater.name}-${index}`}>
                      <TheaterCard theater={theater} onPickTime={onPickTime} />
                    </div>
                  ))
                ) : (
                  <div className="glass-card empty-shows">
                    <p>No shows available for this movie currently.</p>
                  </div>
                )}
              </div>

              <ReviewSection movie={currentMovie} onReviewAdded={handleReviewAdded} />
            </div>

            <aside className="movie-aside animate-fade">
              <div className="glass-card trailer-card">
                <h3 className="premium-font">Official Trailer</h3>
                <div className="video-wrapper">
                  <iframe
                    src={`https://www.youtube.com/embed/${currentMovie.trailerId}`}
                    title="Trailer"
                    allowFullScreen
                  />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <style jsx>{`
        .theater-page-wrapper { margin-top: -20px; }
        .movie-premium-hero {
          position: relative; height: 450px; overflow: hidden;
          display: flex; align-items: center; border-bottom: 1px solid var(--glass-border);
        }
        .hero-blur-bg {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          background-size: cover; background-position: center; filter: blur(60px) brightness(0.3);
          transform: scale(1.1); z-index: -1;
        }
        .hero-content-grid {
          display: grid; grid-template-columns: 280px 1fr; gap: 4rem; align-items: center;
        }
        .hero-poster-box { position: relative; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
        .hero-poster-box img { width: 100%; display: block; }
        .poster-glow { position: absolute; top: 0; left: 0; width: 100%; height: 100%; box-shadow: inset 0 0 40px rgba(0,181,98,0.3); pointer-events: none; }

        .meta-row { display: flex; gap: 12px; margin-bottom: 2rem; }
        .badge-pill { 
          background: rgba(0,181,98,0.1); color: var(--accent-green); 
          padding: 8px 18px; border-radius: 99px; font-weight: 800; font-size: 0.8rem;
          border: 1px solid rgba(0,181,98,0.2); text-transform: uppercase;
        }
        .badge-pill.gold { background: rgba(255,255,255,0.05); color: var(--white); border-color: rgba(255,255,255,0.1); }
        
        .movie-title { font-size: 4.5rem; font-weight: 900; letter-spacing: -2px; margin-bottom: 1rem; color: var(--white); }
        .movie-description { color: var(--text-secondary); max-width: 700px; line-height: 1.7; margin-bottom: 2.5rem; font-size: 1.1rem; }
        
        .quick-stats { display: flex; gap: 3rem; }
        .stat-item { display: flex; flex-direction: column; gap: 4px; }
        .stat-item .label { font-size: 0.7rem; color: var(--text-muted); font-weight: 800; text-transform: uppercase; }
        .stat-item .val { font-size: 1.1rem; color: var(--white); font-weight: 600; }

        .schedule-layout { display: grid; grid-template-columns: 1fr 380px; gap: 5rem; margin-top: 5rem; }
        .section-header { margin-bottom: 3rem; }
        .accent-bar { width: 50px; height: 5px; background: var(--accent-green); border-radius: 2px; margin-top: 10px; }

        .theater-grid { display: flex; flex-direction: column; gap: 1.5rem; }
        .video-wrapper { 
          position: relative; padding-bottom: 56.25%; height: 0; margin-top: 1.5rem; border-radius: 12px; overflow: hidden;
          background: #000;
        }
        .video-wrapper iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; }

        @media (max-width: 1024px) {
          .schedule-layout { grid-template-columns: 1fr; }
          .hero-content-grid { grid-template-columns: 200px 1fr; gap: 2rem; }
          .movie-title { font-size: 2.5rem; }
        }
      `}</style>
    </Layout>
  );
}
