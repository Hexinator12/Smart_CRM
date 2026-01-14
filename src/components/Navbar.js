import '../styles/Navbar.css';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [showSettings, setShowSettings] = useState(false);

    return (
        <nav className="navbar">
            <div className="nav-left">
                <div style={{
                    color: '#FF6B00',
                    fontSize: '28px',
                    fontWeight: 'bold',
                    marginRight: '40px',
                    fontFamily: 'Arial, sans-serif',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                    letterSpacing: '1px'
                }}>CLIENT SPHERE</div>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/contacts" className="nav-link">Contacts</Link>
                <Link to="/deals" className="nav-link">Deals</Link>
                <Link to="/taxation" className="nav-link">Taxation</Link>
                <Link to="/reports" className="nav-link">Reports</Link>
                <Link to="/tasks" className="nav-link">Tasks</Link>
                <Link to="/calendar" className="nav-link">Calendar</Link>
                <div className="settings-dropdown">
                    <button 
                        className="settings-btn"
                        onClick={() => setShowSettings(!showSettings)}
                    >
                        Settings
                    </button>
                    {showSettings && (
                        <div className="settings-menu">
                            <Link to="/profile">Profile</Link>
                            <Link to="/preferences">Preferences</Link>
                            <Link to="/team">Team Management</Link>
                            <Link to="/sentiment" className="analyze-option">
                                Analyze Sentiment
                            </Link>
                            <button className="dark-mode-btn">
                                🌙 Dark Mode
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className="nav-right">
                {user && <span className="user-email">{user.email}</span>}
                <button className="logout-btn" onClick={logout}>Logout</button>
            </div>
        </nav>
    );
};

export default Navbar;