import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, FreeMode } from "swiper/modules";
import "swiper/css/free-mode";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

import Layout from "../components/layout";
import MovieCard from "../components/MovieCard";
import MovieSkeleton from "../components/MovieSkeleton";
import { fetchMovies } from "../api/movieApi";
import { isLoggedIn } from "../utils/auth";

const testimonials = [
  {
    id: 1,
    name: "Alex Johnson",
    rating: 5,
    text: "The best movie booking experience ever! The 3D view and seat selection are just incredible.",
    avatar: "https://i.pravatar.cc/150?u=alex"
  },
  {
    id: 2,
    name: "Sarah Williams",
    rating: 5,
    text: "Premium feel, fast booking, and the trailers work perfectly. Highly recommended for cinema lovers!",
    avatar: "https://i.pravatar.cc/150?u=sarah"
  },
  {
    id: 3,
    name: "Michael Chen",
    rating: 4,
    text: "Great selection of movies and very smooth UI. Love the clean minimalist and glassmorphism design.",
    avatar: "https://i.pravatar.cc/150?u=michael"
  },
  {
    id: 4,
    name: "Emily Davis",
    rating: 5,
    text: "Finally a site that actually looks modern. No more messy ads, just pure cinematic experience.",
    avatar: "https://i.pravatar.cc/150?u=emily"
  }
];

function normalizeMovie(rawMovie) {
  return {
    id: rawMovie?.id || rawMovie?._id || "",
    name: rawMovie?.name || rawMovie?.title || "Untitled Movie",
    language: rawMovie?.language || "N/A",
    district: rawMovie?.district || "N/A",
    description: rawMovie?.description || "",
    rating: Number(rawMovie?.rating) || 0,
    trailerId: rawMovie?.trailerId || "",
    poster: rawMovie?.poster || rawMovie?.posterUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2000&auto=format&fit=crop",
    status: rawMovie?.status || "NOW_SHOWING",
    isTrending: !!rawMovie?.isTrending,
    genre: Array.isArray(rawMovie?.genre) ? rawMovie.genre : [],
    director: rawMovie?.director || "",
    runtime: rawMovie?.runtime || "",
    theaters: Array.isArray(rawMovie?.theaters) ? rawMovie.theaters : [],
  };
}

export default function Home() {
  const [district, setDistrict] = useState("All");
  const [language, setLanguage] = useState("All");
  const [search, setSearch] = useState("");
  const [moviesData, setMoviesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    async function loadMovies() {
      try {
        const data = await fetchMovies();
        const normalizedData = Array.isArray(data) ? data.map(normalizeMovie) : [];
        setMoviesData(normalizedData);
      } catch (apiError) {
        setError(apiError?.response?.data?.message || "Unable to load movies");
      } finally {
        setLoading(false);
      }
    }
    loadMovies();
  }, []);

  const districts = useMemo(() => {
    const unique = Array.from(new Set(moviesData.map((m) => m.district).filter(Boolean)));
    return ["All", ...unique];
  }, [moviesData]);

  const languages = useMemo(() => {
    const unique = Array.from(new Set(moviesData.map((m) => m.language).filter(Boolean)));
    return ["All", ...unique];
  }, [moviesData]);

  const filteredMovies = useMemo(() => {
    return moviesData.filter((m) => {
      const matchDistrict = district === "All" || m.district === district;
      const matchLanguage = language === "All" || m.language === language;
      const matchSearch = !search ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.language.toLowerCase().includes(search.toLowerCase());
      return matchDistrict && matchLanguage && matchSearch;
    });
  }, [moviesData, district, language, search]);

  const nowShowing = useMemo(() => filteredMovies.filter(m => m.status === "NOW_SHOWING"), [filteredMovies]);
  const comingSoon = useMemo(() => filteredMovies.filter(m => m.status === "COMING_SOON"), [filteredMovies]);
  const featuredMovies = useMemo(() => {
    const trending = moviesData.filter(m => m.isTrending);
    return (trending.length > 0 ? trending : moviesData).slice(0, 5);
  }, [moviesData]);

  const handleBook = (movie) => {
    if (!isLoggedIn()) {
      navigate("/login", { state: { from: "/", message: "Please login to book tickets" } });
      return;
    }
    navigate(`/theaters/${movie.id}`, { state: { movie } });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container app-shell-inner">
          <div className="skeleton-grid">
            {[...Array(8)].map((_, i) => <MovieSkeleton key={i} />)}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="home-content">
        {/* Cinematic Featured Carousel */}
        {featuredMovies.length > 0 && (
          <section className="featured-section">
            <Swiper
              modules={[Autoplay, Pagination, Navigation]}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              navigation={true}
              className="featured-swiper"
            >
              {featuredMovies.map((movie) => (
                <SwiperSlide key={movie.id}>
                  <div className="hero-slide">
                    <div className="hero-backdrop">
                      <img src={movie.poster} alt={movie.name} />
                      <div className="hero-overlay"></div>
                    </div>
                    <div className="hero-content">
                      <span className="hero-tag-premium">Exclusive Show | Experience in 3D</span>
                      <h1 className="hero-title premium-font">{movie.name}</h1>
                      <div className="hero-meta-row">
                        <span className="meta-pill">{movie.genre.join(" | ")}</span>
                        <span className="meta-divider"></span>
                        <span className="meta-pill">{movie.runtime || "120m"}</span>
                      </div>
                      <p className="hero-desc">{movie.description}</p>
                      {movie.director && <p className="hero-director">Director : {movie.director}</p>}
                      <div className="hero-actions">
                        <button className="primary-btn-premium" onClick={() => handleBook(movie)}>
                          Get Ticket
                        </button>
                        {movie.trailerId && (
                          <button
                            className="secondary-btn-premium"
                            onClick={() => window.open(`https://www.youtube.com/watch?v=${movie.trailerId}`, '_blank')}
                          >
                            <span className="play-icon">▶</span> Watch Trailer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </section>
        )}

        <div className="container app-shell-inner">
          {/* Filters */}
          <section className="filter-bar glass-card animate-entrance">
            <div className="search-wrap">
              <input
                type="text"
                placeholder="Search movies, languages, or genres..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-controls">
              <div className="chip-row">
                <span className="chip-label">District:</span>
                {districts.map((d) => (
                  <button
                    key={d}
                    className={`chip ${district === d ? "active" : ""}`}
                    onClick={() => setDistrict(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <div className="chip-row">
                <span className="chip-label">Language:</span>
                {languages.map((l) => (
                  <button
                    key={l}
                    className={`chip ${language === l ? "active" : ""}`}
                    onClick={() => setLanguage(l)}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Trending Section */}
          {nowShowing.length > 0 && (
            <section className="movie-section stagger-item">
              <div className="section-title-row">
                <h2 className="section-title premium-font">Trending Movies</h2>
                <span className="accent-line" style={{ background: 'var(--accent-green)' }}></span>
              </div>
              <div className="trending-grid">
                {nowShowing.slice(0, 4).map((movie, idx) => (
                  <div key={movie.id} className="trending-card-wrapper animate-entrance" style={{ animationDelay: `${idx * 0.15}s` }}>
                    <div className="trending-number">{idx + 1}</div>
                    <MovieCard movie={movie} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Explore By Genre */}
          <section className="movie-section stagger-item">
            <div className="section-title-row">
              <h2 className="section-title premium-font">Explore By Genre</h2>
              <span className="accent-line" style={{ background: 'var(--accent-green)' }}></span>
            </div>
            <div className="genre-grid">
              {Array.from(new Set(moviesData.flatMap(m => m.genre).filter(Boolean))).length > 0 ?
                Array.from(new Set(moviesData.flatMap(m => m.genre).filter(Boolean))).map((g, idx) => (
                  <div key={g} className="genre-card glass-card" onClick={() => setSearch(g)}>
                    <div className="genre-icon">
                      {g.toLowerCase().includes('action') && '💥'}
                      {g.toLowerCase().includes('adventure') && '🗺️'}
                      {g.toLowerCase().includes('comedy') && '🎭'}
                      {g.toLowerCase().includes('drama') && '🎬'}
                      {g.toLowerCase().includes('horror') && '👻'}
                      {g.toLowerCase().includes('sci-fi') && '🚀'}
                      {!['action', 'adventure', 'comedy', 'drama', 'horror', 'sci-fi'].some(ky => g.toLowerCase().includes(ky)) && '🎞️'}
                    </div>
                    <h3>{g}</h3>
                  </div>
                ))
                :
                ['Action', 'Adventure', 'Comedy', 'Drama', 'Horror', 'Sci-Fi'].map((g) => (
                  <div key={g} className="genre-card glass-card" onClick={() => setSearch(g)}>
                    <h3>{g}</h3>
                  </div>
                ))
              }
            </div>
          </section>

          {error && <p className="error-text animate-fade">{error}</p>}

          {!error && (
            <div className="sections-wrapper">
              {/* Now Showing */}
              {nowShowing.length > 0 && (
                <section className="movie-section stagger-item">
                  <div className="section-title-row">
                    <h2 className="section-title premium-font">Now Showing</h2>
                    <span className="accent-line"></span>
                  </div>
                  <div className="grid movie-grid">
                    {nowShowing.map((movie, idx) => (
                      <div key={movie._id || movie.id} className="stagger-item">
                        <MovieCard movie={movie} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Coming Soon */}
              {comingSoon.length > 0 && (
                <section className="movie-section stagger-item">
                  <div className="section-title-row">
                    <h2 className="section-title premium-font">Coming Soon</h2>
                    <span className="accent-line"></span>
                  </div>
                  <div className="grid movie-grid">
                    {comingSoon.map((movie, idx) => (
                      <div key={movie._id || movie.id} className="stagger-item">
                        <MovieCard movie={movie} />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {filteredMovies.length === 0 && (
                <div className="empty-state animate-fade">
                  <p>No titles found matching your criteria. Try adjusting your filters.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Full-Width Enhanced Sections */}
        <div className="full-width-sections">
          {/* Testimonials Section */}
          <section className="movie-section testimonials-section stagger-item">
            <div className="container">
              <div className="section-title-row text-center">
                <h2 className="section-title premium-font">What Our Users Say</h2>
                <span className="accent-line mx-auto" style={{ background: 'var(--accent-green)' }}></span>
              </div>
              <Swiper
                modules={[Autoplay, Pagination, FreeMode]}
                spaceBetween={30}
                slidesPerView={1}
                autoplay={{ delay: 3500, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 }
                }}
                className="testimonials-swiper"
              >
                {testimonials.map((t) => (
                  <SwiperSlide key={t.id}>
                    <div className="testimonial-card glass-card">
                      <div className="quote-icon">❝</div>
                      <p className="testimonial-text">{t.text}</p>
                      <div className="testimonial-footer">
                        <img src={t.avatar} alt={t.name} className="user-avatar" />
                        <div className="user-info">
                          <h4 className="user-name">{t.name}</h4>
                          <div className="user-rating">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`star ${i < t.rating ? 'active' : ''}`}>★</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </section>

          {/* App Promotion Section */}
          <section className="movie-section app-promotion-section stagger-item">
            <div className="container overflow-visible">
              <div className="app-promotion-card glass-card animate-entrance">
                <div className="app-promo-content">
                  <span className="promo-tag">New Release</span>
                  <h2 className="promo-title premium-font">Book Your Seats Anytime, Anywhere.</h2>
                  <p className="promo-desc">
                    Download the <b>CineElite App</b> today for exclusive discounts, lightning-fast bookings,
                    and instant notifications for upcoming blockbusters.
                  </p>
                  <div className="app-links">
                      <button type="button" className="app-link-btn" onClick={(e) => e.preventDefault()}>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" />
                      </button>
                      <button type="button" className="app-link-btn" onClick={(e) => e.preventDefault()}>
                        <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="App Store" />
                      </button>
                  </div>
                  <div className="stats-row">
                    <div className="stat-item">
                      <span className="stat-value">500K+</span>
                      <span className="stat-label">Downloads</span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat-item">
                      <span className="stat-value">4.8/5</span>
                      <span className="stat-label">User Rating</span>
                    </div>
                  </div>
                </div>
                <div className="app-promo-visual">
                  <div className="phone-container">
                    <img src="/assets/mockup_premium.png" alt="App Mockup" className="app-mockup-img" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <style jsx>{`
        .home-content { padding-top: 20px; }
        .featured-section {
          width: 100%;
          height: 70vh;
          min-height: 500px;
          position: relative;
          z-index: 10;
          background: #000;
          overflow: hidden;
        }
        .featured-swiper { width: 100%; height: 100%; }
        .hero-slide { position: relative; width: 100%; height: 100%; display: flex; align-items: flex-end; padding: 5rem 10%; }
        
        .hero-backdrop { position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: -1; background: #000; }
        .hero-backdrop img { width: 100%; height: 100%; object-fit: cover; object-position: center 20%; filter: brightness(0.5) saturate(1.2); }
        .hero-overlay {
          position: absolute; bottom: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(0deg, var(--bg-deep) 0%, rgba(10, 15, 26, 0.6) 50%, transparent 100%);
        }

        .hero-content { z-index: 10; max-width: 900px; animation: slideUp 0.8s ease-out; }
        .hero-tag-premium { color: var(--text-secondary); font-weight: 500; font-size: 1rem; margin-bottom: 2rem; display: block; opacity: 0.9; }
        .hero-title { font-size: 3.8rem; margin: 0 0 1.2rem; line-height: 1; font-weight: 900; letter-spacing: -1.5px; }
        
        .hero-meta-row { display: flex; align-items: center; gap: 12px; margin-bottom: 1.5rem; }
        .hero-meta-row .meta-pill { font-weight: 700; color: var(--text-secondary); font-size: 0.85rem; }
        .meta-divider { width: 1px; height: 12px; background: rgba(255,255,255,0.2); }
        
        .hero-desc { font-size: 0.95rem; color: var(--text-muted); margin-bottom: 1.5rem; line-height: 1.5; max-width: 480px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        .hero-director { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 2rem; font-weight: 600; }
        
        .hero-actions { display: flex; gap: 2rem; }
        
        .primary-btn-premium { 
          background: var(--accent-green); color: var(--white); 
          padding: 1rem 2.5rem; border-radius: 10px; font-weight: 800; 
          border: none; cursor: pointer; transition: 0.3s; font-size: 1rem;
          box-shadow: 0 10px 20px rgba(12, 74, 55, 0.2);
        }
        .primary-btn-premium:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(5, 150, 105, 0.3); }

        .secondary-btn-premium {
          background: rgba(255,255,255,0.05); color: var(--white);
          padding: 1rem 2.5rem; border-radius: 10px; font-weight: 800;
          border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: 0.3s; font-size: 1rem;
          display: flex; align-items: center; gap: 8px;
        }
        .secondary-btn-premium:hover { background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.3); }
        .play-icon { font-size: 1.3rem; }

        .filter-bar { padding: 2.5rem; margin-top: -3rem; position: relative; z-index: 20; display: flex; flex-direction: column; gap: 2rem; border-radius: 24px; }
        .search-wrap { width: 100%; }
        .search-input { width: 100%; background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border); padding: 1rem 1.5rem; border-radius: 12px; color: var(--white); font-size: 1rem; }
        .search-input:focus { outline: none; border-color: var(--accent-green); box-shadow: 0 0 15px rgba(0,181,98,0.2); }

        .filter-controls { display: flex; flex-direction: column; gap: 1.2rem; }
        .chip-row { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; }
        .chip-label { font-size: 0.8rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-right: 15px; }

        .chip { background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); color: var(--text-secondary); padding: 8px 20px; border-radius: 99px; cursor: pointer; transition: 0.3s; font-size: 0.9rem; }
        .chip:hover { background: rgba(255,255,255,0.08); color: var(--white); }
        .chip.active { background: var(--accent-green); color: var(--white); border-color: var(--accent-green); font-weight: 700; box-shadow: 0 0 20px rgba(0,181,98,0.4); }

        /* Trending Section Styling */
        .trending-grid { 
          display: grid; 
          grid-template-columns: repeat(5, 1fr) !important; 
          gap: 1.5rem; 
          padding: 2rem 0;
          align-items: flex-start;
          width: 100%;
        }
        .trending-card-wrapper { position: relative; width: 100%; min-width: 0; }
        .trending-number { 
          position: absolute; 
          bottom: 20px; 
          left: -15px; 
          font-size: 8rem; 
          font-weight: 950; 
          line-height: 0.8; 
          z-index: -1; 
          color: rgba(255, 255, 255, 0.03);
          -webkit-text-stroke: 1px rgba(255, 255, 255, 0.05);
          user-select: none; 
          pointer-events: none;
          transition: 0.3s;
        }
        .trending-card-wrapper:hover .trending-number {
          color: rgba(0, 181, 98, 0.05);
          -webkit-text-stroke: 1px rgba(0, 181, 98, 0.1);
        }

        .movie-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr) !important;
          gap: 1.5rem;
          align-items: flex-start;
          width: 100%;
          margin-top: 1.5rem;
        }
        .movie-grid > div { min-width: 0; }

        .genre-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1.5rem; margin-top: 2rem; }
        .genre-card { 
          padding: 2rem; text-align: center; cursor: pointer; transition: var(--transition-smooth);
          border-radius: 20px; display: flex; flex-direction: column; align-items: center; gap: 1rem;
        }
        .genre-card:hover { background: rgba(255,255,255,0.08); transform: translateY(-5px); border-color: var(--accent-green); }
        .genre-icon { font-size: 2.5rem; filter: drop-shadow(0 0 10px rgba(255,255,255,0.2)); }
        .genre-card h3 { margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--text-primary); }

        .movie-section { margin-top: 3rem; }
        .section-title { font-size: 1.8rem; }
        .accent-line { width: 40px; height: 3px; background: var(--accent-gold); border-radius: 2px; margin-top: 6px; display: block; }

        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        
        @media (max-width: 1024px) {
          .trending-grid, .movie-grid { grid-template-columns: repeat(3, 1fr); }
        }
        
        @media (max-width: 768px) {
          .hero-title { font-size: 2.5rem; }
          .hero-slide { padding: 3rem 5%; }
          .trending-grid, .movie-grid { grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
          .trending-number { font-size: 6rem; left: -15px; bottom: -10px; }
        }

        @media (max-width: 480px) {
          .trending-grid, .movie-grid { grid-template-columns: 1fr; }
        }

        /* Testimonials Section */
        .testimonials-section { padding: 4rem 0; }
        .text-center { text-align: center; display: flex; flex-direction: column; align-items: center; }
        .mx-auto { margin-left: auto; margin-right: auto; }
        .testimonials-swiper { padding: 3rem 1rem 4rem; width: 100%; }
        .testimonial-card { 
          padding: 1.8rem; 
          border-radius: 20px; 
          min-height: 200px; 
          display: flex; 
          flex-direction: column; 
          gap: 1.2rem;
          transition: var(--transition-smooth);
        }
        .testimonial-card:hover { transform: translateY(-8px) scale(1.02); border-color: var(--accent-green); }
        .quote-icon { font-size: 2.5rem; color: var(--accent-green); opacity: 0.3; height: 25px; line-height: 1; }
        .testimonial-text { font-size: 0.95rem; color: var(--text-secondary); font-style: italic; font-weight: 300; line-height: 1.7; }
        .testimonial-footer { display: flex; align-items: center; gap: 12px; margin-top: auto; }
        .user-avatar { width: 45px; height: 45px; border-radius: 50%; border: 2px solid var(--accent-green); }
        .user-name { margin: 0; font-size: 1.1rem; font-weight: 700; color: var(--text-primary); }
        .user-rating { color: var(--accent-gold); font-size: 0.8rem; display: flex; gap: 2px; }
        .star.active { color: var(--accent-gold); }
        .star { color: var(--text-muted); }

        /* App Promotion Section */
        .app-promotion-section { margin-bottom: 4rem; }
        .app-promotion-card { 
          display: grid; 
          grid-template-columns: 1.2fr 0.8fr; 
          gap: 2.5rem; 
          padding: 3rem; 
          border-radius: 28px; 
          overflow: hidden; 
          background: linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(16, 185, 129, 0.05) 100%);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
          border: 1px solid var(--glass-border);
        }
        .app-promo-content { display: flex; flex-direction: column; justify-content: center; gap: 1.2rem; }
        .promo-tag { background: var(--accent-green); color: var(--white); padding: 4px 12px; border-radius: 99px; font-size: 0.7rem; font-weight: 800; width: fit-content; text-transform: uppercase; letter-spacing: 1px; }
        .promo-title { font-size: 2.2rem; line-height: 1.1; margin: 0; }
        .promo-desc { font-size: 1rem; color: var(--text-secondary); line-height: 1.6; max-width: 450px; }
        .app-links { display: flex; gap: 1.2rem; margin-top: 0.8rem; }
        .app-link-btn img { height: 40px; transition: 0.3s; }
        .app-link-btn:hover img { transform: translateY(-5px); filter: brightness(1.2); }
        .stats-row { display: flex; align-items: center; gap: 1.5rem; margin-top: 1.5rem; }
        .stat-item { display: flex; flex-direction: column; }
        .stat-value { font-size: 1.5rem; font-weight: 800; color: var(--text-primary); }
        .stat-label { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }
        .stat-divider { width: 1px; height: 30px; background: rgba(255,255,255,0.1); }
 
        .app-promo-visual { position: relative; display: flex; justify-content: center; align-items: center; }
        .phone-container { 
          position: relative; 
          width: 240px; 
          height: 480px; 
          background: #f1f5f9; 
          border-radius: 32px; 
          border: 6px solid #cbd5e1; 
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          overflow: hidden;
          transform: rotate(5deg);
          transition: var(--transition-smooth);
        }--transition-smooth);
        }
        .app-promotion-card:hover .phone-container { transform: rotate(0) translateY(-20px); box-shadow: 0 60px 120px rgba(0, 181, 98, 0.2); }
        .app-mockup-img { width: 100%; height: 100%; object-fit: cover; }

        @media (max-width: 1024px) {
          .app-promotion-card { grid-template-columns: 1fr; padding: 3rem; text-align: center; }
          .app-promo-content { align-items: center; }
          .promo-title { font-size: 2.5rem; }
          .app-promo-visual { display: none; }
          .app-links { justify-content: center; }
          .stats-row { justify-content: center; }
        }
        .full-width-sections { width: 100%; position: relative; }
        .overflow-visible { overflow: visible !important; }
      `}</style>
    </Layout>
  );
}
