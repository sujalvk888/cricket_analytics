import React, { useState } from 'react';
import { Calendar, MapPin, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BallImg from '../../../assets/Ball.png';
import BatImg from '../../../assets/Bat.png';
import DeleteConfirmationModal from '../../../components/DeleteConfirmationModal/DeleteConfirmationModal';

function SavedInningsCard({ index, match, onDelete }) {
  const navigate = useNavigate();
  
  // Safe extraction
  const team = match.teamName || 'Unknown Team';
  const opponent = match.opponentTeam || 'Unknown Opponent';
  const innings = match.inningsType || '1st Innings';
  const date = match.matchDate || 'N/A';
  const venue = match.venue || 'N/A';
  
  // Calculate final score
  let finalRuns = 0;
  let finalWickets = 0;
  let oversCompleted = 0;

  if (match.overs && match.overs.length > 0) {
    for (let i = 0; i < match.overs.length; i++) {
      const over = match.overs[i];
      if (over.status !== 'locked' && over.cumulativeRuns !== '-' && over.cumulativeRuns !== null) {
        finalRuns = parseInt(over.cumulativeRuns, 10);
        finalWickets = parseInt(over.cumulativeWickets, 10);
        oversCompleted = over.overNumber;
      }
    }
  }

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    setIsDeleteModalOpen(false);
    onDelete(match.id);
  };

  const handleEdit = () => {
    navigate(`/edit-data/${match.id}`);
  };

  return (
    <div className="saved-innings-card">
      <div className="sic-header">
        <div className="sic-title-row">
          <div className="sic-index">{index}</div>
          <h3 className="sic-teams">{team} <span className="vs-text">vs</span> {opponent}</h3>
          <span className="innings-badge">{innings}</span>
        </div>
        <div className="sic-meta-row">
          <span className="meta-item"><Calendar size={12} /> {date}</span>
          <span className="meta-item"><MapPin size={12} /> {venue}</span>
        </div>
      </div>

      <div className="sic-score-area">
        <div className="score-block">
          <div className="score-label">
            <img src={BatImg} alt="Bat" style={{ width: '20px', height: '25px', objectFit: 'contain' }} />
            TOTAL SCORE
          </div>
          <div className="score-value">{finalRuns}/{finalWickets}</div>
          <div className="score-overs">({oversCompleted}.0 Overs)</div>
        </div>
        <div className="score-block wickets-block">
          <div className="score-label">WICKETS</div>
          <div className="wickets-value">
            {finalWickets}
            <img src={BallImg} alt="Ball" style={{ width: '25px', height: '25px', objectFit: 'contain' }} />
          </div>
        </div>
      </div>

      <div className="sic-actions">
        <button className="sic-btn edit-btn" onClick={handleEdit}>
          <Edit2 size={14} /> Edit
        </button>
        <button className="sic-btn delete-btn" onClick={handleDeleteClick}>
          <Trash2 size={14} /> Delete
        </button>
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        message={`Are you sure you want to delete ${team} vs ${opponent} (${innings})?`}
      />
    </div>
  );
}

export default SavedInningsCard;
