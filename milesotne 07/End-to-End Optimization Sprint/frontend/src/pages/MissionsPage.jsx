import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import MissionList from '../components/MissionList';

const MissionsPage = () => {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchMissions = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/missions?limit=200', {
          signal: controller.signal
        });
        setMissions(response.data.data || response.data);
        setLoading(false);
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error('Error fetching missions:', error);
          setLoading(false);
        }
      }
    };

    fetchMissions();

    return () => controller.abort();
  }, []); 

  const handleDelete = useCallback((id) => {
    setMissions(prevMissions => prevMissions.filter(m => m.id !== id));
  }, []);

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">Space Mission Logs</h1>
        <p className="subtitle">Real-time telemetry and mission catalog</p>
      </header>

      {loading ? (
        <div className="loader">
          <div className="spinner"></div>
        </div>
      ) : (
        <MissionList missions={missions} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default MissionsPage;
