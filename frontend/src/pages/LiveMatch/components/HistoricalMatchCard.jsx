import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calendar, MapPin } from 'lucide-react';

function HistoricalMatchCard({ index, matchData, graphType, overRange }) {
  // Extracting data safely
  const title = matchData.isAverage 
    ? "Average Historical Performance" 
    : `${index}. vs ${matchData.opponentTeam}`;
    
  const innings = matchData.inningsType || "N/A";
  const date = matchData.matchDate || "N/A";
  const venue = matchData.venue || "Multiple Venues";

  // Filter overs based on range (e.g. 1 to 5)
  const rangeMax = parseInt(overRange, 10) || 20;
  
  // Format data for chart
  const chartData = [];
  let displayRuns = 0;
  let displayWickets = 0;
  let displayOvers = 0;

  if (matchData.overs && matchData.overs.length > 0) {
    for (let i = 0; i < rangeMax; i++) {
      const over = matchData.overs[i];
      if (over && over.status !== 'locked') {
        const overRuns = over.runs !== null && over.runs !== '-' ? parseInt(over.runs, 10) || 0 : 0;
        const overWickets = over.wickets !== null && over.wickets !== '-' ? parseInt(over.wickets, 10) || 0 : 0;
        
        chartData.push({
          over: over.overNumber,
          runs: overRuns,
          wickets: overWickets
        });
        displayRuns = over.cumulativeRuns !== '-' ? parseInt(over.cumulativeRuns, 10) || 0 : 0;
        displayWickets = over.cumulativeWickets !== '-' ? parseInt(over.cumulativeWickets, 10) || 0 : 0;
        displayOvers = over.overNumber;
      }
    }
  }

  // Calculate CRR for this specific range
  const crr = displayOvers > 0 ? (displayRuns / displayOvers).toFixed(2) : '0.00';
  const isCompleted = displayOvers === 20;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: 'rgba(13, 20, 36, 0.9)', padding: '8px', border: '1px solid #1a2a4c', borderRadius: '4px' }}>
          <p style={{ color: '#00d4ff', margin: 0, fontSize: '12px' }}>Over {label}</p>
          <p style={{ color: 'white', margin: 0, fontSize: '12px' }}>Runs: {payload[0].payload.runs}</p>
          <p style={{ color: 'white', margin: 0, fontSize: '12px' }}>Wickets: {payload[0].payload.wickets}</p>
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    const hasWicket = payload.wickets > 0;
    return (
      <circle cx={cx} cy={cy} r={hasWicket ? 5 : 3} fill={hasWicket ? '#ff3b30' : '#00d4ff'} stroke="none" />
    );
  };

  return (
    <div className="historical-match-card">
      <div className="hmc-header">
        <div className="hmc-title-area">
          <h4>{title}</h4>
          {!matchData.isAverage && <span className="innings-badge">{innings}</span>}
        </div>
        {!matchData.isAverage && (
          <div className="hmc-meta">
            <span><Calendar size={12} /> {date}</span>
            <span><MapPin size={12} /> {venue}</span>
          </div>
        )}
      </div>

      <div className="hmc-body">
        <div className="hmc-graph">
          <ResponsiveContainer width="100%" height={150}>
            {graphType === 'Bar' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="over" tick={{fill: '#8898aa', fontSize: 10}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#8898aa', fontSize: 10}} axisLine={false} tickLine={false} label={{ value: 'Runs', angle: -90, position: 'insideLeft', fill: '#8898aa', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="runs" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.wickets > 0 ? '#ff3b30' : '#007bff'} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="over" tick={{fill: '#8898aa', fontSize: 10}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#8898aa', fontSize: 10}} axisLine={false} tickLine={false} label={{ value: 'Runs', angle: -90, position: 'insideLeft', fill: '#8898aa', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="runs" stroke="#00d4ff" strokeWidth={3} dot={<CustomDot />} activeDot={{r: 6, fill: '#fff'}} />
              </LineChart>
            )}
          </ResponsiveContainer>
          <div className="graph-x-label">Overs</div>
        </div>

        <div className="hmc-stats">
          <div className="hmc-score">
            <span className="big-score">{displayRuns}/{displayWickets}</span>
            <span className="overs-text">({displayOvers}.0 Overs)</span>
          </div>
          <div className="hmc-stat-row">
            <span>Total Runs</span>
            <span>{displayRuns}</span>
          </div>
          <div className="hmc-stat-row">
            <span>Total Wickets</span>
            <span>{displayWickets}</span>
          </div>
          <div className="hmc-stat-row">
            <span>CRR</span>
            <span>{crr}</span>
          </div>
          
          <div className="hmc-status-text">
            {isCompleted ? "This is a completed match" : "Match ended early / Partial"}
          </div>


        </div>
      </div>
    </div>
  );
}

export default HistoricalMatchCard;
