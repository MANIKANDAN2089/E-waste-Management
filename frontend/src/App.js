import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { FaHome, FaTruck, FaUserMd, FaClipboardList, FaRobot, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';
import Login from './components/Login';
import Register from './components/Register';
import PickupForm from './components/PickupForm';
import ConsultForm from './components/ConsultForm';
import MyRequests from './components/MyRequests';
import Chatbot from './pages/Chatbot';
import AdminDashboard from './pages/AdminDashboard';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Simple Home Component
function Home() {
  return (
    <div className="home-page">
      <h2>Welcome to E-Waste Service</h2>
      <p>Use the navigation above to request pickups, consult experts, or chat with our AI Assistant.</p>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

  useEffect(() => {
    if (token && !user) {
      const u = JSON.parse(localStorage.getItem('user') || 'null');
      setUser(u);
    }
  }, [token, user]);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const ProtectedRoute = ({ children, allowedRoles }) => {
    if (!user || !allowedRoles.includes(user.role)) {
      return <Navigate to="/" />;
    }
    return children;
  };

  if (!token) return (
    <div className="container">
      <h1>E-Waste Service</h1>
      <Register onAuth={(t, u) => { setToken(t); setUser(u); }} />
      <hr />
      <Login onAuth={(t, u) => { setToken(t); setUser(u); }} />
    </div>
  );

  return (
    <BrowserRouter>
      <div className="app-container">
        <nav className="main-nav">
          {user.role === 'admin' ? (
            <>
              <Link to="/admin" className="nav-link">
                <span className="nav-icon"><FaTachometerAlt /></span>
                Admin Dashboard
              </Link>
              <button onClick={logout} className="btn-logout">
                <span className="nav-icon"><FaSignOutAlt /></span>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/" className="nav-link">
                <span className="nav-icon"><FaHome /></span>
                Home
              </Link>
              <Link to="/pickup" className="nav-link">
                <span className="nav-icon"><FaTruck /></span>
                Request Pickup
              </Link>
              <Link to="/consult" className="nav-link">
                <span className="nav-icon"><FaUserMd /></span>
                Expert Consultation
              </Link>
              <Link to="/my-requests" className="nav-link">
                <span className="nav-icon"><FaClipboardList /></span>
                My Requests
              </Link>
              <Link to="/chatbot" className="nav-link">
                <span className="nav-icon"><FaRobot /></span>
                AI Assistant
              </Link>
              <button onClick={logout} className="btn-logout">
                <span className="nav-icon"><FaSignOutAlt /></span>
                Logout
              </button>
            </>
          )}
        </nav>

        <div className="main-content">
          <header>
            <h1>Welcome, {user?.name}</h1>
          </header>
          <main>
            <Routes>
              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard token={token} />
                  </ProtectedRoute>
                }
              />

              {/* User Routes */}
              <Route
                path="/pickup"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <PickupForm token={token} api={API} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/consult"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <ConsultForm token={token} api={API} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-requests"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <MyRequests token={token} api={API} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/chatbot"
                element={
                  <ProtectedRoute allowedRoles={['user']}>
                    <Chatbot />
                  </ProtectedRoute>
                }
              />

              {/* Home Page */}
              <Route
                path="/"
                element={
                  user.role === 'admin'
                    ? <Navigate to="/admin" />
                    : <Home />
                }
              />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
