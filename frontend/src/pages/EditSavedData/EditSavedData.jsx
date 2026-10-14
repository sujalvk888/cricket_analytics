import React, { useState, useEffect, useMemo } from 'react';
import './EditSavedData.css';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, Shield, MapPin, Calendar as CalendarIcon, Save, X, Trash2, Info } from 'lucide-react';
import BatImg from '../../assets/Bat.png';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal/DeleteConfirmationModal';

function EditSavedData() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [matchInfo, setMatchInfo] = useState({
    teamName: '',
    inningsType: '1st Innings',
    opponentTeam: '',
    venue: '',
    matchDate: ''
  });

  const [oversData, setOversData] = useState(() => 
    Array.from({ length: 20 }, (_, i) => ({
      overNumber: i + 1,
      runs: '',
      wickets: ''
    }))
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    // Fetch data for the specific ID
    fetch(`http://localhost:5000/api/innings/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert('Failed to load match: ' + data.error);
          navigate('/all-data');
          return;
        }
        
        setMatchInfo({
          teamName: data.teamName || '',
          inningsType: data.inningsType || '1st Innings',
          opponentTeam: data.opponentTeam || '',
          venue: data.venue || '',
          matchDate: data.matchDate || ''
        });

        const newOversData = Array.from({ length: 20 }, (_, i) => {
          const existingOver = data.overs ? data.overs.find(o => o.overNumber === i + 1) : null;
          return {
            overNumber: i + 1,
            runs: existingOver && existingOver.runs !== null ? String(existingOver.runs) : '',
            wickets: existingOver && existingOver.wickets !== null ? String(existingOver.wickets) : ''
          };
        });

        setOversData(newOversData);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        alert('Error fetching data');
        navigate('/all-data');
      });
  }, [id, navigate]);

  const handleMatchInfoChange = (field, value) => setMatchInfo(prev => ({ ...prev, [field]: value }));

  const handleOverChange = (index, field, value) => {
    if (value !== '' && !/^\d+$/.test(value)) return;
    setOversData(prev => {
      const newData = [...prev];
      newData[index] = { ...newData[index], [field]: value };
      return newData;
    });
  };

  const computedOvers = useMemo(() => {
    let currentRuns = 0;
    let currentWickets = 0;
    let isAllOut = false;

    return oversData.map((over) => {
      if (isAllOut) {
        return { ...over, cumulativeRuns: '-', cumulativeWickets: '-', status: 'locked' };
      }

      if (over.runs === '' && over.wickets === '') {
        return { ...over, cumulativeRuns: '-', cumulativeWickets: '-', status: '-' };
      }

      const r = over.runs === '' ? 0 : parseInt(over.runs, 10);
      const w = over.wickets === '' ? 0 : parseInt(over.wickets, 10);

      currentRuns += r;
      currentWickets += w;
      
      let status = '-';
      if (currentWickets >= 10) {
        currentWickets = 10;
        status = 'ALL OUT';
        isAllOut = true;
      }

      return {
        ...over,
        cumulativeRuns: currentRuns,
        cumulativeWickets: currentWickets,
        status
      };
    });
  }, [oversData]);

  // Derive Summary stats
  const validCompletedOvers = computedOvers.filter(o => o.cumulativeRuns !== '-' && o.status !== 'locked');
  const oversCompleted = validCompletedOvers.length;
  const lastValidOver = validCompletedOvers[oversCompleted - 1];
  
  const finalScore = lastValidOver ? lastValidOver.cumulativeRuns : 0;
  const finalWickets = lastValidOver ? lastValidOver.cumulativeWickets : 0;
  
  const currentRunRate = oversCompleted > 0 ? (finalScore / oversCompleted).toFixed(2) : '-';
  
  let matchStatus = '-';
  if (lastValidOver) {
    if (lastValidOver.status === 'ALL OUT') matchStatus = 'All Out';
    else if (oversCompleted === 20) matchStatus = 'Completed';
    else matchStatus = 'In Progress';
  }

  const handleUpdate = async () => {
    if (!matchInfo.teamName || !matchInfo.opponentTeam || !matchInfo.venue) {
      alert("Please ensure Team, Opponent, and Venue are filled.");
      return;
    }

    setIsUpdating(true);
    try {
      const payload = {
        matchInfo,
        oversData: computedOvers.map(o => ({
          ...o,
          runs: o.runs === '' ? null : o.runs,
          wickets: o.wickets === '' ? null : o.wickets,
          cumulativeRuns: o.cumulativeRuns === '-' ? null : o.cumulativeRuns,
          cumulativeWickets: o.cumulativeWickets === '-' ? null : o.cumulativeWickets,
        }))
      };

      const res = await fetch(`http://localhost:5000/api/innings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        navigate('/all-data');
      } else {
        alert("Failed to update: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error saving data");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleteModalOpen(false);
    try {
      const res = await fetch(`http://localhost:5000/api/innings/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        navigate('/all-data');
      } else {
        alert("Failed to delete record.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting record.");
    }
  };

  if (isLoading) return <div className="edit-data-page" style={{justifyContent: 'center', alignItems: 'center', color: 'white'}}>Loading...</div>;

  return (
    <div className="edit-data-page">
      {/* Title Area */}
      <div className="edit-header-area">
        <button className="btn-back" onClick={() => navigate('/all-data')}>
          <ArrowLeft size={16} /> Back to All Data
        </button>
        
        <div className="edit-title-content">
          <div className="edit-title-icon">
            <Edit3 size={24} />
          </div>
          <div className="edit-title-text">
            <h2>EDIT SAVED MATCH DATA</h2>
            <p>Update the innings data below. All cumulative values will be recalculated automatically.</p>
          </div>
        </div>
      </div>

      {/* Top Match Info Panel */}
      <div className="edit-info-panel">
        <div className="form-group">
          <label>Team Name</label>
          <div className="input-wrapper">
            <Shield className="input-icon purple-icon" size={14} />
            <input type="text" value={matchInfo.teamName} onChange={e => handleMatchInfoChange('teamName', e.target.value)} />
          </div>
        </div>
        
        <div className="form-group">
          <label>Innings</label>
          <div className="innings-toggle">
            <button className={matchInfo.inningsType === '1st Innings' ? 'active' : ''} onClick={() => handleMatchInfoChange('inningsType', '1st Innings')}>1st Innings</button>
            <button className={matchInfo.inningsType === '2nd Innings' ? 'active' : ''} onClick={() => handleMatchInfoChange('inningsType', '2nd Innings')}>2nd Innings</button>
          </div>
        </div>

        <div className="form-group">
          <label>Opponent Team</label>
          <div className="input-wrapper">
            <Shield className="input-icon green-icon" size={14} />
            <input type="text" value={matchInfo.opponentTeam} onChange={e => handleMatchInfoChange('opponentTeam', e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label>Venue</label>
          <div className="input-wrapper">
            <MapPin className="input-icon purple-icon" size={14} />
            <input type="text" value={matchInfo.venue} onChange={e => handleMatchInfoChange('venue', e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label>Match Date</label>
          <div className="input-wrapper">
            <CalendarIcon className="input-icon blue-icon" size={14} />
            <input type="date" value={matchInfo.matchDate} onChange={e => handleMatchInfoChange('matchDate', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Match Summary Bar */}
      <div className="edit-summary-bar">
        <div className="edit-summary-block main-score-block">
          <div className="esb-icon"><img src={BatImg} alt="Bat" style={{ width: '20px', height: '25px', objectFit: 'contain' }} /></div>
          <div className="esb-data">
            <span className="esb-label">Total Score</span>
            <span className="esb-val">{finalScore}/{finalWickets} <span className="esb-overs">({oversCompleted}.0 Overs)</span></span>
          </div>
        </div>

        <div className="edit-summary-block">
          <div className="esb-icon"><div className="cricket-ball"></div></div>
          <div className="esb-data">
            <span className="esb-label">Total Wickets</span>
            <span className="esb-val wickets-val">{finalWickets} <div className="cricket-ball small"></div></span>
          </div>
        </div>

        <div className="edit-summary-block">
          <div className="esb-icon"><div className="chart-icon"></div></div>
          <div className="esb-data">
            <span className="esb-label">Current Run Rate</span>
            <span className="esb-val">{currentRunRate}</span>
          </div>
        </div>

        <div className="edit-summary-block">
          <div className="esb-icon"><RefreshCw size={24} color="var(--accent-blue)" /></div>
          <div className="esb-data">
            <span className="esb-label">Overs Completed</span>
            <span className="esb-val">{oversCompleted}.0</span>
          </div>
        </div>

        <div className="edit-summary-block status-block">
          <div className="esb-data">
            <span className="esb-label">Status</span>
            <span className={`esb-status-badge ${matchStatus.toLowerCase().replace(' ', '-')}`}>{matchStatus}</span>
          </div>
        </div>
      </div>

      {/* Editable Table Panel */}
      <div className="edit-table-panel">
        <div className="panel-header">
          <h3>OVER BY OVER DATA <span style={{color: 'var(--text-secondary)', fontWeight: 400}}>(Editable)</span></h3>
          <div className="info-label">
            <Info size={14} /> Cumulative values are recalculated automatically when you edit Runs or Wickets.
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Over</th>
                <th>Runs (This Over)</th>
                <th>Wickets (This Over)</th>
                <th>Cumulative Runs</th>
                <th>Cumulative Wickets</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {computedOvers.map((over, index) => {
                const isLocked = over.status === 'locked';
                const isAllOutRow = over.status === 'ALL OUT';
                const isFinalRow = over.status === '-' && index === 19 && !isLocked && oversCompleted === 20;

                return (
                  <tr key={index} className={isLocked ? 'locked-row' : ''}>
                    <td>{over.overNumber}</td>
                    <td>
                      <div className="number-input">
                        <input type="text" value={isLocked ? '-' : oversData[index].runs} onChange={e => handleOverChange(index, 'runs', e.target.value)} disabled={isLocked} placeholder={isLocked ? "" : "0"} />
                      </div>
                    </td>
                    <td>
                      <div className="number-input">
                        <input type="text" value={isLocked ? '-' : oversData[index].wickets} onChange={e => handleOverChange(index, 'wickets', e.target.value)} disabled={isLocked} placeholder={isLocked ? "" : "0"} />
                      </div>
                    </td>
                    <td className="cumulative-runs">{over.cumulativeRuns}</td>
                    <td className="cumulative-wickets">{over.cumulativeWickets}</td>
                    <td>
                      {isAllOutRow ? (
                        <span className="badge-all-out">ALL Out</span>
                      ) : isLocked ? (
                        <span className="badge-locked">-</span>
                      ) : isFinalRow ? (
                        <span className="badge-completed">Completed</span>
                      ) : over.status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="panel-footer">
          <div className="bottom-info">
            <Info size={14} /> Once 10 wickets fall, remaining overs are locked and marked as N / A.
          </div>
          <div className="action-buttons-edit">
            <button className="btn-edit-action btn-delete" onClick={handleDeleteClick}>
              <Trash2 size={16} /> Delete Match Data
            </button>
            <button className="btn-edit-action btn-cancel" onClick={() => navigate('/all-data')}>
              <X size={16} /> Cancel Changes
            </button>
            <button className="btn-edit-action btn-update" onClick={handleUpdate} disabled={isUpdating}>
              <Save size={16} /> {isUpdating ? 'Updating...' : 'Update Match Data'}
            </button>
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        message="Are you sure you want to permanently delete this match?"
      />
    </div>
  );
}

// Temporary custom icons to match the design style
const RefreshCw = ({size, color}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>;

export default EditSavedData;
