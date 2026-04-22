import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { scanFridge } from '../api';
import { recordScan } from '../hooks/useStats';
import { getAuth } from '../hooks/useAuth';
import './Scanner.css';

export default function Scanner() {
  const [image, setImage]             = useState(null);
  const [imageB64, setImageB64]       = useState(null);
  const [loading, setLoading]         = useState(false);
  const [loadMsg, setLoadMsg]         = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [prefs, setPrefs]             = useState([]);
  const [cuisine, setCuisine]         = useState('Any');
  const [serves, setServes]           = useState(2);
  const fileRef  = useRef();
  const navigate = useNavigate();
  const auth     = getAuth();

  const DIETS    = ['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Low-carb'];
  const CUISINES = ['Any', 'Italian', 'Asian', 'Mexican', 'British', 'Mediterranean'];

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImage(ev.target.result);
      setImageB64(ev.target.result.split(',')[1]);
      setIngredients([]);
    };
    reader.readAsDataURL(file);
  };

  const urgencyClass = (days) => days <= 2 ? 'urgent' : days <= 5 ? 'soon' : 'ok';
  const urgencyLabel = (days) => days <= 2 ? 'Today!' : `${days}d`;

  const handleScan = async () => {
    if (!imageB64) return;
    setLoading(true);
    setLoadMsg('Scanning your fridge...');
    setIngredients([]);

    try {
      const data = await scanFridge({
        image_base64: imageB64,
        user_id: auth.user_id,
        dietary_restrictions: prefs,
        cuisine,
        serves,
      });

      setIngredients(data.ingredients || []);
      recordScan(data.ingredients || []);
      setLoadMsg('Generating recipes...');

      setTimeout(() => {
        navigate('/recipes', {
          state: { recipes: data.recipes, ingredients: data.ingredients }
        });
      }, 800);

    } catch (err) {
      console.error(err);
      setLoadMsg('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="scanner-page">

      <div className="scanner-header">
        <h1>Scan Fridge</h1>
        <p>Photo your fridge and we'll detect what's inside</p>
      </div>

      <div
        className={`upload-zone ${image ? 'has-image' : ''}`}
        onClick={() => !image && fileRef.current.click()}
      >
        {image ? (
          <>
            <img src={image} alt="Fridge" className="fridge-preview" />
            <div className="image-actions">
              <button className="retake-btn" onClick={(e) => {
                e.stopPropagation();
                setImage(null);
                setImageB64(null);
                setIngredients([]);
                fileRef.current.click();
              }}>
                📸 Retake
              </button>
            </div>
          </>
        ) : (
          <div className="upload-prompt">
            <div className="upload-icon-wrap">📷</div>
            <h3>Photograph your fridge</h3>
            <p>Tap to upload or take a photo</p>
            <span className="upload-hint">JPG, PNG supported</span>
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFile}
      />

      <div className="prefs-section">
        <h3 className="prefs-title">Dietary needs</h3>
        <div className="chips-row">
          {DIETS.map(d => (
            <button
              key={d}
              className={`chip ${prefs.includes(d) ? 'active' : ''}`}
              onClick={() => setPrefs(prev =>
                prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
              )}
            >
              {d}
            </button>
          ))}
        </div>

        <h3 className="prefs-title">Cuisine</h3>
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

        <h3 className="prefs-title">Serves</h3>
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

      {ingredients.length > 0 && (
        <div className="ingredients-section fade-up">
          <div className="ingredients-header">
            <h3>Detected Ingredients</h3>
            <span className="ing-count">{ingredients.length} items</span>
          </div>
          <div className="legend-row">
            <span className="legend-item"><span className="dot dot-urgent"/>Use today</span>
            <span className="legend-item"><span className="dot dot-soon"/>Use soon</span>
            <span className="legend-item"><span className="dot dot-ok"/>Still good</span>
          </div>
          <div className="ingredients-grid">
            {ingredients.map((ing, i) => (
              <div key={i} className={`ing-card ${urgencyClass(ing.days_left)}`}>
                <div className={`dot dot-${urgencyClass(ing.days_left)}`} />
                <div className="ing-info">
                  <span className="ing-name">{ing.name}</span>
                  <div className="ing-days-row">
                    <button
                      className="days-btn"
                      onClick={() => setIngredients(prev =>
                        prev.map((item, idx) =>
                          idx === i ? { ...item, days_left: Math.max(0, item.days_left - 1) } : item
                        )
                      )}
                    >−</button>
                    <span className="ing-days">{urgencyLabel(ing.days_left)}</span>
                    <button
                      className="days-btn"
                      onClick={() => setIngredients(prev =>
                        prev.map((item, idx) =>
                          idx === i ? { ...item, days_left: item.days_left + 1 } : item
                        )
                      )}
                    >+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="scan-action">
        {loading ? (
          <div className="loading-state">
            <div className="spinner" />
            <p className="load-msg">{loadMsg}</p>
          </div>
        ) : (
          <button
            className="btn-primary"
            onClick={handleScan}
            disabled={!image}
          >
            🔍 Scan & Generate Recipes
          </button>
        )}
      </div>

    </div>
  );
}