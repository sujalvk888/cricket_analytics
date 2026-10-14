import React, { useState, useMemo, useEffect } from 'react';
import './DataEntry.css';
import { 
  ClipboardEdit, 
  Info, 
  Trash2, 
  Save, 
  Calendar as CalendarIcon, 
  MapPin, 
  Shield 
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

function DataEntry() {
  const [matchInfo, setMatchInfo] = useState({
    teamName: '',
    inningsType: '1st Innings',
    opponentTeam: '',
    venue: '',
    matchDate: '2025-05-21'
  });

  const [oversData, setOversData] = useState(() => 
    Array.from({ length: 20 }, (_, i) => ({
      overNumber: i + 1,
      runs: '',
      wickets: ''
    }))
  );

  const [metadata, setMetadata] = useState({ teams: [], venues: [] });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/metadata')
      .then(res => res.json())
      .then(data => {
        if (data.teams && data.venues) {
          setMetadata(data);
        }
      })
      .catch(err => console.error("Failed to load metadata", err));
  }, []);

  // Compute cumulative values and ALL OUT logic on the fly
  const computedOvers = useMemo(() => {
    let currentRuns = 0;
    let currentWickets = 0;
    let isAllOut = false;

    return oversData.map((over) => {
      // If already all out, lock the row
      if (isAllOut) {
        return {
          ...over,
          runs: '',
          wickets: '',
          cumulativeRuns: '-',
          cumulativeWickets: '-',
          status: 'locked'
        };
      }

      const r = over.runs === '' ? 0 : parseInt(over.runs, 10);
      const w = over.wickets === '' ? 0 : parseInt(over.wickets, 10);

      currentRuns += r;
      currentWickets += w;
      
      let status = `${currentRuns}/${currentWickets}`;
      if (currentWickets >= 10) {
        currentWickets = 10; // Cap at 10 just in case
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

  const handleMatchInfoChange = (field, value) => {
    setMatchInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleOverChange = (index, field, value) => {
    // Only allow numbers
    if (value !== '' && !/^\d+$/.test(value)) return;
    
    setOversData(prev => {
      const newData = [...prev];
      newData[index] = { ...newData[index], [field]: value };
      return newData;
    });
  };

  const handleClearData = () => {
    setOversData(Array.from({ length: 20 }, (_, i) => ({
      overNumber: i + 1,
      runs: '',
      wickets: ''
    })));
    setSaveSuccess(false);
  };

  const handleSaveData = async () => {
    if (!matchInfo.teamName || !matchInfo.opponentTeam || !matchInfo.venue) {
      alert("Please enter Team, Opponent, and Venue names.");
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const response = await fetch('http://localhost:5000/api/innings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchInfo,
          oversData: computedOvers
        })
      });

      const data = await response.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        // Refresh metadata so newly typed teams are available in datalist
        fetch('http://localhost:5000/api/metadata')
          .then(res => res.json())
          .then(data => {
            if (data.teams && data.venues) setMetadata(data);
          });
      } else {
        alert("Failed to save data: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to the server.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="data-entry-page">
      <datalist id="teams-list">
        {metadata.teams.map((t, idx) => <option key={idx} value={t} />)}
      </datalist>
      <datalist id="venues-list">
        {metadata.venues.map((v, idx) => <option key={idx} value={v} />)}
      </datalist>

      {/* Page Title Area */}
      <div className="page-title-area">
        <div className="title-left">
          <div className="title-icon">
            <ClipboardEdit size={24} />
          </div>
          <div className="title-text">
            <h2>DATA ENTRY</h2>
            <p>Enter historical match data over by over.</p>
          </div>
        </div>
        <div className="title-right">
          {/* Decorative graphic would go here, maybe an SVG or CSS background */}
          <div className="decorative-batsman"></div>
        </div>
      </div>

      {/* Match Information Panel */}
      <div className="match-info-panel">
        <div className="form-group">
          <label>Team Name</label>
          <div className="input-wrapper">
            <Shield className="input-icon purple-icon" size={16} />
            <input 
              type="text"
              list="teams-list"
              placeholder="Enter Team"
              value={matchInfo.teamName}
              onChange={(e) => handleMatchInfoChange('teamName', e.target.value)}
            />
          </div>
        </div>

        <div className="form-separator"></div>

        <div className="form-group">
          <label>Innings</label>
          <div className="innings-toggle">
            <button 
              className={matchInfo.inningsType === '1st Innings' ? 'active' : ''}
              onClick={() => handleMatchInfoChange('inningsType', '1st Innings')}
            >
              1st Innings
            </button>
            <button 
              className={matchInfo.inningsType === '2nd Innings' ? 'active' : ''}
              onClick={() => handleMatchInfoChange('inningsType', '2nd Innings')}
            >
              2nd Innings
            </button>
          </div>
        </div>

        <div className="form-separator"></div>

        <div className="form-group">
          <label>Opponent Team</label>
          <div className="input-wrapper">
            <Shield className="input-icon green-icon" size={16} />
            <input 
              type="text"
              list="teams-list"
              placeholder="Enter Opponent"
              value={matchInfo.opponentTeam}
              onChange={(e) => handleMatchInfoChange('opponentTeam', e.target.value)}
            />
          </div>
        </div>

        <div className="form-separator"></div>

        <div className="form-group">
          <label>Venue</label>
          <div className="input-wrapper">
            <MapPin className="input-icon purple-icon" size={16} />
            <input 
              type="text"
              list="venues-list"
              placeholder="Enter Venue"
              value={matchInfo.venue}
              onChange={(e) => handleMatchInfoChange('venue', e.target.value)}
            />
          </div>
        </div>

        <div className="form-separator"></div>

        <div className="form-group">
          <label>Match Date</label>
          <div className="input-wrapper">
            <CalendarIcon className="input-icon blue-icon" size={16} />
            <input 
              type="date" 
              value={matchInfo.matchDate}
              onChange={(e) => handleMatchInfoChange('matchDate', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Over-by-Over Data Entry Panel */}
      <div className="data-table-panel">
        <div className="panel-header">
          <h3>OVER BY OVER DATA ENTRY</h3>
          <div className="info-label">
            <Info size={14} /> Cumulative values are calculated automatically
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
                return (
                  <tr key={index} className={isLocked ? 'locked-row' : ''}>
                    <td>{over.overNumber}</td>
                    <td>
                      <div className="number-input">
                        <input 
                          type="text" 
                          value={isLocked ? '-' : oversData[index].runs} 
                          onChange={(e) => handleOverChange(index, 'runs', e.target.value)}
                          disabled={isLocked}
                          placeholder={isLocked ? "" : "0"}
                        />
                      </div>
                    </td>
                    <td>
                      <div className="number-input">
                        <input 
                          type="text" 
                          value={isLocked ? '-' : oversData[index].wickets} 
                          onChange={(e) => handleOverChange(index, 'wickets', e.target.value)}
                          disabled={isLocked}
                          placeholder={isLocked ? "" : "0"}
                        />
                      </div>
                    </td>
                    <td className="cumulative-runs">{over.cumulativeRuns}</td>
                    <td className="cumulative-wickets">{over.cumulativeWickets}</td>
                    <td>
                      {over.status === 'ALL OUT' ? (
                        <span className="badge-all-out">ALL OUT</span>
                      ) : over.status === 'locked' ? (
                        <span className="badge-locked">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                          N/A
                        </span>
                      ) : (
                        over.status
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="panel-footer">
          <div className="bottom-info">
            <Info size={16} /> The Status column displays Runs/Wickets. Once 10 wickets fall, remaining overs are automatically locked and marked as N/A.
          </div>
          <div className="action-buttons">
            {saveSuccess && <span className="success-msg">Data saved successfully!</span>}
            <button className="btn-clear" onClick={handleClearData}>
              <Trash2 size={16} /> Clear Data
            </button>
            <button className="btn-save" onClick={handleSaveData} disabled={isSaving}>
              <Save size={16} /> {isSaving ? 'Saving...' : 'Save Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataEntry;
