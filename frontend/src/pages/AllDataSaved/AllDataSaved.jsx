import React, { useState, useEffect, useMemo } from 'react';
import './AllDataSaved.css';
import { 
  Database, 
  Search, 
  Calendar as CalendarIcon, 
  Filter, 
  RefreshCw,
  SortDesc,
  LayoutGrid,
  List as ListIcon,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  ArrowUpRight
} from 'lucide-react';
import SavedInningsCard from './components/SavedInningsCard';
import { API_BASE_URL } from '../../config/api';

function AllDataSaved() {
  const [allMatches, setAllMatches] = useState([]);
  const [filteredMatches, setFilteredMatches] = useState([]);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [inningsFilter, setInningsFilter] = useState('All Innings');
  const [teamFilter, setTeamFilter] = useState('All Teams');
  const [opponentFilter, setOpponentFilter] = useState('All Opponents');
  
  // View States
  const [sortOrder, setSortOrder] = useState('Newest');
  const [viewMode, setViewMode] = useState('grid');

  // Fetch Data
  const fetchAllData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/innings-history`);
      const data = await res.json();
      setAllMatches(data);
      setFilteredMatches(data); // initially unfiltered
    } catch (err) {
      console.error("Failed to fetch all saved data", err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Dropdown options derived from actual database data
  const uniqueTeams = useMemo(() => {
    const teams = new Set();
    allMatches.forEach(m => {
      if (m.teamName) teams.add(m.teamName);
    });
    return Array.from(teams).sort();
  }, [allMatches]);

  const uniqueOpponents = useMemo(() => {
    const opponents = new Set();
    allMatches.forEach(m => {
      if (m.opponentTeam) opponents.add(m.opponentTeam);
    });
    return Array.from(opponents).sort();
  }, [allMatches]);

  // Apply Filters Logic
  const handleApplyFilters = () => {
    let result = [...allMatches];

    // Text Search
    if (searchTerm.trim() !== '') {
      const query = searchTerm.toLowerCase();
      result = result.filter(m => 
        (m.teamName && m.teamName.toLowerCase().includes(query)) ||
        (m.opponentTeam && m.opponentTeam.toLowerCase().includes(query)) ||
        (m.venue && m.venue.toLowerCase().includes(query))
      );
    }

    // Innings Filter
    if (inningsFilter !== 'All Innings') {
      result = result.filter(m => m.inningsType === inningsFilter);
    }

    // Team Filter
    if (teamFilter !== 'All Teams') {
      result = result.filter(m => m.teamName === teamFilter);
    }

    // Opponent Filter
    if (opponentFilter !== 'All Opponents') {
      result = result.filter(m => m.opponentTeam === opponentFilter);
    }

    setFilteredMatches(result);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setInningsFilter('All Innings');
    setTeamFilter('All Teams');
    setOpponentFilter('All Opponents');
    setFilteredMatches([...allMatches]);
  };

  // Sorting
  const sortedMatches = useMemo(() => {
    const sorted = [...filteredMatches];
    sorted.sort((a, b) => {
      // Assuming matchDate is YYYY-MM-DD
      const dateA = new Date(a.matchDate || '1970-01-01').getTime();
      const dateB = new Date(b.matchDate || '1970-01-01').getTime();
      if (sortOrder === 'Newest') return dateB - dateA;
      return dateA - dateB;
    });
    return sorted;
  }, [filteredMatches, sortOrder]);

  // Summary Stats
  const stats = useMemo(() => {
    const firstInningsCount = sortedMatches.filter(m => m.inningsType === '1st Innings').length;
    return {
      total: sortedMatches.length,
      first: firstInningsCount,
      second: sortedMatches.length - firstInningsCount
    };
  }, [sortedMatches]);



  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/innings/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        fetchAllData(); // refresh data completely
      } else {
        alert("Failed to delete record.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting record.");
    }
  };

  return (
    <div className="all-data-page">
      {/* Page Heading Area */}
      <div className="ad-heading-section">
        <div className="ad-heading-left">
          <div className="ad-db-icon">
            <Database size={32} />
          </div>
          <div className="ad-heading-text">
            <h2>ALL SAVED MATCH DATA</h2>
            <p>View, search, filter, edit or delete all saved innings data.</p>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="ad-filter-panel">
        <div className="filter-item search-filter">
          <label>Search</label>
          <div className="filter-input-wrap">
            <Search size={14} className="filter-icon" />
            <input 
              type="text" 
              placeholder="Search by team, opponent or venue..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>



        <div className="filter-item">
          <label>Filter by Innings</label>
          <select value={inningsFilter} onChange={e => setInningsFilter(e.target.value)}>
            <option>All Innings</option>
            <option>1st Innings</option>
            <option>2nd Innings</option>
          </select>
        </div>

        <div className="filter-item">
          <label>Filter by Team</label>
          <select value={teamFilter} onChange={e => setTeamFilter(e.target.value)}>
            <option>All Teams</option>
            {uniqueTeams.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="filter-item">
          <label>Filter by Opponent</label>
          <select value={opponentFilter} onChange={e => setOpponentFilter(e.target.value)}>
            <option>All Opponents</option>
            {uniqueOpponents.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>

        <div className="filter-actions">
          <button className="btn-apply-filters" onClick={handleApplyFilters}>
            <Filter size={14} /> Apply Filters
          </button>
          <button className="btn-reset-filters" onClick={handleResetFilters}>
            <RefreshCw size={14} /> Reset
          </button>
        </div>
      </div>

      {/* Summary and Sort Area */}
      <div className="ad-summary-bar">
        <div className="ad-summary-cards">
          <div className="ad-summary-card total-card">
            <div className="ad-sc-info">
              <span className="ad-sc-label">Total Matches</span>
              <span className="ad-sc-value">{stats.total}</span>
            </div>
            <div className="ad-sc-icon"><ClipboardList size={20} /></div>
          </div>
          <div className="ad-summary-card first-in-card">
            <div className="ad-sc-info">
              <span className="ad-sc-label">First Innings</span>
              <span className="ad-sc-value">{stats.first}</span>
            </div>
            <div className="ad-sc-icon"><ArrowUpRight size={20} /></div>
          </div>
          <div className="ad-summary-card second-in-card">
            <div className="ad-sc-info">
              <span className="ad-sc-label">Second Innings</span>
              <span className="ad-sc-value">{stats.second}</span>
            </div>
            <div className="ad-sc-icon"><ArrowUpRight size={20} style={{transform: 'rotate(90deg)'}}/></div>
          </div>
        </div>

        <div className="ad-controls-right">
          <div className="sort-control">
            <label>Sort By</label>
            <div className="sort-input-wrap">
              <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                <option value="Newest">Match Date (Newest)</option>
                <option value="Oldest">Match Date (Oldest)</option>
              </select>
              <button className="btn-sort-icon"><SortDesc size={16}/></button>
            </div>
          </div>
          
          <div className="view-toggle">
            <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}>
              <LayoutGrid size={16} />
            </button>
            <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>
              <ListIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className={`ad-content-area ${viewMode}-view`}>
        {sortedMatches.length === 0 ? (
          <div className="ad-empty-state">
            <Database size={48} className="empty-icon" />
            <h3>No Saved Match Data Found</h3>
            <p>Saved innings will appear here after data is entered and stored.</p>
          </div>
        ) : (
          <div className="ad-cards-grid">
            {sortedMatches.map((match, idx) => (
              <SavedInningsCard 
                key={match.id} 
                index={idx + 1} 
                match={match} 
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default AllDataSaved;
