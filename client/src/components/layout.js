import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCurrentUser, logoutUser } from "../utils/auth";
import { useTheme } from "../context/ThemeContext";

export default function Layout({ children }) {
  const { theme, toggleTheme } = useTheme();
  const user = getCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      setScrollProgress((winScroll / height) * 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }}></div>
      <header className={`top-nav glass-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <Link className="brand premium-font" to="/">
            <span className="brand-logo" style={{ color: 'var(--accent-gold)' }}>●</span>
            Cinema<span className="accent-text" style={{ color: 'var(--white)', fontWeight: '800' }}> Spot</span>
          </Link>
          
          <nav className="top-nav-links">
            <Link className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} to="/">
              Movies
            </Link>
            <Link className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`} to="/about">
              About
            </Link>
            <Link className={`nav-link ${location.pathname === '/contact' ? 'active' : ''}`} to="/contact">
              Support
            </Link>
          </nav>

            <button 
              className="theme-toggle-btn" 
              onClick={toggleTheme} 
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            {user?.role === "admin" && (
              <Link className="link-btn admin-badge" to="/admin">Admin</Link>
            )}
            {user?.role === "owner" && (
              <Link className="link-btn owner-badge" to="/owner">Theater Panel</Link>
            )}
            {!user ? (
              <div className="auth-btns">
                <Link className="nav-link login-text" to="/login">Login</Link>
                <Link className="primary-pill-btn" to="/register">Explore</Link>
              </div>
            ) : (
              <div className="user-profile-nav">
                <span className="user-id">{user.userId}</span>
                <button className="logout-icon-btn" title="Logout" onClick={handleLogout}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                </button>
              </div>
            )}
          </div>
      </header>

      <main className="app-shell-inner animate-fade">
        {children}
      </main>

      <footer className="footer-glass">
        <div className="container footer-content">
          <p>© 2026 Cinema Spot. All rights reserved.</p>
          <div className="footer-links">
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#cookies">Cookies</a>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .scroll-progress-bar {
          position: fixed; top: 0; left: 0; height: 3px;
          background: linear-gradient(to right, var(--accent-gold), var(--accent-cyan));
          z-index: 2000; transition: width 0.1s ease-out;
          box-shadow: 0 0 10px var(--accent-cyan);
        }
        .nav-container {
          max-width: 1400px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 5%; height: 80px; transition: height 0.4s ease;
        }
        .top-nav.scrolled .nav-container { height: 65px; }
        
        .brand {
          font-size: 1.5rem; font-weight: 800; display: flex; align-items: center;
          gap: 10px; color: var(--white); text-decoration: none; transition: font-size 0.4s ease;
        }
        .top-nav.scrolled .brand { font-size: 1.25rem; }
        .brand-logo { color: var(--accent-gold); font-size: 1.8rem; }
        .accent-text { color: var(--accent-cyan); font-weight: 300; margin-left: 2px; }
        
        .glass-nav {
          position: sticky; top: 0; z-index: 1000;
          background: rgba(10, 25, 47, 0.85); backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--glass-border); transition: all 0.4s ease;
        }
        .top-nav.scrolled { background: rgba(10, 25, 47, 0.95); box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4); }
        
        .nav-link {
          color: var(--text-secondary); text-decoration: none; font-weight: 500;
          font-size: 0.95rem; margin: 0 1.5rem; transition: var(--transition-smooth);
          position: relative;
        }
        .nav-link:hover, .nav-link.active { color: var(--accent-cyan); }
        .nav-link.active::after {
          content: ''; position: absolute; bottom: -8px; left: 0; width: 100%; height: 2px;
          background: var(--accent-cyan); box-shadow: 0 0 10px var(--accent-cyan);
        }
        
        .primary-pill-btn {
          background: var(--accent-green); color: var(--white);
          padding: 0.6rem 2rem; border-radius: 99px; font-weight: 700;
          text-decoration: none; font-size: 0.9rem; transition: var(--transition-smooth);
        }
        .primary-pill-btn:hover { transform: scale(1.05); box-shadow: 0 0 20px rgba(0, 181, 98, 0.4); }
        
        .theme-toggle-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          color: var(--text-primary);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.2rem;
          transition: var(--transition-smooth);
        }
        .theme-toggle-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: rotate(15deg) scale(1.1);
          border-color: var(--accent-cyan);
        }

        .login-text { border: 1px solid var(--glass-border); padding: 0.6rem 1.5rem; border-radius: 99px; }

        .user-profile-nav { display: flex; align-items: center; gap: 1rem; }
        .user-id { color: var(--text-primary); font-weight: 600; font-size: 0.9rem; }
        .logout-icon-btn {
          background: transparent; border: none; color: var(--text-secondary);
          cursor: pointer; transition: color 0.3s; padding: 5px;
        }
        .logout-icon-btn:hover { color: var(--danger); }
        
        .footer-glass {
          padding: 3rem 0; margin-top: 5rem; border-top: 1px solid var(--glass-border);
          background: rgba(2, 12, 27, 0.5);
        }
        .footer-content { display: flex; justify-content: space-between; align-items: center; color: var(--text-muted); font-size: 0.85rem; }
        .footer-links { display: flex; gap: 2rem; }
        .footer-links a { color: var(--text-muted); text-decoration: none; transition: 0.3s; }
        .footer-links a:hover { color: var(--accent-cyan); }
      `}</style>
    </div>
  );
}
