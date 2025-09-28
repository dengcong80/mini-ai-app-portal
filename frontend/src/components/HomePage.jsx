import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api';
export default function HomePage({ user, onLogin, onLogout }) {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
 // ✅ New: Description length monitoring state
 const [descriptionError, setDescriptionError] = useState(false);
 const [charCount, setCharCount] = useState(0);
 const MAX_DESCRIPTION_LENGTH = 1000;

// ✅ New: Login related state
const [showLogin, setShowLogin] = useState(false);
const [formData, setFormData] = useState({
  username: '',
  password: ''
});
const [errors, setErrors] = useState({});
const [loginLoading, setLoginLoading] = useState(false);
const [showPassword, setShowPassword] = useState(false);

// ✅ New: Handle description input with length validation
const handleDescriptionChange = (e) => {
  const value = e.target.value;
  const count = value.length;
  
  setDescription(value);
  setCharCount(count);
  
  // Check if description exceeds limit
  if (count > MAX_DESCRIPTION_LENGTH) {
    setDescriptionError(true);
  } else {
    setDescriptionError(false);
  }
};


// ✅ New: Handle login form input
const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
  
  if (errors[name]) {
    setErrors(prev => ({ ...prev, [name]: '' }));
  }
};

// ✅ New: Handle login submission
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

// ✅ New: Handle redirect to registration page
const handleRegisterRedirect = () => {
  // Close current login modal
  setShowLogin(false);
  setErrors({});
  
  // Trigger UserAuth component registration button via DOM operation
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() || descriptionError) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/api/requirements`, { description },{headers: { Authorization: `Bearer ${token}` }});
      navigate(`/raos/${res.data.id}`);
    } catch (err) {
      alert('Generation failed: ' + (err.response?.data?.error || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setDescription('');
    setCharCount(0);
    setDescriptionError(false);
  };

  const fillPrompt = (prompt) => {
     // ✅ New: Prevent filling prompt if description would exceed limit
     if (prompt.length > MAX_DESCRIPTION_LENGTH) {
      alert(`Prompt too long! Maximum ${MAX_DESCRIPTION_LENGTH} characters allowed.`);
      return;
    }
    setDescription(prompt);
    setCharCount(prompt.length);
    setDescriptionError(false);
  };

  const isOperationDisabled = loading || descriptionError;




   // Show login prompt for unauthenticated users
   if (!user) {
    return (
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        
        <div style={{
          background: '#f8f9fa',
          padding: '40px',
          borderRadius: '10px',
          border: '2px solid #dee2e6',
          marginTop: '20px'
        }}>
          <h2 style={{ color: '#6c757d', marginBottom: '20px' }}>Welcome to Mini AI App Portal</h2>
          <p style={{ color: '#6c757d', marginBottom: '30px' }}>
            Please login to start creating your app prototypes with AI assistance.
          </p>
          <button
            // ✅ Modified: Changed from DOM operation to direct state setting
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

        {/* ✅ New: Complete login modal */}
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
                {/* ✅ New: Error message display and Create New Account button */}
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


  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>

    {/* Full-screen overlay and prompt during AI analysis */}
    {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          flexDirection: 'column'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '40px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            maxWidth: '400px',
            width: '90%'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px',
              animation: 'spin 1s linear infinite'
            }}>
              🤖
            </div>
            <h3 style={{
              margin: '0 0 10px 0',
              color: '#333',
              fontSize: '24px'
            }}>
              AI Analysis in Progress
            </h3>
            <p style={{
              margin: '0',
              color: '#666',
              fontSize: '16px'
            }}>
              Please wait while we analyze your app idea...
            </p>
            <div style={{
              marginTop: '20px',
              padding: '10px',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#6c757d'
            }}>
              This may take a few moments
            </div>
          </div>
        </div>
      )}

      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '15px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
        marginBottom: '25px'
      }}>
        <h2 style={{
          color: '#2c3e50',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '1.8rem'
        }}>
          <span style={{ fontSize: '1.5rem' }}>🤖</span>
          Describe Your App Idea
        </h2>
        <p style={{ color: '#6c757d', marginBottom: '25px', lineHeight: '1.5' }}>
          Tell us what your app should do. The AI will extract app name, entities, roles and features, and generate a non-functional prototype.
        </p>

                {/* ✅ New: Description length error message */}
                {descriptionError && (
          <div style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <div>
              <strong>Description too long!</strong> Please keep your description under {MAX_DESCRIPTION_LENGTH} characters. 
              Current: {charCount} characters.
            </div>
          </div>
        )}

        {/* Example Prompts */}
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px'
        }}>
          <h4 style={{
            color: '#495057',
            marginBottom: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>💡</span>
            Example Prompts
          </h4>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <span
              onClick={() =>  !isOperationDisabled && fillPrompt('I want an app to manage student courses and grades. Teachers add courses, students enrol, and admins manage reports.')}
              style={{
                background: 'white',
                color: '#495057',
                padding: '8px 15px',
                borderRadius: '20px',
                border: '1px solid #dee2e6',
                cursor: isOperationDisabled ? 'not-allowed' : 'pointer', // ✅ Modified: Disable cursor during analysis
                opacity: isOperationDisabled ? 0.6 : 1, // ✅ New: Semi-transparent during analysis
                fontSize: '0.9rem',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                if (!isOperationDisabled) {
                e.target.style.background = '#667eea';
                e.target.style.color = 'white';
                e.target.style.borderColor = '#667eea';
                }
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'white';
                e.target.style.color = '#495057';
                e.target.style.borderColor = '#dee2e6';
              }}
            >
              Course Management
            </span>
            <span
              onClick={() => !isOperationDisabled &&fillPrompt('I need an app where users can log workouts and meals. Trainers assign workout plans, and nutritionists create meal plans. Admins handle subscriptions.')}
              style={{
                background: 'white',
                color: '#495057',
                padding: '8px 15px',
                borderRadius: '20px',
                border: '1px solid #dee2e6',
                cursor: isOperationDisabled ? 'not-allowed' : 'pointer', // ✅ Modified: Disable cursor during analysis
opacity: isOperationDisabled ? 0.6 : 1, // ✅ New: Semi-transparent during analysis
                fontSize: '0.9rem',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#667eea';
                e.target.style.color = 'white';
                e.target.style.borderColor = '#667eea';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'white';
                e.target.style.color = '#495057';
                e.target.style.borderColor = '#dee2e6';
              }}
            >
              Fitness Tracker App
            </span>
            <span
              onClick={() => !isOperationDisabled && fillPrompt('I want a marketplace where sellers add products, buyers purchase items, and admins manage disputes.')}
              style={{
                background: 'white',
                color: '#495057',
                padding: '8px 15px',
                borderRadius: '20px',
                border: '1px solid #dee2e6',
                cursor: isOperationDisabled ? 'not-allowed' : 'pointer', // ✅ Modified: Disable cursor during analysis
opacity: isOperationDisabled ? 0.6 : 1, // ✅ New: Semi-transparent during analysis
                fontSize: '0.9rem',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#667eea';
                e.target.style.color = 'white';
                e.target.style.borderColor = '#667eea';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'white';
                e.target.style.color = '#495057';
                e.target.style.borderColor = '#dee2e6';
              }}
            >
              Online Marketplace App
            </span>
          </div>
        </div>

        {/* Textarea Container */}
        <div style={{ position: 'relative' }}>
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            disabled={loading} // ✅ New: Disable input during analysis
            placeholder="e.g., I want an app to manage student courses and grades. Teachers add courses, students enrol, and admins manage reports...."
            style={{
              width: '100%',
              height: '200px',
              padding: '15px',
              border: descriptionError ? '2px solid #dc3545' : '2px solid #e9ecef',
              borderRadius: '10px',
              fontSize: '16px',
              fontFamily: 'inherit',
              resize: 'vertical',
              transition: 'border-color 0.3s ease',
              outline: 'none',
              backgroundColor: descriptionError ? '#fff5f5' : 'white'
            }}
            onFocus={(e) => {
              if (!descriptionError) {
              e.target.style.borderColor = '#667eea';
            }
            }}
            onBlur={(e) => {
              e.target.style.borderColor = descriptionError ? '#dc3545' : '#e9ecef';
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: '10px',
            right: '15px',
            color: descriptionError ? '#dc3545' : (charCount > MAX_DESCRIPTION_LENGTH * 0.8 ? '#ffc107' : '#6c757d'),
            fontSize: '0.9rem',
            fontWeight: descriptionError ? 'bold' : 'normal'
          }}>
            {charCount} / {MAX_DESCRIPTION_LENGTH}
          </div>
        </div>

        {/* Form Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
          marginTop: '20px'
        }}>
          <button
            type="button"
            onClick={handleClear}
            disabled={loading} // ✅ New: Disable clear button during analysis
            style={{
              padding: '10px 20px',
              backgroundColor: loading ? '#ccc' : '#6c757d', // ✅ Modified: Show gray during analysis
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer', // ✅ Modified: Disable cursor during analysis
opacity: loading ? 0.6 : 1, // ✅ New: Semi-transparent during analysis
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              if (!loading) { // ✅ New: Only execute when not analyzing
                e.target.style.backgroundColor = '#5a6268';
              }
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#6c757d';
            }}
          >
            <span>🧹</span>
            Clear
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isOperationDisabled || !description.trim()}
            style={{
              padding: '10px 20px',
              backgroundColor: (isOperationDisabled || !description.trim()) ? '#ccc' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: (isOperationDisabled || !description.trim()) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #ffffff',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Analyzing with AI...
              </>
            ) : (
              <>
                <span>✨</span>
                Analyze with AI
              </>
            )}
          </button>
        </div>
      </div>

      {/* Loading Spinner Styles */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}