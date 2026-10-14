import React from 'react';
import './Home.css';
import { ClipboardEdit, LineChart, FolderSearch, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ballImg from '../../assets/Ball.png';

function Home() {
  const navigate = useNavigate();

  return (
    <>
      <div className="welcome-section">
        <h2>Welcome to <span>Cricket Analytics</span></h2>
        <div className="decorative-divider">
          <div className="divider-line blue"></div>
          <div className="ball-icon-svg" style={{width: 30, height: 30}}>
            <img src={ballImg} alt="Cricket Ball" style={{width: '100%', height: '100%', objectFit: 'contain'}} />
          </div>
          <div className="divider-line purple"></div>
        </div>
        <p>Enter, analyze and compare cricket match data with powerful insights.</p>
      </div>

      <div className="cards-container">
        {/* Card 1 - Data Entry */}
        <div className="nav-card card-blue" onClick={() => navigate('/data-entry')}>
          <div className="card-icon-container">
            <ClipboardEdit className="card-icon" />
          </div>
          <h3>Data Entry</h3>
          <p>Enter new match data including overs, runs, wickets and more.</p>
          <button className="nav-button">
            Enter Data <ArrowRight size={18} />
          </button>
        </div>

        {/* Card 2 - Live Match Interaction */}
        <div className="nav-card card-green">
          <div className="card-icon-container">
            <LineChart className="card-icon" />
          </div>
          <h3>Live Match Interaction</h3>
          <p>Enter live match data and explore historical insights with interactive graphs and comparisons.</p>
          <button className="nav-button">
            Go to Live Dashboard <ArrowRight size={18} />
          </button>
        </div>

        {/* Card 3 - All Data Saved */}
        <div className="nav-card card-purple">
          <div className="card-icon-container">
            <FolderSearch className="card-icon" />
          </div>
          <h3>All Data Saved</h3>
          <p>View, search, filter, edit or delete all saved match entries.</p>
          <button className="nav-button">
            View All Data <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </>
  );
}

export default Home;
