import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/layout";
import { login } from "../api/movieApi";
import { setAuthSession } from "../utils/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Get the redirect path from state
  const from = location.state?.from || "/";
  const message = location.state?.message;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login({ userId, password });
      setAuthSession(data);

      if (data.user.role === "admin") {
        navigate("/admin");
      } else if (data.user.role === "owner") {
        navigate("/owner");
      } else {
        navigate(from, { state: location.state });
      }
    } catch (apiError) {
      setError(apiError?.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container app-shell-inner flex-center">
        <div className="auth-card glass-card">
          <header className="auth-header">
            <h2 className="premium-font">Welcome Back</h2>
            {message ? (
              <p className="premium-message accent-text">{message}</p>
            ) : (
              <p className="page-subtitle">Sign in to your premium movie experience</p>
            )}
          </header>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label>User ID / Email</label>
              <input
                type="text"
                placeholder="Enter your ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="error-text auth-error">{error}</p>}

            <button className="primary-btn auth-btn" type="submit" disabled={loading}>
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <footer className="auth-footer">
            <p>New to Antigravity Cinema?</p>
            <Link to="/register" state={location.state} className="accent-text">Create an Account</Link>
          </footer>
        </div>
      </div>

      <style jsx>{`
        .flex-center {
          display: flex; align-items: center; justify-content: center; min-height: 85vh;
          padding: 2rem;
        }
        .auth-card {
          width: 100%; max-width: 480px; padding: 3.5rem;
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
