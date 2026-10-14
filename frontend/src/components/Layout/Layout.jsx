import React, { useState, useEffect } from 'react';
import './Layout.css';
import logoImg from '../../assets/Logo.png';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  Database, 
  ClipboardEdit, 
  LineChart, 
  TrendingUp, 
  Trophy, 
  Calendar,
  Home
} from 'lucide-react';

function Layout() {
  const location = useLocation();
  const hideFooter = location.pathname === '/data-entry' || location.pathname === '/live-match' || location.pathname === '/all-data' || location.pathname.startsWith('/edit-data');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentDateTime.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const formattedTime = currentDateTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="header">
        <div className="brand">
          <div className="brand-icon">
            <img src={logoImg} alt="Cricket Analytics Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div className="brand-text">
            <h1>CRICKET ANALYTICS</h1>
            <p>Data Driven. Performance Driven.</p>
          </div>
        </div>
        
        {/* Center Navigation */}
        <nav className="center-nav">
          <NavLink to="/" className={({isActive}) => isActive ? "nav-item active" : "nav-item"} end>
            <Home size={18} /> Home
          </NavLink>
          <NavLink to="/data-entry" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <ClipboardEdit size={18} /> Data Entry
          </NavLink>
          <NavLink to="/live-match" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <LineChart size={18} /> Live Match
          </NavLink>
          <NavLink to="/all-data" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
            <Database size={18} /> All Data Saved
          </NavLink>
        </nav>

      </header>

      {/* Main Content Area */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Footer */}
      {!hideFooter && (
        <footer className="footer">
          <div className="footer-left">
            <div className="footer-icon-container">
              <TrendingUp size={24} />
            </div>
            <div className="footer-text">
              <h4>Analyze. Compare. Improve.</h4>
              <p>Your cricket. Your data. Your advantage.</p>
            </div>
          </div>

          <div className="footer-center">
            <div className="footer-line"></div>
            <div className="trophy-icon-container">
              <Trophy size={18} />
            </div>
            <div className="footer-line"></div>
          </div>

          <div className="footer-right">
            <div className="calendar-icon-container">
              <Calendar size={20} />
            </div>
            <div className="footer-date">
              <p>{formattedDate} | {formattedTime}</p>
              <span>Version 1.0.0</span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default Layout;
