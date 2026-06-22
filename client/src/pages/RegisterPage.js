import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/layout";
import { register } from "../api/movieApi";

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const data = await register({ name, userId, password });
      setSuccess(data.message || "Registration successful! Redirecting...");
      setTimeout(() => navigate("/login", { state: location.state }), 1500);
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container app-shell-inner flex-center">
        <div className="auth-card glass-card">
          <header className="auth-header">
            <h2 className="premium-font">Start Your Journey</h2>
            <p className="page-subtitle">Join the elite cinema community today</p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Email / User ID</label>
              <input
                type="text"
                placeholder="john@example.com"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Secure Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            {error && <p className="error-text auth-error">{error}</p>}
            {success && <p className="success-text auth-success">{success}</p>}

            <button className="primary-btn auth-btn" type="submit" disabled={loading}>
              {loading ? "Creating Profile..." : "Create Account"}
            </button>
          </form>

          <footer className="auth-footer">
            <p>Already a member?</p>
            <Link to="/login" state={location.state} className="accent-text">Sign In Instead</Link>
          </footer>
        </div>
      </div>

      <style jsx>{`
        .flex-center {
          display: flex; align-items: center; justify-content: center; min-height: 90vh;
          padding: 2rem;
        }
        .auth-card {
          width: 100%; max-width: 500px; padding: 3.5rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          border-radius: 32px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
          animation: fadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .auth-header { text-align: center; margin-bottom: 3rem; }
        .auth-header h2 { font-size: 2.5rem; font-weight: 900; letter-spacing: -1px; margin-bottom: 0.75rem; color: var(--white); }
        .page-subtitle { color: var(--text-secondary); font-size: 1rem; }
        
        .auth-form { display: flex; flex-direction: column; gap: 1.8rem; }
        .input-group label { display: block; margin-bottom: 0.8rem; color: var(--text-secondary); font-weight: 600; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }
        .input-group input { 
          width: 100%; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--glass-border); 
          padding: 1.1rem 1.5rem; border-radius: 16px; color: var(--white); font-size: 1rem; transition: 0.3s;
        }
        .input-group input:focus { outline: none; border-color: var(--accent-green); background: rgba(255, 255, 255, 0.08); }

        .auth-btn { 
          margin-top: 1rem; padding: 1.1rem; width: 100%; font-size: 1.1rem; font-weight: 800;
          background: var(--accent-green); color: var(--white); border: none; border-radius: 99px;
          cursor: pointer; transition: 0.3s; 
        }
        .auth-btn:hover { transform: scale(1.02); box-shadow: 0 0 30px rgba(0, 181, 98, 0.3); }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .auth-error, .auth-success { text-align: center; margin: 0; font-weight: 600; }
        .auth-success { color: var(--accent-green); }

        .auth-footer { 
          margin-top: 3rem; text-align: center; padding-top: 2rem;
          border-top: 1px solid var(--glass-border); font-size: 0.95rem;
        }
        .auth-footer p { color: var(--text-muted); margin-bottom: 10px; }
        .accent-text { color: var(--accent-green); font-weight: 700; text-decoration: none; }
        .accent-text:hover { text-decoration: underline; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </Layout>
  );
}
