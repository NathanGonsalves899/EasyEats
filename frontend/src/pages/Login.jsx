import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api';
import { setAuth } from '../hooks/useAuth';
import './Login.css';

export default function Login() {
  const navigate        = useNavigate();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async () => {
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (mode === 'register' && !name) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);

    try {
      let data;
      if (mode === 'login') {
        data = await login({ email, password });
      } else {
        data = await register({ name, email, password });
      }

      setAuth({
        token:   data.token,
        user_id: data.user_id,
        name:    data.name,
        email:   data.email,
      });

      navigate('/');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* ── Logo ── */}
      <div className="login-logo">
        <div className="login-logo-icon">🧺</div>
        <h1 className="login-title">EasyEats</h1>
        <p className="login-sub">Zero waste, maximum flavour</p>
      </div>

      {/* ── Card ── */}
      <div className="login-card">

        {/* Tabs */}
        <div className="login-tabs">
          <button
            className={`login-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Login
          </button>
          <button
            className={`login-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(''); }}
          >
            Register
          </button>
        </div>

        {/* Fields */}
        <div className="login-fields">
          {mode === 'register' && (
            <div className="login-field fade-up">
              <label className="login-label">Your Name</label>
              <input
                className="input"
                placeholder="e.g. Sarah"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          )}

          <div className="login-field">
            <label className="login-label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="login-field">
            <label className="login-label">Password</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {error && (
            <div className="login-error fade-up">
              ⚠️ {error}
            </div>
          )}

          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? '...'
              : mode === 'login' ? 'Login' : 'Create Account'
            }
          </button>
        </div>

      </div>

      <p className="login-footer">
        Your data is stored securely and never shared.
      </p>

    </div>
  );
}