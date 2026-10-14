import React, { useState, useEffect, useMemo } from 'react';
import './LiveMatch.css';
import { 
  Activity, 
  RefreshCw, 
  Info, 
  Trash2, 
  Save, 
  Calendar as CalendarIcon, 
  MapPin, 
  Shield, 
  ChevronDown,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import HistoricalMatchCard from './components/HistoricalMatchCard';

function LiveMatch() {
  const [isRightPanelMinimized, setIsRightPanelMinimized] = useState(false);
  const [isMatchInfoMinimized, setIsMatchInfoMinimized] = useState(false);

  // === Right Side: Live Match State ===
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

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // === Left Side: Historical Data State ===
  const [history, setHistory] = useState([]);
  const [metadata, setMetadata] = useState({ teams: [], venues: [] });
  const [activeTab, setActiveTab] = useState('All Historical Data');
  const [overRange, setOverRange] = useState('20');
  const [graphType, setGraphType] = useState('Line');

  // Fetch History and Metadata
  const fetchHistory = () => {
    fetch('http://localhost:5000/api/innings-history')
      .then(res => res.json())
      .then(data => setHistory(data))
      .catch(err => console.error("Failed to load history", err));
    
    fetch('http://localhost:5000/api/metadata')
      .then(res => res.json())
      .then(data => {
        if (data.teams) setMetadata(data);
      })
      .catch(err => console.error("Failed to load metadata", err));
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Compute live cumulative values
  const computedLiveOvers = useMemo(() => {
    let currentRuns = 0;
    let currentWickets = 0;
    let isAllOut = false;

    return oversData.map((over) => {
      if (isAllOut) {
        return { ...over, runs: '', wickets: '', cumulativeRuns: '-', cumulativeWickets: '-', status: 'locked' };
      }

      if (over.runs === '' && over.wickets === '') {
        return { ...over, cumulativeRuns: '-', cumulativeWickets: '-', status: 'Pending' };
      }

      const r = over.runs === '' ? 0 : parseInt(over.runs, 10);
      const w = over.wickets === '' ? 0 : parseInt(over.wickets, 10);

      currentRuns += r;
      currentWickets += w;
      
      let status = `${currentRuns}/${currentWickets}`;
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

  const liveOversCompleted = useMemo(() => {
    return computedLiveOvers.filter(o => o.cumulativeRuns !== '-' && o.status !== 'locked').length;
  }, [computedLiveOvers]);

  const liveCurrentRuns = liveOversCompleted > 0 ? computedLiveOvers[liveOversCompleted - 1].cumulativeRuns : 0;
  const liveCRR = liveOversCompleted > 0 ? (liveCurrentRuns / liveOversCompleted).toFixed(2) : '-';

  const handleMatchInfoChange = (field, value) => setMatchInfo(prev => ({ ...prev, [field]: value }));

  const handleOverChange = (index, field, value) => {
    if (value !== '' && !/^\d+$/.test(value)) return;
    setOversData(prev => {
      const newData = [...prev];
      newData[index] = { ...newData[index], [field]: value };
      return newData;
    });
  };

  const handleClearData = () => {
    setOversData(Array.from({ length: 20 }, (_, i) => ({ overNumber: i + 1, runs: '', wickets: '' })));
    setSaveSuccess(false);
  };

  const handleSaveData = async () => {
    if (!matchInfo.teamName || !matchInfo.opponentTeam || !matchInfo.venue) {
      alert("Please fill in Team, Opponent, and Venue.");
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
          oversData: computedLiveOvers.map(o => ({
            ...o, 
            runs: o.runs === '' ? null : o.runs, 
            wickets: o.wickets === '' ? null : o.wickets,
            cumulativeRuns: o.cumulativeRuns === '-' ? null : o.cumulativeRuns,
            cumulativeWickets: o.cumulativeWickets === '-' ? null : o.cumulativeWickets,
          }))
        })
      });
      const data = await response.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        fetchHistory(); // refresh history
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

  // === Filtering and Matching Logic ===
  
  // 1. Filter strictly by selected Team and Innings
  const baseFilteredHistory = useMemo(() => {
    return history.filter(h => 
      h.teamName === matchInfo.teamName && 
      h.inningsType === matchInfo.inningsType
    );
  }, [history, matchInfo.teamName, matchInfo.inningsType]);

  // 2. Perform live matching
  const matchedHistory = useMemo(() => {
    if (liveOversCompleted === 0) return baseFilteredHistory; // Nothing to match against

    const scoredHistory = baseFilteredHistory.map(h => {
      let error = 0;
      let validComparisons = 0;

      for (let i = 0; i < liveOversCompleted; i++) {
        const liveOver = computedLiveOvers[i];
        const histOver = h.overs[i];

        if (histOver && histOver.cumulativeRuns !== null && histOver.status !== 'locked') {
          const runDiff = (liveOver.cumulativeRuns) - (histOver.cumulativeRuns || 0);
          const wicketDiff = (liveOver.cumulativeWickets) - (histOver.cumulativeWickets || 0);
          // Simple squared error, weigh wickets slightly more
          error += (runDiff * runDiff) + (wicketDiff * wicketDiff * 25);
          validComparisons++;
        }
      }
      
      const avgError = validComparisons > 0 ? (error / validComparisons) : Infinity;
      return { ...h, matchError: avgError };
    });

    // Sort by lowest error, take top matches
    return scoredHistory
      .filter(h => h.matchError !== Infinity)
      .sort((a, b) => a.matchError - b.matchError);
  }, [baseFilteredHistory, computedLiveOvers, liveOversCompleted]);

  // 3. Compute Averages
  const computeAverageData = (dataList) => {
    // Only include innings that completed all 20 overs, or use the logic from prompt:
    // "For this average mode, include only innings that completed all 20 overs."
    const completedMatches = dataList.filter(m => {
      const lastOver = m.overs[19];
      return lastOver && lastOver.status !== 'locked' && lastOver.cumulativeRuns !== null;
    });

    if (completedMatches.length === 0) return null;

    const avgOvers = Array.from({ length: 20 }, (_, i) => {
      let sumRuns = 0;
      let sumWickets = 0;
      let sumCumRuns = 0;
      let sumCumWickets = 0;
      completedMatches.forEach(m => {
        sumRuns += (m.overs[i].runs !== null ? parseInt(m.overs[i].runs, 10) : 0);
        sumWickets += (m.overs[i].wickets !== null ? parseInt(m.overs[i].wickets, 10) : 0);
        sumCumRuns += (m.overs[i].cumulativeRuns || 0);
        sumCumWickets += (m.overs[i].cumulativeWickets || 0);
      });
      return {
        overNumber: i + 1,
        runs: Math.round(sumRuns / completedMatches.length),
        wickets: Math.round(sumWickets / completedMatches.length),
        cumulativeRuns: Math.round(sumCumRuns / completedMatches.length),
        cumulativeWickets: Math.round(sumCumWickets / completedMatches.length),
        status: '-'
      };
    });

    return {
      isAverage: true,
      overs: avgOvers,
      matchCount: completedMatches.length
    };
  };

  let displayData = [];
  if (activeTab === 'All Historical Data') {
    displayData = baseFilteredHistory;
  } else if (activeTab === 'Average Match Data') {
    const avg = computeAverageData(baseFilteredHistory);
    displayData = avg ? [avg] : [];
  } else if (activeTab === 'Live Match Matching') {
    displayData = matchedHistory;
  } else if (activeTab === 'Avg of Matched Data') {
    const avg = computeAverageData(matchedHistory);
    displayData = avg ? [avg] : [];
  }

  return (
    <div className="live-match-page">
      <datalist id="teams-list">
        {metadata.teams.map((t, idx) => <option key={idx} value={t} />)}
      </datalist>
      <datalist id="venues-list">
        {metadata.venues.map((v, idx) => <option key={idx} value={v} />)}
      </datalist>

      {/* === LEFT PANEL: Historical Analytics === */}
      <div className="left-panel">
        <div className="lp-header">
          <div className="lp-title-row">
            <div className="lp-title-icon"><Activity size={20} /></div>
            <div className="lp-title-text">
              <h2>LIVE MATCH INTERACTION DASHBOARD</h2>
              <p>Enter live match data and compare with historical insights in real-time.</p>
            </div>
            <div className="live-indicator"><div className="pulse-dot"></div> LIVE</div>
          </div>
          
          <div className="mode-tabs">
            {['All Historical Data', 'Average Match Data', 'Live Match Matching', 'Avg of Matched Data'].map(tab => (
              <button 
                key={tab} 
                className={activeTab === tab ? 'active' : ''}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="filter-controls">
            <div className="filter-group">
              <label>Over Range</label>
              <select value={overRange} onChange={(e) => setOverRange(e.target.value)}>
                {Array.from({length: 20}, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>1 to {num} Overs</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label>Graph Type</label>
              <div className="toggle-group">
                <button className={graphType === 'Line' ? 'active' : ''} onClick={() => setGraphType('Line')}>Line</button>
                <button className={graphType === 'Bar' ? 'active' : ''} onClick={() => setGraphType('Bar')}>Bar</button>
              </div>
            </div>



            <button className="btn-refresh" onClick={fetchHistory}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>

        <div className="lp-body">
          <div className="historical-matches-header">
            <h3>HISTORICAL MATCHES</h3>
            <span className="match-count">{displayData.length} Matches Found</span>
          </div>
          
          <div className="historical-cards-container">
            {displayData.map((match, idx) => (
              <HistoricalMatchCard 
                key={match.id || idx} 
                index={idx + 1} 
                matchData={match} 
                graphType={graphType} 
                overRange={overRange} 
              />
            ))}
            {displayData.length > 0 && activeTab !== 'Average Match Data' && activeTab !== 'Avg of Matched Data' && (
              <div className="load-more">
                Load More Matches <ChevronDown size={14} />
              </div>
            )}
            {displayData.length === 0 && (
              <div className="no-data-msg">
                No matching historical data found for {matchInfo.teamName || 'this team'} ({matchInfo.inningsType}).
              </div>
            )}
          </div>
        </div>
      </div>

      {/* === RIGHT PANEL: Live Match Entry === */}
      {isRightPanelMinimized ? (
        <div className="right-panel minimized" onClick={() => setIsRightPanelMinimized(false)} title="Expand Panel">
          <div className="minimized-vertical">
            <ChevronLeft size={20} />
            <span>LIVE ENTRY</span>
            <div className="red-dot" style={{ marginTop: 'auto', marginBottom: '20px' }}></div>
          </div>
        </div>
      ) : (
        <div className="right-panel">
          <div className="rp-header">
            <h3><div className="red-dot"></div> LIVE MATCH DATA ENTRY</h3>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div className="auto-calc-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#28a745" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Auto Calculate On
              </div>
              <button 
                className="panel-toggle-btn"
                onClick={() => setIsRightPanelMinimized(true)}
                title="Minimize Panel"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

        {isMatchInfoMinimized ? (
          <div className="rp-match-info-minimized" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderBottom: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              <div className="summary-val-mini">
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginRight: '8px' }}>Current Run Rate:</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{liveCRR}</span>
              </div>
              <div className="summary-val-mini">
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginRight: '8px' }}>Overs Completed:</span>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent-gold)' }}>{liveOversCompleted}.0</span>
              </div>
            </div>
            <button className="panel-toggle-btn" onClick={() => setIsMatchInfoMinimized(false)} title="Expand Match Info" style={{ height: '24px', width: '24px' }}>
              <ChevronDown size={14} />
            </button>
          </div>
        ) : (
          <div className="rp-match-info">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '600' }}>Match Information</span>
              <button className="panel-toggle-btn" onClick={() => setIsMatchInfoMinimized(true)} title="Minimize Match Info" style={{ height: '24px', width: '24px' }}>
                <ChevronDown size={14} style={{ transform: 'rotate(180deg)' }} />
              </button>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Team Name</label>
                <div className="input-wrapper">
                  <Shield className="input-icon purple-icon" size={14} />
                  <input type="text" list="teams-list" placeholder="Select Team" value={matchInfo.teamName} onChange={e => handleMatchInfoChange('teamName', e.target.value)} />
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
                  <input type="text" list="teams-list" placeholder="Select Opponent" value={matchInfo.opponentTeam} onChange={e => handleMatchInfoChange('opponentTeam', e.target.value)} />
                </div>
              </div>
            </div>
            <div className="form-row mt-10">
              <div className="form-group">
                <label>Venue</label>
                <div className="input-wrapper">
                  <MapPin className="input-icon purple-icon" size={14} />
                  <input type="text" list="venues-list" placeholder="Select Venue" value={matchInfo.venue} onChange={e => handleMatchInfoChange('venue', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Match Date</label>
                <div className="input-wrapper">
                  <CalendarIcon className="input-icon blue-icon" size={14} />
                  <input type="date" value={matchInfo.matchDate} onChange={e => handleMatchInfoChange('matchDate', e.target.value)} />
                </div>
              </div>
              <div className="form-group summary-box">
                <label>Current Run Rate</label>
                <div className="summary-val">{liveCRR}</div>
              </div>
              <div className="form-group summary-box">
                <label>Overs Completed</label>
                <div className="summary-val highlight">{liveOversCompleted}.0</div>
              </div>
            </div>
          </div>
        )}

        <div className="rp-table-container">
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
              {computedLiveOvers.map((over, index) => {
                const isLocked = over.status === 'locked';
                const isPending = over.status === 'Pending';
                
                // Prevent gaps: disable if previous over is empty
                const isPreviousEmpty = index > 0 && oversData[index - 1].runs === '' && oversData[index - 1].wickets === '';
                const isInputDisabled = isLocked || isPreviousEmpty;

                return (
                  <tr key={index} className={isLocked || isPending ? 'locked-row' : ''}>
                    <td>{over.overNumber}</td>
                    <td>
                      <div className="number-input">
                        <input type="text" value={isLocked ? '-' : oversData[index].runs} onChange={e => handleOverChange(index, 'runs', e.target.value)} disabled={isInputDisabled} placeholder={isLocked ? "" : "0"} />
                      </div>
                    </td>
                    <td>
                      <div className="number-input">
                        <input type="text" value={isLocked ? '-' : oversData[index].wickets} onChange={e => handleOverChange(index, 'wickets', e.target.value)} disabled={isInputDisabled} placeholder={isLocked ? "" : "0"} />
                      </div>
                    </td>
                    <td className="cumulative-runs">{over.cumulativeRuns}</td>
                    <td className="cumulative-wickets">{over.cumulativeWickets}</td>
                    <td>
                      {over.status === 'ALL OUT' ? (
                        <span className="badge-all-out">ALL Out</span>
                      ) : over.status === 'locked' ? (
                        <span className="badge-locked"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> N/A</span>
                      ) : over.status === 'Pending' ? (
                        <span className="badge-locked"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> Pending</span>
                      ) : over.status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="rp-footer">
          <div className="bottom-info">
            <Info size={14} /> Once 10 wickets fall, remaining overs are locked and marked as N/A.
          </div>
          <div className="action-buttons">
            <button className="btn-clear destructive" onClick={handleClearData}>
              <Trash2 size={14} /> Clear Data
            </button>
            <button className="btn-save success" onClick={handleSaveData} disabled={isSaving}>
              <Save size={14} /> {isSaving ? 'Saving...' : 'Save Data'}
            </button>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LiveMatch;
