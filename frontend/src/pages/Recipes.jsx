import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { saveRecipe } from '../api';
import { getAuth } from '../hooks/useAuth';
import './Recipes.css';

function RecipeCard({ recipe, index, onSave, saved }) {
  const [expanded, setExpanded] = useState(index === 0);

  const urgencyColor = recipe.urgency_score >= 80
    ? 'var(--red)'
    : recipe.urgency_score >= 50
    ? 'var(--yellow)'
    : 'var(--green)';

  return (
    <div className={`recipe-card ${expanded ? 'expanded' : ''}`}>
      <div className="urgency-bar">
        <div
          className="urgency-fill"
          style={{ width: recipe.urgency_score + '%', background: urgencyColor }}
        />
      </div>

      <div className="recipe-header" onClick={() => setExpanded(!expanded)}>
        <div className="recipe-rank">#{index + 1}</div>
        <div className="recipe-header-info">
          <h3 className="recipe-name">{recipe.name}</h3>
          <div className="recipe-meta-row">
            <span className="meta-pill">⏱ {recipe.time}</span>
            <span className="meta-pill">👤 {recipe.serves}</span>
            <span className="meta-pill">📊 {recipe.difficulty}</span>
          </div>
          <div className="urgent-tags">
            {recipe.urgent_ingredients?.slice(0, 2).map(u => (
              <span key={u} className="badge badge-urgent">⚡ {u}</span>
            ))}
            <span className="badge badge-orange">{recipe.cuisine}</span>
          </div>
        </div>
        <div className="expand-icon">{expanded ? '▲' : '▼'}</div>
      </div>

      <div className="urgency-reasoning">
        <span className="reasoning-icon">💡</span>
        <p>{recipe.urgency_reasoning}</p>
      </div>

      {expanded && (
        <div className="recipe-body fade-up">
          <h4 className="body-title">How to make it</h4>
          <div className="steps-list">
            {recipe.steps?.map((step, i) => (
              <div key={i} className="step-row">
                <div className="step-num">{i + 1}</div>
                <p className="step-text">{step}</p>
              </div>
            ))}
          </div>

          <h4 className="body-title">Nutrition per serving</h4>
          <div className="nutrition-row">
            {[
              { label: 'Calories', value: recipe.nutrition?.calories },
              { label: 'Protein',  value: recipe.nutrition?.protein },
              { label: 'Carbs',    value: recipe.nutrition?.carbs },
              { label: 'Fat',      value: recipe.nutrition?.fat },
            ].map(n => (
              <div key={n.label} className="nutr-card">
                <span className="nutr-value">{n.value || '—'}</span>
                <span className="nutr-label">{n.label}</span>
              </div>
            ))}
          </div>

          <button
            className={`save-recipe-btn ${saved ? 'saved' : ''}`}
            onClick={() => onSave(recipe)}
          >
            {saved ? '❤️ Saved!' : '🤍 Save Recipe'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Recipes() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const auth      = getAuth();
  const recipes   = location.state?.recipes || [];
  const ingredients = location.state?.ingredients || [];
  const [saved, setSaved] = useState([]);

  const handleSave = async (recipe) => {
    const alreadySaved = saved.find(r => r.name === recipe.name);
    if (alreadySaved) {
      setSaved(prev => prev.filter(r => r.name !== recipe.name));
      return;
    }
    try {
      await saveRecipe(auth.user_id, recipe);
      setSaved(prev => [...prev, recipe]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="recipes-page">

      <div className="recipes-header">
        <h1>Your Recipes</h1>
        <p>Ranked by what needs using first</p>
      </div>

      {recipes.length === 0 ? (
        <div className="empty-recipes">
          <div className="empty-icon">🍽️</div>
          <h3>No recipes yet</h3>
          <p>Scan your fridge to generate personalised waste-minimising recipes</p>
          <button className="btn-primary" onClick={() => navigate('/scanner')}>
            📸 Scan Fridge
          </button>
        </div>
      ) : (
        <>
          {ingredients.length > 0 && (
            <div className="ing-summary fade-up">
              <p className="ing-summary-text">
                🧺 Using <strong>{ingredients.length} ingredients</strong> — sorted by what expires soonest
              </p>
            </div>
          )}
          <div className="recipes-list">
            {recipes.map((recipe, i) => (
              <RecipeCard
                key={i}
                recipe={recipe}
                index={i}
                saved={!!saved.find(r => r.name === recipe.name)}
                onSave={handleSave}
              />
            ))}
          </div>
          <div className="rescan-row">
            <button className="btn-secondary" onClick={() => navigate('/scanner')}>
              📸 Scan Again
            </button>
          </div>
        </>
      )}
    </div>
  );
}