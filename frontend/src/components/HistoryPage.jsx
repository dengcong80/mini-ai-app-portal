import React, { useEffect, useCallback,useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
export default function HistoryPage({ user, onLogin, onLogout }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const itemsPerPage = 10; // Display 10 items per page



// add cache
const [cache, setCache] = useState(new Map());

// fetch user requirements
const fetchUserRequirements = useCallback(async (page = 1) => {
  if (!user) return;
  
  try {
    setLoading(true);
    const res = await axios.get(`${API_BASE_URL}/api/requirements/my?page=${page}&limit=${itemsPerPage}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    
    const { requirements, totalPages, currentPage, total } = res.data;
    
    // cache data
    const cacheKey = `user_requirements_${page}`;
    setCache(prev => new Map(prev.set(cacheKey, {
      requirements,
      totalPages,
      currentPage,
      total
    })));
    
    setItems(requirements);
    setTotalPages(totalPages);
    setCurrentPage(currentPage);
  } catch (err) {
    console.error('Failed to fetch user requirements:', err);
    console.error('Error response:', err.response?.data);
    setItems([]);
  } finally {
    setLoading(false);
  }
}, [user, itemsPerPage]);

// fetch with cache
const fetchWithCache = useCallback(async (page) => {
  const cacheKey = `user_requirements_${page}`;
  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    setItems(cached.requirements);
    setTotalPages(cached.totalPages);
    setCurrentPage(cached.currentPage);
    return;
  }
  
  await fetchUserRequirements(page);
}, [cache, fetchUserRequirements]);


useEffect(() => {
  if (user) {
    fetchWithCache(currentPage);
  } else {
    setLoading(false);
  }
}, [user, currentPage, fetchWithCache]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this prototype?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/requirements/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
    setItems(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      alert('Failed to delete prototype');
    }
  };


  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchWithCache(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setErrors({});

    try {
      const res = await axios.post(`${API_BASE_URL}/api/users/login`, formData);

      localStorage.setItem('token', res.data.token);
      onLogin(res.data.user);
      setShowLogin(false);
      setFormData({ username: '', password: '' });
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response?.status === 401) {
        setErrors({ 
          general: 'Invalid credentials. User not found. Would you like to create a new account?',
          showRegister: true 
        });
      } else if (err.response?.status === 400) {
        setErrors({ general: err.response.data.error });
      } else {
        setErrors({ general: 'Login failed. Please try again.' });
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterRedirect = () => {
    // Close current login modal
    setShowLogin(false);
    setErrors({});
    
    // Trigger UserAuth component's registration button via DOM operation
    setTimeout(() => {
      const userAuthComponent = document.querySelector('[data-testid="user-auth"]');
      if (userAuthComponent) {
        // Find registration button (usually the second button)
        const buttons = userAuthComponent.querySelectorAll('button');
        if (buttons.length >= 2) {
          buttons[1].click(); // Click registration button
        }
      }
    }, 100); // Slight delay to ensure login modal is closed
  };

  // Determine project status
  const getStatus = (item) => {
    return item.mockHtml ? 'Completed' : 'In Process';
  };

  // Get status style
  const getStatusStyle = (status) => {
    return {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '600',
      backgroundColor: status === 'Completed' ? '#d4edda' : '#fff3cd',
      color: status === 'Completed' ? '#155724' : '#856404',
      border: status === 'Completed' ? '1px solid #c3e6cb' : '1px solid #ffeaa7'
    };
  };


  const renderPagination = () => {
    if (totalPages <= 1) return null;
  
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
  
    // Add first page and ellipsis
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          style={{
            padding: '8px 12px',
            margin: '0 2px',
            border: '1px solid #dee2e6',
            background: 'white',
            borderRadius: '6px',
            cursor: 'pointer',
            color: '#495057'
          }}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" style={{ padding: '8px', color: '#6c757d' }}>
            ...
          </span>
        );
      }
    }
  
    // Add middle page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          style={{
            padding: '8px 12px',
            margin: '0 2px',
            border: '1px solid #dee2e6',
            background: i === currentPage ? '#007bff' : 'white',
            color: i === currentPage ? 'white' : '#495057',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: i === currentPage ? '600' : '400'
          }}
          onMouseOver={(e) => {
            if (i !== currentPage) {
              e.target.style.backgroundColor = '#f8f9fa';
            }
          }}
          onMouseOut={(e) => {
            if (i !== currentPage) {
              e.target.style.backgroundColor = 'white';
            }
          }}
        >
          {i}
        </button>
      );
    }
  
    // Add ellipsis and last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" style={{ padding: '8px', color: '#6c757d' }}>
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          style={{
            padding: '8px 12px',
            margin: '0 2px',
            border: '1px solid #dee2e6',
            background: 'white',
            borderRadius: '6px',
            cursor: 'pointer',
            color: '#495057'
          }}
        >
          {totalPages}
        </button>
      );
    }
  
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: '10px',
        marginTop: '30px',
        flexWrap: 'wrap'
      }}>
        {/* Previous page button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: '8px 16px',
            border: '1px solid #dee2e6',
            background: currentPage === 1 ? '#f8f9fa' : 'white',
            color: currentPage === 1 ? '#6c757d' : '#495057',
            borderRadius: '6px',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          ← Previous
        </button>
  
        {/* Page numbers */}
        {pages}
  
        {/* Next page button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: '8px 16px',
            border: '1px solid #dee2e6',
            background: currentPage === totalPages ? '#f8f9fa' : 'white',
            color: currentPage === totalPages ? '#6c757d' : '#495057',
            borderRadius: '6px',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          Next →
        </button>
      </div>
    );
  };

  // Show login prompt for unauthenticated users
  if (!user) {
    return (
      <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
        <h2>📜 History Dashboard</h2>
        <div style={{
          background: '#f8f9fa',
          padding: '40px',
          borderRadius: '10px',
          border: '2px solid #dee2e6',
          marginTop: '20px'
        }}>
          <h3 style={{ color: '#6c757d', marginBottom: '20px' }}>Please Login First</h3>
          <p style={{ color: '#6c757d', marginBottom: '30px' }}>
            You need to be logged in to view your prototype history.
          </p>
          <button
            onClick={() => setShowLogin(true)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#0056b3';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#007bff';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            🔐 Login to Continue
          </button>
        </div>

        {/* Login Modal */}
        {showLogin && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '10px',
              width: '400px',
              maxWidth: '90vw'
            }}>
              <h3>Login</h3>
              <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '15px' }}>
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      style={{
                        width: '100%',
                        padding: '10px 40px 10px 10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        padding: '5px',
                        width: '30px',
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                {errors.general && (
                  <div style={{
                    color: errors.showRegister ? '#007bff' : '#dc3545',
                    backgroundColor: errors.showRegister ? '#e3f2fd' : '#f8d7da',
                    border: errors.showRegister ? '1px solid #bbdefb' : '1px solid #f5c6cb',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '15px',
                    textAlign: 'center'
                  }}>
                    {errors.general}
                    {errors.showRegister && (
                      <div style={{ marginTop: '10px' }}>
                        <button
                          type="button"
                          onClick={handleRegisterRedirect}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          Create New Account
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowLogin(false)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loginLoading}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: loginLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loginLoading ? 'Logging in...' : 'Login'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
        <h2>📜 History Dashboard</h2>
        <p>Loading your prototypes...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
      <h2>📜 History Dashboard</h2>
          <p style={{ color: '#6c757d', margin: '0' }}>
            Welcome back, {user.realName}! Here are your generated prototypes.
          </p>
          <p style={{ color: '#6c757d', margin: '5px 0 0 0', fontSize: '0.9rem' }}>
    Page {currentPage} of {totalPages}
  </p>
        </div>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#218838';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#28a745';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          ➕ Create New Prototype
        </button>
      </div>
      
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
          <p>No prototypes generated yet.</p>
          <p>Start by creating your first app prototype!</p>
        </div>
      ) : (
        <>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>App Name</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Description</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Created By</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Created At</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const status = getStatus(item);
              return (
              <tr key={item._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{item.appName || '—'}</td>
                <td style={{ padding: '12px', maxWidth: '250px', wordWrap: 'break-word' }}>
                  {item.appDescription?.substring(0, 70)}...
                </td>
                  <td style={{ padding: '12px' }}>
                    <span style={getStatusStyle(status)}>
                      {status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.2rem' }}>{item.createdBy?.avatar || '👤'}</span>
                      <span style={{ fontSize: '0.9rem', color: '#495057' }}>
                        {item.createdBy?.realName || item.createdBy?.username || 'Unknown'}
                      </span>
                    </div>
                  </td>
                <td style={{ padding: '12px', fontSize: '0.9em', color: '#666' }}>
                    {new Date(item.createdAt).toLocaleString('sv-SE')}
                </td>
                <td style={{ padding: '12px' }}>
                  <button
                    onClick={() => navigate(`/raos/${item._id}`)}
                    style={{
                      marginRight: '6px',
                      padding: '5px 10px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    RAOS
                  </button>
                    {status === 'Completed' && (
                  <button
                    onClick={() => navigate(`/mock/${item._id}`)}
                    style={{
                      marginRight: '6px',
                      padding: '5px 10px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    UI
                  </button>
                    )}
                  <button
                    onClick={() => handleDelete(item._id)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
        
      
        {renderPagination()}
        </>
      )}
    
    </div>
  );
}