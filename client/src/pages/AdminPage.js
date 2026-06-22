import { useEffect, useState } from "react";
import Layout from "../components/layout";
import {
  addMovie,
  deleteMovie,
  fetchAdminBookings,
  fetchAdminMovies,
  updateMovie,
  fetchAdminStats,
  fetchAllTheaters,
} from "../api/movieApi";

const initialForm = {
  name: "",
  language: "Tamil",
  district: "Chennai",
  description: "",
  rating: "7.0",
  trailerId: "",
  poster: "",
  theater: "",
  showTimes: "",
  status: "NOW_SHOWING",
  isTrending: false,
  genre: "Action",
  director: "",
  runtime: "",
};

function toPayload(form) {
  const times = form.showTimes
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const genres = form.genre
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    times,
    payload: {
      name: form.name,
      language: form.language,
      district: form.district,
      description: form.description,
      rating: Number(form.rating),
      trailerId: form.trailerId,
      poster: form.poster,
      status: form.status,
      isTrending: form.isTrending,
      genre: genres,
      director: form.director,
      runtime: form.runtime,
      theaters: [{ name: form.theater, times }],
    },
  };
}

const LANGUAGES = ["Tamil", "English", "Hindi", "Telugu", "Malayalam", "Kannada"];

export default function AdminPage() {
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [movies, setMovies] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [stats, setStats] = useState({ totalMovies: 0, totalUsers: 0, totalBookings: 0, totalRevenue: 0 });
  
  const districts = [...new Set(theaters.map(t => t.district))].filter(Boolean);
  const filteredTheaters = theaters.filter(t => t.district === form.district);
  const [, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (key, value) => {
    if (key === "district" && value !== form.district) {
      setForm((current) => ({ ...current, district: value, theater: "" }));
      return;
    }
    setForm((current) => ({ ...current, [key]: value }));
  };

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [moviesData, bookingsData, statsData, theatersData] = await Promise.all([
        fetchAdminMovies(),
        fetchAdminBookings(),
        fetchAdminStats(),
        fetchAllTheaters()
      ]);
      setMovies(moviesData);
      setBookings(bookingsData);
      setStats(statsData);
      setTheaters(theatersData);
    } catch (apiError) {
      console.error("Error loading admin data:", apiError);
      setError("Unable to load administrative data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (movie) => {
    const firstTheater = movie.theaters?.[0];
    
    // Convert time properly if it is a Date string
    const formattedTimes = (firstTheater?.times || []).map(t => {
      try {
        const d = new Date(t);
        if (!isNaN(d.getTime())) {
          return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        }
        return t;
      } catch (e) {
        return t;
      }
    });

    setEditingId(movie.id || movie._id);
    setForm({
      name: movie.name || "",
      language: movie.language || "",
      district: movie.district || "",
      description: movie.description || "",
      rating: String(movie.rating ?? ""),
      trailerId: movie.trailerId || "",
      poster: movie.poster || "",
      theater: firstTheater?.name || "",
      showTimes: formattedTimes.join(", ") || "",
      status: movie.status || "NOW_SHOWING",
      isTrending: !!movie.isTrending,
      genre: Array.isArray(movie.genre) ? movie.genre.join(", ") : "Action",
      director: movie.director || "",
      runtime: movie.runtime || "",
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(initialForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setSubmitting(true);

    const { times, payload } = toPayload(form);
    if (!times.length) {
      setError("Add at least one show time.");
      setSubmitting(false);
      return;
    }

    try {
      if (editingId) {
        await updateMovie(editingId, payload);
        setMessage("Movie updated successfully.");
      } else {
        await addMovie(payload);
        setMessage("Movie added successfully.");
      }
      resetForm();
      await loadData();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Unable to save movie.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (movie) => {
    const shouldDelete = window.confirm(
      `Remove "${movie.name}"? This will also remove related bookings.`
    );
    if (!shouldDelete) {
      return;
    }

    setMessage("");
    setError("");
    const movieId = movie.id || movie._id;
    try {
      await deleteMovie(movieId);
      if (editingId === movieId) {
        resetForm();
      }
      setMessage("Movie removed successfully.");
      await loadData();
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Unable to remove movie.");
    }
  };

  return (
    <Layout>
      <div className="container app-shell-inner">
        <header className="page-header animate-entrance">
          <div className="header-flex">
            <div className="admin-icon-wrapper">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="admin-svg">
                <path d="M12 2L4 5V11C4 16.19 7.41 21.05 12 22C16.59 21.05 20 16.19 20 11V5L12 2Z" stroke="var(--accent-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 11V11.01" stroke="var(--accent-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 15V15.01" stroke="var(--accent-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 7V8" stroke="var(--accent-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h1 className="page-title premium-font">Administrative Hub</h1>
              <p className="page-subtitle">Platform overview and management dashboard</p>
            </div>
          </div>
        </header>

        {/* Dashboard Stats */}
        <div className="stats-grid stagger-item">
          <div className="glass-card stat-card">
            <span className="stat-label">Total Revenue</span>
            <span className="stat-value accent-text">₹{stats.totalRevenue.toLocaleString()}</span>
          </div>
          <div className="glass-card stat-card">
            <span className="stat-label">Users</span>
            <span className="stat-value">{stats.totalUsers}</span>
          </div>
          <div className="glass-card stat-card">
            <span className="stat-label">Theaters</span>
            <span className="stat-value">{theaters.length}</span>
          </div>
          <div className="glass-card stat-card">
            <span className="stat-label">Bookings</span>
            <span className="stat-value">{stats.totalBookings}</span>
          </div>
        </div>

        <div className="admin-grid">
          <section className="admin-main">
            {/* Movie Management */}
            <div className="glass-card">
              <h3 className="section-title premium-font">{editingId ? "Edit Movie" : "Register Movie"}</h3>
              <form className="modern-form" onSubmit={handleSubmit}>
                <div className="input-group">
                  <label>Movie Name</label>
                  <input value={form.name} onChange={e => handleChange("name", e.target.value)} required />
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label>Language</label>
                    <select value={form.language} onChange={e => handleChange("language", e.target.value)}>
                      {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Rating</label>
                    <input type="number" step="0.1" value={form.rating} onChange={e => handleChange("rating", e.target.value)} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label>District Selection</label>
                    <select value={form.district} onChange={e => handleChange("district", e.target.value)} required>
                      <option value="">Choose District...</option>
                      {districts.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Theater / Venue</label>
                    <select value={form.theater} onChange={e => handleChange("theater", e.target.value)} required disabled={!form.district}>
                      <option value="">Select Venue...</option>
                      {filteredTheaters.map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="input-group">
                  <label>Description</label>
                  <textarea value={form.description} onChange={e => handleChange("description", e.target.value)} required />
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label>Trailer ID (YouTube)</label>
                    <input value={form.trailerId} onChange={e => handleChange("trailerId", e.target.value)} required />
                  </div>
                  <div className="input-group">
                    <label>Poster URL</label>
                    <input value={form.poster} onChange={e => handleChange("poster", e.target.value)} required />
                  </div>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label>Director</label>
                    <input value={form.director} onChange={e => handleChange("director", e.target.value)} />
                  </div>
                  <div className="input-group">
                    <label>Runtime</label>
                    <input value={form.runtime} onChange={e => handleChange("runtime", e.target.value)} />
                  </div>
                </div>

                <div className="form-row">
                   <div className="input-group">
                    <label>Show Times (comma separated)</label>
                    <input value={form.showTimes} onChange={e => handleChange("showTimes", e.target.value)} placeholder="10:00 AM, 07:00 PM" required />
                  </div>
                   <div className="input-group">
                    <label>Status</label>
                    <select value={form.status} onChange={e => handleChange("status", e.target.value)}>
                      <option value="NOW_SHOWING">Now Showing</option>
                      <option value="COMING_SOON">Coming Soon</option>
                    </select>
                  </div>
                </div>

                {error && <p className="error-text text-center">{error}</p>}
                {message && <p className="success-text text-center">{message}</p>}

                <div className="form-actions">
                  <button className="primary-btn wide" type="submit" disabled={submitting}>
                    {submitting ? "Processing..." : editingId ? "Save Changes" : "Register Movie"}
                  </button>
                  {editingId && (
                    <button className="secondary-btn wide" type="button" onClick={resetForm}>Cancel</button>
                  )}
                </div>
              </form>
            </div>

            {/* Movie Management List */}
            <div className="glass-card mt-3">
              <h3 className="section-title premium-font">Movie Inventory</h3>
              <div className="admin-list-container">
                {movies.length === 0 ? <p className="text-center p-3">No movies found.</p> : (
                  movies.map((movie) => (
                    <div className="admin-list-item card-hover" key={movie.id || movie._id}>
                      <div className="item-main">
                        <div className="item-title-row">
                          <strong className="movie-name">{movie.name}</strong>
                          <span className={`status-badge ${movie.status === "NOW_SHOWING" ? "active" : "upcoming"}`}>
                            {movie.status === "NOW_SHOWING" ? "Live" : "Soon"}
                          </span>
                        </div>
                        <span className="muted-text small">{movie.language} • {movie.district} • {movie.rating} ⭐</span>
                      </div>
                      <div className="item-actions">
                        <button className="icon-btn edit-btn" onClick={() => handleEdit(movie)} title="Edit Movie">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                        <button className="icon-btn delete-btn" onClick={() => handleDelete(movie)} title="Delete Movie">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bookings List */}
            <div className="glass-card mt-3">
              <h3 className="section-title premium-font">Recent Transactions</h3>
              <div className="admin-list-container">
                {bookings.length === 0 ? <p className="text-center p-3">No bookings recorded.</p> : (
                  bookings.map((booking) => (
                    <div className="admin-list-item card-hover" key={booking.bookingCode}>
                      <div className="item-main">
                        <strong>{booking.movieName}</strong>
                        <span className="muted-text small">{booking.bookingCode} | {booking.customerName}</span>
                      </div>
                      <div className="item-meta">
                        <span className="badge-gold">₹{booking.amount}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          <aside className="admin-aside">
            {/* Theater List */}
            <div className="glass-card">
              <h3 className="section-title premium-font">Theater Partners</h3>
              <div className="admin-list-container small">
                {theaters.map(t => (
                  <div className="admin-list-item" key={t._id}>
                    <div>
                      <h4 className="small-title">{t.name}</h4>
                      <p className="micro-text">{t.city} | {t.district}</p>
                    </div>
                    {t.isActive ? <span className="status-dot online"></span> : <span className="status-dot offline"></span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div className="glass-card mt-3">
              <h3 className="section-title premium-font">Categories</h3>
              <div className="category-badges">
                {Array.from(new Set(movies.map(m => m.language))).map(l => (
                  <span key={l} className="badge-pill">{l}</span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style jsx>{`
        .header-flex { display: flex; align-items: center; gap: 1.5rem; }
        .admin-icon-wrapper { 
          background: rgba(212, 175, 55, 0.1); 
          padding: 0.8rem; border-radius: 12px; 
          border: 1px solid rgba(212, 175, 55, 0.2); 
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.1);
        }
        .admin-svg { filter: drop-shadow(0 0 5px rgba(212, 175, 55, 0.3)); }

        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 3rem; }
        .stat-card { padding: 1.5rem; text-align: center; }
        .stat-label { display: block; font-size: 0.75rem; text-transform: uppercase; color: var(--text-muted); font-weight: 800; }
        .stat-value { font-size: 1.8rem; font-weight: 900; }

        .admin-grid { display: grid; grid-template-columns: 1fr 340px; gap: 2rem; }
        .modern-form { display: flex; flex-direction: column; gap: 1.2rem; padding: 1rem; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .input-group label { display: block; font-size: 0.8rem; color: var(--text-muted); font-weight: 700; margin-bottom: 5px; }
        .input-group input, .input-group textarea, .input-group select {
           width: 100%; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--glass-border);
           padding: 0.75rem; border-radius: 8px; color: var(--white);
           transition: var(--transition-smooth);
           font-family: inherit;
        }
        .input-group select option {
          background: var(--bg-surface);
          color: var(--white);
          padding: 10px;
        }
        .input-group input:focus, .input-group textarea:focus, .input-group select:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--accent-green);
          box-shadow: 0 0 15px rgba(0, 181, 98, 0.2);
        }
        .form-actions { display: flex; gap: 1rem; margin-top: 1rem; }
        .wide { flex: 1; }

        .admin-list-container { max-height: 500px; overflow-y: auto; }
        .admin-list-item { 
          display: flex; justify-content: space-between; align-items: center;
          padding: 1rem; border-bottom: 1px solid var(--glass-border);
          transition: 0.3s;
        }
        .item-main { display: flex; flex-direction: column; gap: 4px; }
        .item-title-row { display: flex; align-items: center; gap: 10px; }
        .movie-name { font-size: 1.05rem; }
        
        .status-badge { font-size: 0.65rem; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; font-weight: 800; }
        .status-badge.active { background: rgba(0, 255, 128, 0.1); color: var(--accent-green); }
        .status-badge.upcoming { background: rgba(255, 165, 0, 0.1); color: #ffa500; }

        .item-actions { display: flex; gap: 8px; }
        .icon-btn { 
          background: rgba(255, 255, 255, 0.05); border: 1px solid var(--glass-border);
          color: var(--white); width: 36px; height: 36px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s;
        }
        .edit-btn:hover { background: rgba(0, 123, 255, 0.2); border-color: #007bff; color: #007bff; }
        .delete-btn:hover { background: rgba(255, 68, 68, 0.2); border-color: #ff4444; color: #ff4444; }

        .badge-gold { background: rgba(212, 175, 55, 0.1); color: var(--accent-gold); padding: 4px 10px; border-radius: 4px; font-weight: 700; }
        
        .status-dot { width: 8px; height: 8px; border-radius: 50%; }
        .status-dot.online { background: var(--accent-green); box-shadow: 0 0 10px var(--accent-green); }
        .status-dot.offline { background: var(--danger); }
        
        .small-title { font-size: 0.95rem; margin: 0; }
        .micro-text { font-size: 0.75rem; color: var(--text-muted); margin: 2px 0 0; }
        .mt-3 { margin-top: 2rem; }
        .category-badges { display: flex; flex-wrap: wrap; gap: 8px; }

        @media (max-width: 1024px) { .admin-grid { grid-template-columns: 1fr; } .stats-grid { grid-template-columns: 1fr 1fr; } }
      `}</style>
    </Layout>
  );
}
