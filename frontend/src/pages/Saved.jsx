import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSavedRecipes, deleteRecipe } from '../api';
import { getAuth } from '../hooks/useAuth';
import './Saved.css';

export default function Saved() {
  const navigate  = useNavigate();
  const auth      = getAuth();
  const [saved, setSaved]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSavedRecipes(auth.user_id)
      .then(data => setSaved(data.recipes || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [auth.user_id]);

  const handleDelete = async (user_id, recipe_id) => {
    try {
      await deleteRecipe(user_id, recipe_id);
      setSaved(prev => prev.filter(r => r.recipe_id !== recipe_id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="saved-page">
        <div className="saved-header">
          <h1>Saved Recipes</h1>
          <p>Your favourite meals in one place</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="saved-page">

      <div className="saved-header">
        <h1>Saved Recipes</h1>
        <p>Your favourite meals in one place</p>
      </div>

      {saved.length === 0 ? (
        <div className="saved-empty">
          <div className="saved-empty-icon">🤍</div>
          <h3>No saved recipes yet</h3>
          <p>Scan your fridge and save recipes you love — they'll appear here</p>
          <button className="btn-primary" onClick={() => navigate('/scanner')}>
            📸 Scan Fridge
          </button>
        </div>
      ) : (
        <div className="saved-list">
          {saved.map((item) => (
            <div key={item.recipe_id} className="saved-card fade-up">
              <div className="saved-card-top">
                <div>
                  <h3 className="saved-name">{item.recipe.name}</h3>
                  <div className="saved-meta">
                    <span>⏱ {item.recipe.time}</span>
                    <span>👤 {item.recipe.serves}</span>
                    <span>📊 {item.recipe.difficulty}</span>
                  </div>
                </div>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(item.user_id, item.recipe_id)}
                >
                  ✕
                </button>
              </div>
              <p className="saved-reasoning">{item.recipe.urgency_reasoning}</p>
              <div className="saved-tags">
                <span className="badge badge-orange">{item.recipe.cuisine}</span>
                <span className="badge badge-ok">{item.recipe.meal_type}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}