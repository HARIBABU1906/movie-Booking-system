import { useEffect, useState } from "react";
import Layout from "../components/layout";
import { fetchOwnerShows, createTheater, createShow, fetchMovies, fetchAllTheaters } from "../api/movieApi";

export default function OwnerPage() {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theaters, setTheaters] = useState([]);
  const [, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form States
  const [theaterForm, setTheaterForm] = useState({ name: "", location: "", city: "", district: "" });
  const [showForm, setShowForm] = useState({ movieId: "", theaterId: "", showTime: "", baseTicketPrice: 250 });

  const loadData = async () => {
    try {
      setLoading(true);
      const [showsData, moviesData, theatersData] = await Promise.all([
        fetchOwnerShows(),
        fetchMovies(),
        fetchAllTheaters()
      ]);
      setShows(showsData);
      setMovies(moviesData);
      setTheaters(theatersData);
    } catch (apiError) {
      setError("Unable to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTheater = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await createTheater(theaterForm);
      setSuccess("Theater registered successfully!");
      setTheaterForm({ name: "", location: "", city: "", district: "" });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create theater");
    }
  };

  const handleCreateShow = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await createShow(showForm);
      setSuccess("Show added successfully!");
      setShowForm({ movieId: "", theaterId: "", showTime: "", baseTicketPrice: 250 });
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create show");
    }
  };

  return (
    <Layout>
      <div className="container app-shell-inner">
        <header className="page-header animate-entrance">
          <h1 className="page-title premium-font">Owner Dashboard</h1>
          <p className="page-subtitle">Manage your cinemas and show schedules</p>
        </header>

        {error && <div className="message-banner error">{error}</div>}
        {success && <div className="message-banner success">{success}</div>}

        <div className="owner-grid">
          <section className="management-forms stagger-item">
            <div className="glass-card form-card">
              <h3 className="premium-font">Register New Theater</h3>
              <form onSubmit={handleCreateTheater}>
                <input 
                  type="text" placeholder="Theater Name" required 
                  value={theaterForm.name} onChange={e => setTheaterForm({...theaterForm, name: e.target.value})} 
                />
                <input 
                  type="text" placeholder="City" required 
                  value={theaterForm.city} onChange={e => setTheaterForm({...theaterForm, city: e.target.value})} 
                />
                <input 
                  type="text" placeholder="District" 
                  value={theaterForm.district} onChange={e => setTheaterForm({...theaterForm, district: e.target.value})} 
                />
                <input 
                   type="text" placeholder="Location URL or Address" 
                   value={theaterForm.location} onChange={e => setTheaterForm({...theaterForm, location: e.target.value})} 
                />
                <button className="primary-btn" type="submit">Add Theater</button>
              </form>
            </div>

            <div className="glass-card form-card">
              <h3 className="premium-font">Add New Show</h3>
              <form onSubmit={handleCreateShow}>
                <select 
                  required value={showForm.movieId} 
                  onChange={e => setShowForm({...showForm, movieId: e.target.value})}
                >
                  <option value="">Select Movie</option>
                  {movies.map(m => <option key={m.id || m._id} value={m.id || m._id}>{m.name}</option>)}
                </select>

                <select 
                  required value={showForm.theaterId} 
                  onChange={e => setShowForm({...showForm, theaterId: e.target.value})}
                >
                  <option value="">Select Theater</option>
                  {theaters.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>

                <input 
                  type="datetime-local" required 
                  value={showForm.showTime} onChange={e => setShowForm({...showForm, showTime: e.target.value})} 
                />
                
                <input 
                  type="number" placeholder="Base Price (₹)" required 
                  value={showForm.baseTicketPrice} onChange={e => setShowForm({...showForm, baseTicketPrice: e.target.value})} 
                />
                
                <button className="primary-btn" type="submit">Publish Show</button>
              </form>
            </div>
          </section>

          <section className="current-data stagger-item">
            <div className="glass-card list-card">
              <h3 className="premium-font">Active Shows</h3>
              <div className="shows-list">
                {shows.length === 0 ? (
                  <p className="empty-text">No shows published yet.</p>
                ) : (
                  shows.map((show, idx) => (
                    <article key={idx} className="owner-show-item">
                      <div className="show-info">
                        <strong>{show.movieId?.name || show.movie_name}</strong>
                        <span>{show.theaterId?.name || show.theater_name}</span>
                      </div>
                      <div className="show-meta">
                        <span className="time-pill">{new Date(show.showTime || show.show_time).toLocaleString()}</span>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      <style jsx>{`
        .owner-grid { display: grid; grid-template-columns: 400px 1fr; gap: 3rem; margin-top: 3rem; }
        .management-forms { display: flex; flex-direction: column; gap: 2rem; }
        .form-card { padding: 2rem; }
        .form-card h3 { margin-bottom: 1.5rem; color: var(--accent-cyan); }
        
        form { display: flex; flex-direction: column; gap: 1rem; }
        input, select {
          width: 100%; padding: 0.8rem 1rem; background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border); border-radius: 8px; color: var(--white);
        }
        input:focus { border-color: var(--accent-cyan); outline: none; }
        
        .message-banner { padding: 1rem; border-radius: 8px; margin-bottom: 2rem; font-weight: 600; text-align: center; }
        .message-banner.error { background: rgba(255, 77, 77, 0.1); color: var(--danger); border: 1px solid var(--danger); }
        .message-banner.success { background: rgba(0, 181, 98, 0.1); color: var(--accent-green); border: 1px solid var(--accent-green); }

        .list-card { padding: 2rem; min-height: 400px; }
        .shows-list { display: flex; flex-direction: column; gap: 1rem; margin-top: 1.5rem; }
        .owner-show-item {
          display: flex; justify-content: space-between; align-items: center;
          padding: 1.2rem; background: rgba(255, 255, 255, 0.03); 
          border-radius: 12px; border: 1px solid var(--glass-border);
        }
        .show-info { display: flex; flex-direction: column; gap: 4px; }
        .show-info strong { color: var(--white); font-size: 1.1rem; }
        .show-info span { color: var(--text-muted); font-size: 0.9rem; }
        .time-pill { 
          background: rgba(100, 255, 218, 0.1); color: var(--accent-cyan);
          padding: 6px 12px; border-radius: 50px; font-size: 0.8rem; font-weight: 700;
        }
        .empty-text { color: var(--text-muted); font-style: italic; }

        @media (max-width: 900px) {
          .owner-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </Layout>
  );
}

