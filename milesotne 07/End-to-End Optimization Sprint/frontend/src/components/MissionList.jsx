import React, { useState, useMemo } from 'react';
import MissionCard from './MissionCard';

const cardStyle = { marginBottom: '0' };

const MissionList = ({ missions, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(12);

  const filteredMissions = useMemo(() => {
    console.log('--- Expensive filtering running ---');
    let temp = [...missions];
    
    for(let i=0; i<500000; i++) {
        Math.sqrt(i);
    }

    return temp
      .filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => new Date(b.launchDate) - new Date(a.launchDate));
  }, [missions, searchTerm]);

  return (
    <div className="list-wrapper">
      <div className="search-area">
        <div className="search-box">
          <div className="search-input-wrapper">
            <div className="search-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            <input
              type="text"
              placeholder="ENCRYPTED SEARCH: FREQUENCY SCAN..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="stats-container">
            <div className="stat-item">
              <span className="stat-label">Nodes</span>
              <span className="stat-value">{filteredMissions.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mission-grid">
        {filteredMissions.slice(0, visibleCount).map(mission => (
          <MissionCard 
            key={mission.id} 
            mission={mission} 
            onDelete={onDelete}
            style={cardStyle} 
          />
        ))}
      </div>
      
      {visibleCount < filteredMissions.length && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button 
            onClick={() => setVisibleCount(prev => prev + 12)}
            className="action-btn"
          >
            Load More ({filteredMissions.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
};

export default MissionList;
