const BASE_URL = 'http://localhost:8000';
const API_KEY  = 'easyeats-dev-secret';

const headers = {
  'Content-Type': 'application/json',
  'X-API-Key': API_KEY,
};

// ── Scan ──────────────────────────────────────────────────────────────────

export async function scanFridge({ image_base64, user_id, dietary_restrictions, cuisine, serves }) {
  const res = await fetch(`${BASE_URL}/scan`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ image_base64, user_id, dietary_restrictions, cuisine, serves }),
  });
  if (!res.ok) throw new Error('Scan failed');
  return res.json();
}

// ── Recipes ───────────────────────────────────────────────────────────────

export async function getSavedRecipes(user_id) {
  const res = await fetch(`${BASE_URL}/recipes/${user_id}`, { headers });
  if (!res.ok) throw new Error('Failed to fetch recipes');
  return res.json();
}

export async function saveRecipe(user_id, recipe) {
  const res = await fetch(`${BASE_URL}/recipes/${user_id}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ recipe }),
  });
  if (!res.ok) throw new Error('Failed to save recipe');
  return res.json();
}

export async function deleteRecipe(user_id, recipe_id) {
  const res = await fetch(`${BASE_URL}/recipes/${user_id}/${recipe_id}`, {
    method: 'DELETE',
    headers,
  });
  if (!res.ok) throw new Error('Failed to delete recipe');
}

// ── Preferences ───────────────────────────────────────────────────────────

export async function getPreferences(user_id) {
  const res = await fetch(`${BASE_URL}/preferences/${user_id}`, { headers });
  if (!res.ok) throw new Error('Failed to fetch preferences');
  return res.json();
}

export async function updatePreferences(user_id, prefs) {
  const res = await fetch(`${BASE_URL}/preferences/${user_id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(prefs),
  });
  if (!res.ok) throw new Error('Failed to update preferences');
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────

export async function register({ name, email, password }) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Registration failed');
  }
  return res.json();
}

export async function login({ email, password }) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Login failed');
  }
  return res.json();
}