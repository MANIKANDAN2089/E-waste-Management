import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import PickupForm from './components/PickupForm';
import ConsultForm from './components/ConsultForm';
import MyRequests from './components/MyRequests';
import Chatbot from './pages/Chatbot';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function App(){
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')||'null'));

  useEffect(()=>{
    if(token && !user){
      // decode simple stored user from localStorage when set via login/register
      const u = JSON.parse(localStorage.getItem('user')||'null');
      setUser(u);
    }
  },[token,user]);

  const logout = ()=>{ localStorage.removeItem('token'); localStorage.removeItem('user'); setToken(null); setUser(null); }

  if(!token) return <div className="container"><h1>E-Waste Service</h1><Register onAuth={(t,u)=>{setToken(t); setUser(u);}} /><hr/><Login onAuth={(t,u)=>{setToken(t); setUser(u);}} /></div>;

  return (
    <BrowserRouter>
      <div className="app-container">
        <nav className="main-nav">
          <div className="nav-brand">
            <Link to="/">E-Waste Service</Link>
          </div>
          <div className="nav-links">
            <Link to="/pickup" className="nav-link">
              <span className="nav-icon">📦</span>
              Request Pickup
            </Link>
            <Link to="/consult" className="nav-link">
              <span className="nav-icon">👨‍💼</span>
              Expert Consultation
            </Link>
            <Link to="/my-requests" className="nav-link">
              <span className="nav-icon">📋</span>
              My Requests
            </Link>
            <Link to="/chatbot" className="nav-link">
              <span className="nav-icon">🤖</span>
              AI Assistant
            </Link>
          </div>
          <button onClick={logout} className="btn-logout">
            <span className="nav-icon">👋</span>
            Logout
          </button>
        </nav>
        <div className="main-content">
          <header>
            <h1>Welcome, {user?.name}</h1>
          </header>
          <main>
            <Routes>
              <Route path="/login" element={<Login onAuth={(t, u) => { setToken(t); setUser(u); }} />} />
              <Route path="/" element={<h2>Welcome to the E-Waste Service Portal</h2>} />
              <Route path="/pickup" element={<PickupForm token={token} api={API} />} />
              <Route path="/consult" element={<ConsultForm token={token} api={API} />} />
              <Route path="/my-requests" element={<MyRequests token={token} api={API} />} />
              <Route path="/chatbot" element={<Chatbot />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
