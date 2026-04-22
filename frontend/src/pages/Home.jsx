import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats } from '../hooks/useStats';
import { getAuth } from '../hooks/useAuth';
import './Home.css';

const tips = [
  { emoji: '🧊', tip: 'Store leftovers at the front of your fridge so you see them first' },
  { emoji: '🥬', tip: 'Keep herbs fresh by storing them like flowers in a glass of water' },
  { emoji: '🍋', tip: 'Freeze citrus zest before fruits go off — great for cooking later' },
];

export default function Home() {
  const navigate   = useNavigate();
  const auth       = getAuth();
  const liveStats  = getStats();

  const stats = [
    { label: 'Meals Made',  value: liveStats.mealsMade,       icon: '🍳' },
    { label: 'Items Saved', value: liveStats.itemsSaved,       icon: '🥦' },
    { label: 'Money Saved', value: `£${liveStats.moneySaved}`, icon: '💰' },
  ];

  return (
    <div className="home-page">

      <div className="home-header">
        <div>
          <p className="home-greeting">Good morning 👋</p>
          <h1 className="home-title">EasyEats</h1>
          <p className="home-sub">Zero waste, maximum flavour</p>
        </div>
        <div className="home-avatar">🧑‍🍳</div>
      </div>

      <div className="hero-card" onClick={() => navigate('/scanner')}>
        <div className="hero-card-left">
          <span className="hero-badge">NEW SCAN</span>
          <h2 className="hero-card-title">
            {auth?.name ? `Hi ${auth.name}!` : "What's in your fridge?"}
          </h2>
          <p className="hero-card-sub">Snap a photo and we'll sort the rest</p>
          <button className="hero-btn">Scan Now →</button>
        </div>
        <div className="hero-card-right">🧺</div>
      </div>

      <div className="stats-row">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <span className="stat-icon">{s.icon}</span>
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      <h3 className="section-title">Quick Actions</h3>
      <div className="quick-actions">
        <button className="action-card" onClick={() => navigate('/scanner')}>
          <span className="action-icon">📸</span>
          <span className="action-label">Scan Fridge</span>
        </button>
        <button className="action-card" onClick={() => navigate('/recipes')}>
          <span className="action-icon">🍽️</span>
          <span className="action-label">My Recipes</span>
        </button>
        <button className="action-card" onClick={() => navigate('/saved')}>
          <span className="action-icon">❤️</span>
          <span className="action-label">Saved</span>
        </button>
        <button className="action-card" onClick={() => navigate('/profile')}>
          <span className="action-icon">⚙️</span>
          <span className="action-label">Settings</span>
        </button>
      </div>

      <h3 className="section-title">Food Waste Tips</h3>
      <div className="tips-list">
        {tips.map((t, i) => (
          <div key={i} className="tip-card">
            <span className="tip-emoji">{t.emoji}</span>
            <p className="tip-text">{t.tip}</p>
          </div>
        ))}
      </div>

    </div>
  );
}