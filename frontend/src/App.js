import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import HistoryPage from './components/HistoryPage';
import HomePage from './components/HomePage';
import MockUIPage from './components/MockUIPage';
import RAOSPage from './components/RAOSPage';
import UserAuth from './components/UserAuth';
import UserEdit from './components/UserEdit';
import API_BASE_URL from './config/api';
import DashboardPage from './components/DashboardPage';
export default function App() {
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
   
  useEffect(() => {
    // Check for token in local storage
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get user information
      axios.get(`${API_BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('token');
      });
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setShowUserMenu(false);
  };

   // Add function to close menu when clicking outside
   const handleMenuClose = () => {
    setShowUserMenu(false);
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };
  return (
    <Router>
      <div style={{
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        minHeight: "100vh",
        padding: "20px"
      }}>
        <div style={{
          maxWidth: "1400px",
          margin: "0 auto",
          background: "white",
          borderRadius: "20px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          overflow: "hidden"
        }}>
          {/* Main Header */}
          <header style={{
            background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
            color: "white",
            padding: "30px",
            textAlign: "center"
          }}>
            <h1 style={{
              fontSize: "2.5rem",
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "15px"
            }}>
              <span style={{ fontSize: "2rem" }}>🤖</span>
              Mini AI App Portal
            </h1>
            <p style={{
              fontSize: "1.1rem",
              opacity: "0.9",
              margin: "0"
            }}>
              AI assistant to turn plain app ideas into structured specs and visual prototypes
            </p>
          </header>

          {/* Navigation bar - keep menu centered, user info on right */}
          <nav style={{
            background: "#f8f9fa",
            padding: "20px",
            borderBottom: "2px solid #e9ecef",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "20px"
          }}>
            {/* Left placeholder to keep menu centered */}
            <div style={{ flex: "1" }}></div>
            
            {/* Center: Navigation menu (keep centered) */}
            <div style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
              justifyContent: "center"
            }}>
              <Link 
                to="/" 
                onClick={handleMenuClose}
                style={{
                  background: "white",
                  border: "2px solid #dee2e6",
                  borderRadius: "25px",
                  padding: "10px 20px",
                  textDecoration: "none",
                  color: "#333",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: "500",
                  cursor: "pointer"
                }}
                onMouseOver={(e) => {
                  e.target.style.background = "#667eea";
                  e.target.style.color = "white";
                  e.target.style.borderColor = "#667eea";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.target.style.background = "white";
                  e.target.style.color = "#333";
                  e.target.style.borderColor = "#dee2e6";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                🏠 Home
              </Link>
              <Link 
                to="/history" 
                onClick={handleMenuClose}
                style={{
                  background: "white",
                  border: "2px solid #dee2e6",
                  borderRadius: "25px",
                  padding: "10px 20px",
                  textDecoration: "none",
                  color: "#333",
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: "500",
                  cursor: "pointer"
                }}
                onMouseOver={(e) => {
                  e.target.style.background = "#28a745";
                  e.target.style.color = "white";
                  e.target.style.borderColor = "#28a745";
                  e.target.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.target.style.background = "white";
                  e.target.style.color = "#333";
                  e.target.style.borderColor = "#dee2e6";
                  e.target.style.transform = "translateY(0)";
                }}
              >
                📜 History
              </Link>
              <Link 
    to="/dashboard" 
    onClick={handleMenuClose}
    style={{ 
        background: "white",
        border: "2px solid #dee2e6",
        borderRadius: "25px",
        padding: "10px 20px",
        textDecoration: "none",
        color: "#333",
        transition: "all 0.3s ease",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontWeight: "500",
        cursor: "pointer"
    }}
    onMouseOver={(e) => {
      e.target.style.backgroundColor = '#e3f2fd';
    }}
    onMouseOut={(e) => {
      e.target.style.backgroundColor = 'transparent';
    }}
  >
    📊 Dashboard
  </Link>
            </div>

            {/* Right: User information */}
            <div style={{ 
              flex: "1", 
              display: "flex", 
              justifyContent: "flex-end",
              position: "relative"
            }}>
              {user ? (
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                  {/* User information display */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    background: "white",
                    padding: "8px 15px",
                    borderRadius: "20px",
                    border: "2px solid #dee2e6",
                    cursor: "pointer",
                    transition: "all 0.3s ease"
                  }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = "#007bff";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = "#dee2e6";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                  >
                    <span style={{ fontSize: "1.5rem" }}>{user.avatar}</span>
                    <span style={{ fontWeight: "500", color: "#495057" }}>
                      Welcome, {user.username}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "#6c757d" }}>▼</span>
                  </div>

                  {/* User menu dropdown */}
                  {showUserMenu && (
                    <div style={{
                      position: "absolute",
                      top: "100%",
                      right: "0",
                      background: "white",
                      border: "2px solid #dee2e6",
                      borderRadius: "10px",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                      zIndex: 1000,
                      minWidth: "200px",
                      marginTop: "5px"
                    }}>
                      <div style={{
                        padding: "15px",
                        borderBottom: "1px solid #e9ecef"
                      }}>
                        <div style={{ fontWeight: "600", color: "#495057", marginBottom: "5px" }}>
                          {user.realName}
                        </div>
                        <div style={{ fontSize: "0.9rem", color: "#6c757d" }}>
                          @{user.username}
                        </div>
                        {user.description && (
                          <div style={{ 
                            fontSize: "0.85rem", 
                            color: "#6c757d", 
                            marginTop: "5px",
                            fontStyle: "italic"
                          }}>
                            "{user.description}"
                          </div>
                        )}
                      </div>
                      
                      <div style={{ padding: "10px 0" }}>
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          style={{
                            display: "block",
                            width: "100%",
                            padding: "10px 15px",
                            background: "none",
                            border: "none",
                            textAlign: "left",
                            cursor: "pointer",
                            color: "#495057",
                            textDecoration: "none",
                            transition: "background 0.2s ease"
                          }}
                          onMouseOver={(e) => {
                            e.target.style.background = "#f8f9fa";
                          }}
                          onMouseOut={(e) => {
                            e.target.style.background = "none";
                          }}
                        >
                          ✏️ Edit Profile
                        </Link>
                        
                        <button
                          onClick={handleLogout}
                          style={{
                            width: "100%",
                            padding: "10px 15px",
                            background: "none",
                            border: "none",
                            textAlign: "left",
                            cursor: "pointer",
                            color: "#dc3545",
                            transition: "background 0.2s ease"
                          }}
                          onMouseOver={(e) => {
                            e.target.style.background = "#f8f9fa";
                          }}
                          onMouseOut={(e) => {
                            e.target.style.background = "none";
                          }}
                        >
                          🚪 Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <UserAuth onLogin={handleLogin} onLogout={handleLogout} user={user} />
              )}
            </div>
          </nav>

          {/* Main content area */}
          <main style={{ padding: "40px" }}>
            <Routes>
            <Route path="/" element={<HomePage user={user} onLogin={handleLogin} onLogout={handleLogout} />} />
              <Route path="/raos/:id" element={<RAOSPage user={user} />} />
              <Route path="/mock/:id" element={<MockUIPage user={user} />} />
              <Route path="/history" element={<HistoryPage user={user} />} />
              <Route path="/profile" element={<UserEdit user={user} onUpdate={handleUserUpdate} onLogout={handleLogout} />} />
              <Route path="/dashboard" element={<DashboardPage user={user} />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}