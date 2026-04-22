import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { isLoggedIn } from './hooks/useAuth';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Scanner from './pages/Scanner';
import Recipes from './pages/Recipes';
import Saved from './pages/Saved';
import Profile from './pages/Profile';
import Login from './pages/Login';
import './index.css';

function ProtectedRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

function Layout() {
  const location = useLocation();
  const hideNav  = location.pathname === '/login';

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute><Home /></ProtectedRoute>
        }/>
        <Route path="/scanner" element={
          <ProtectedRoute><Scanner /></ProtectedRoute>
        }/>
        <Route path="/recipes" element={
          <ProtectedRoute><Recipes /></ProtectedRoute>
        }/>
        <Route path="/saved" element={
          <ProtectedRoute><Saved /></ProtectedRoute>
        }/>
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        }/>
      </Routes>
      {!hideNav && isLoggedIn() && <BottomNav />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Layout />
      </div>
    </BrowserRouter>
  );
}