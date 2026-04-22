import React, { useState, useEffect } from 'react';
import { getPreferences, updatePreferences } from '../api';
import { getStats } from '../hooks/useStats';
import { getAuth, clearAuth } from '../hooks/useAuth';
import './Profile.css';

const DIETS    = ['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Low-carb', 'High-protein'];
const CUISINES = ['Any', 'Italian', 'Asian', 'Mexican', 'British', 'Mediterranean', 'Indian'];

export default function Profile() {
  const auth      = getAuth();
  const liveStats = getStats();

  const [prefs, setPrefs]     = useState([]);
  const [cuisine, setCuisine] = useState('Any');
  const [serves, setServes]   = useState(2);
  const [saved, setSaved]     = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPreferences(auth.user_id)
      .then(data => {
        setPrefs(data.dietary_restrictions || []);
        setCuisine(data.cuisine || 'Any');
        setServes(data.serves || 2);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [auth.user_id]);

  const togglePref = (p) => {
    setPrefs(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const handleSave = async () => {
    try {
      await updatePreferences(auth.user_id, {
        dietary_restrictions: prefs,
        cuisine,
        serves,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-header">
          <div className="profile-avatar">🧑‍🍳</div>
          <div>
            <h1>My Profile</h1>
            <p>Loading your preferences...</p>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">

      <div className="profile-header">
        <div className="profile-avatar">🧑‍🍳</div>
        <div>
          <h1>{auth?.name || 'My Profile'}</h1>
          <p>{auth?.email}</p>
        </div>
      </div>

      <div className="profile-section">
        <h3 className="profile-section-title">Household Size</h3>
        <p className="profile-section-sub">How many people are you usually cooking for?</p>
        <div className="serves-row">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <button
              key={n}
              className={`serve-btn ${serves === n ? 'active' : ''}`}
              onClick={() => setServes(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="profile-section">
        <h3 className="profile-section-title">Dietary Needs</h3>
        <p className="profile-section-sub">We'll always filter recipes to match</p>
        <div className="chips-row">
          {DIETS.map(d => (
            <button
              key={d}
              className={`chip ${prefs.includes(d) ? 'active' : ''}`}
              onClick={() => togglePref(d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="profile-section">
        <h3 className="profile-section-title">Favourite Cuisine</h3>
        <div className="chips-row">
          {CUISINES.map(c => (
            <button
              key={c}
              className={`chip ${cuisine === c ? 'active' : ''}`}
              onClick={() => setCuisine(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="profile-section">
        <h3 className="profile-section-title">Your Impact</h3>
        <div className="impact-grid">
          <div className="impact-card">
            <span className="impact-icon">🍳</span>
            <span className="impact-value">{liveStats.mealsMade}</span>
            <span className="impact-label">Meals Made</span>
          </div>
          <div className="impact-card">
            <span className="impact-icon">🥦</span>
            <span className="impact-value">{liveStats.itemsSaved}</span>
            <span className="impact-label">Items Saved</span>
          </div>
          <div className="impact-card green">
            <span className="impact-icon">💰</span>
            <span className="impact-value">{'£'}{liveStats.moneySaved}</span>
            <span className="impact-label">Money Saved</span>
          </div>
          <div className="impact-card green">
            <span className="impact-icon">🌍</span>
            <span className="impact-value">{liveStats.co2Saved}kg</span>
            <span className="impact-label">CO2 Saved</span>
          </div>
        </div>
      </div>

      <div className="profile-save">
        <button
          className={`btn-primary ${saved ? 'saved' : ''}`}
          onClick={handleSave}
        >
          {saved ? '✅ Saved!' : 'Save Preferences'}
        </button>
      </div>

      <div className="profile-save" style={{ marginTop: 12 }}>
        <button className="btn-secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>

    </div>
  );
}