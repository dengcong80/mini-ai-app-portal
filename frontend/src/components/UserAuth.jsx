import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { responsive } from '../utils/responsive';
const UserAuth = ({ onLogin, onLogout, user }) => {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    realName: '',
    dateOfBirth: '',
    description: '',
    avatar: '👤'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [usernameCheck, setUsernameCheck] = useState(null);
  const [avatars, setAvatars] = useState([]);
  const [avatarLoading, setAvatarLoading] = useState(true);
  
  // Add password display state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fallback avatar options (used when API fails)
  const fallbackAvatars =  useMemo(() => [
    '👤', '👨', '👩', '🧑', '👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓',
    '👨‍🔬', '👩‍🔬', '👨‍💻', '👩‍💻', '👨‍🎨', '👩‍🎨', '👨‍🚀', '👩‍🚀'
  ], []);

  // Define API base URL
  /**const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://your-production-api.com' 
    : 'http://localhost:5000'; **/

  useEffect(() => {
    // Get avatar options
    const fetchAvatars = async () => {
      try {
        setAvatarLoading(true);
        //console.log('Fetching avatars from API...');
        const res = await axios.get(`${API_BASE_URL}/api/users/avatars`);
        //console.log('Avatar API response:', res.data);
        setAvatars(res.data.avatars || fallbackAvatars);
      } catch (err) {
        console.error('Failed to load avatars from API, using fallback:', err);
        setAvatars(fallbackAvatars); // Use fallback options
      } finally {
        setAvatarLoading(false);
      }
    };

    fetchAvatars();
  }, [fallbackAvatars]);




  // Add useEffect in UserAuth component to show initial validation prompts
useEffect(() => {
    if (showRegister) {
      // When registration modal opens, show initial validation prompts
      const initialErrors = {};
      if (!formData.username) initialErrors.username = 'Username is required';
      if (!formData.realName) initialErrors.realName = 'Real name is required';
      if (!formData.dateOfBirth) initialErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.password) initialErrors.password = 'Password is required';
      if (!formData.confirmPassword) initialErrors.confirmPassword = 'Please confirm your password';
      
      setErrors(initialErrors);
    }
  }, [showRegister, formData.username, formData.realName, formData.dateOfBirth, formData.password, formData.confirmPassword]);

  // Check username availability
  const checkUsername = async (username) => {
    if (username.length < 3) {
      setUsernameCheck(null);
      return;
    }
    
    try {
      const res = await axios.get(`${API_BASE_URL}/api/users/check-username/${username}`);
      setUsernameCheck(res.data);
    } catch (err) {
      console.error('Username check failed:', err);
      // When API fails, don't block user registration, just show warning
      setUsernameCheck({ 
        available: true, // Allow registration, let backend validate
        message: 'Unable to check username availability - will be verified during registration',
        warning: true
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear related errors
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  
    // Real-time validation for each field
    const newErrors = { ...errors };
  
    // Username validation
    if (name === 'username') {
      checkUsername(value);
      
      if (value.length > 0 && value.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      } else if (value.length > 20) {
        newErrors.username = 'Username must be no more than 20 characters';
      } else if (value.length >= 3 && value.length <= 20) {
        delete newErrors.username;
      }
    }
  
    // Real name validation
    if (name === 'realName') {
      if (value.length > 0 && value.trim().length < 2) {
        newErrors.realName = 'Real name must be at least 2 characters';
      } else if (value.trim().length >= 2) {
        delete newErrors.realName;
      }
    }
  
    // Password validation
    if (name === 'password') {
      if (value.length > 0 && value.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      } else if (value.length >= 6) {
        delete newErrors.password;
      }
      
      // If confirm password is filled, re-check match
      if (formData.confirmPassword) {
        if (value !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        } else {
          delete newErrors.confirmPassword;
        }
      }
    }
  
    // Confirm password validation
    if (name === 'confirmPassword') {
      if (value.length > 0 && value !== formData.password) {
        newErrors.confirmPassword = 'Passwords do not match';
      } else if (value === formData.password && value.length > 0) {
        delete newErrors.confirmPassword;
      }
    }
  
    // Date of birth validation
    if (name === 'dateOfBirth') {
      if (value) {
        const birthDate = new Date(value);
        const today = new Date();
        if (birthDate >= today) {
          newErrors.dateOfBirth = 'Date of birth must be in the past';
        } else if (today.getFullYear() - birthDate.getFullYear() > 120) {
          newErrors.dateOfBirth = 'Please enter a valid date of birth';
        } else {
          delete newErrors.dateOfBirth;
        }
      }
    }
  
    // Description validation
    if (name === 'description') {
      if (value.length > 500) {
        newErrors.description = 'Description must be no more than 500 characters';
      } else {
        delete newErrors.description;
      }
    }
  
    setErrors(newErrors);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
  
    try {
      const res = await axios.post(`${API_BASE_URL}/api/users/login`, formData);
  
      localStorage.setItem('token', res.data.token);
      onLogin(res.data.user);
      setShowLogin(false);
      setFormData({
        username: '',
        password: '',
        confirmPassword: '',
        realName: '',
        dateOfBirth: '',
        description: '',
        avatar: '👤'
      });
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response);
      console.error('Error status:', err.response?.status);
      console.error('Error data:', err.response?.data);
      if (err.response?.status === 401) {
        setErrors({ 
          general: 'Invalid credentials. User not found. Would you like to create a new account?',
          showCreateAccount: true 
        });
      } else if (err.response?.status === 400) {
        setErrors({ general: err.response.data.error });
      } else {
        setErrors({ general: 'Login failed. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleRegisterRedirect = () => {
    //console.log('handleRegisterRedirect called'); // Add debug log
    //console.log('Before: showLogin =', showLogin, 'showRegister =', showRegister);

    setShowLogin(false);
    setShowRegister(true);
    setErrors(prev => ({ ...prev, general: '' }));
    // Clear login form
    setFormData({
      username: '',
      password: '',
      confirmPassword: '',
      realName: '',
      dateOfBirth: '',
      description: '',
      avatar: '👤'
    });
    //console.log('showRegister should be true now'); // Add debug log
  };
  
  
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

     // Client-side validation
  const newErrors = {};
// Validate required fields
if (!formData.username.trim()) {
    newErrors.username = 'Username is required';
  }
  if (!formData.realName.trim()) {
    newErrors.realName = 'Real name is required';
  }
  if (!formData.dateOfBirth) {
    newErrors.dateOfBirth = 'Date of birth is required';
  }
  if (!formData.password) {
    newErrors.password = 'Password is required';
  }
  if (!formData.confirmPassword) {
    newErrors.confirmPassword = 'Please confirm your password';
  }


    // Validate password match
  if (formData.password !== formData.confirmPassword) {
    newErrors.confirmPassword = 'Passwords do not match';
  }

  // Validate password length
  if (formData.password && formData.password.length < 6) {
    newErrors.password = 'Password must be at least 6 characters';
  }

  // Validate username length
  if (formData.username && (formData.username.length < 3 || formData.username.length > 20)) {
    newErrors.username = 'Username must be 3-20 characters';
  }

  // Validate real name length
  if (formData.realName && formData.realName.trim().length < 2) {
    newErrors.realName = 'Real name must be at least 2 characters';
  }

  // Validate date of birth
  if (formData.dateOfBirth) {
    const birthDate = new Date(formData.dateOfBirth);
    const today = new Date();
    if (birthDate >= today) {
      newErrors.dateOfBirth = 'Date of birth must be in the past';
    }
  }

  // Validate description length
  if (formData.description && formData.description.length > 500) {
    newErrors.description = 'Description must be no more than 500 characters';
  }

  // If there are client-side validation errors, show errors and stop submission
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    setLoading(false);
    return;
  }


    try {
      const res = await axios.post(`${API_BASE_URL}/api/users/register`, formData);

      localStorage.setItem('token', res.data.token);
      onLogin(res.data.user);
      setShowRegister(false);
      setFormData({
        username: '',
        password: '',
        confirmPassword: '',
        realName: '',
        dateOfBirth: '',
        description: '',
        avatar: '👤'
      });
    } catch (err) {
        console.error('Registration error:', err);
    
        // Handle specific errors returned by server
        if (err.response?.data?.error) {
          setErrors({ general: err.response.data.error });
        } else if (err.response?.status === 400) {
          setErrors({ general: 'Please check your input and try again' });
        } else if (err.response?.status === 500) {
          setErrors({ general: 'Server error. Please try again later.' });
        } else {
          setErrors({ general: 'Registration failed. Please check your connection and try again.' });
        }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
  };

  if (user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '1.5rem' }}>{user.avatar}</span>
        <span>Welcome, {user.username}</span>
        <button
          onClick={handleLogout}
          style={{
            padding: '6px 12px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>
    );
  }

  // Add debug information at component top
//console.log('Current showLogin:', showLogin);
//console.log('Current showRegister:', showRegister);
  return (
    <div data-testid="user-auth" style={{ display: 'flex', gap: '10px' }}>
      <button
        onClick={() => setShowLogin(true)}
        style={{
          padding: '8px 16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Login
      </button>
      <button
        onClick={() => setShowRegister(true)}
        style={{
          padding: '8px 16px',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Register
      </button>

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
            maxWidth: '90vw',
            [responsive.mediaQuery('768px')]: {
              padding: '25px',
              borderRadius: '8px',
              width: '350px'
            },
            [responsive.mediaQuery('480px')]: {
              padding: '20px',
              borderRadius: '6px',
              width: '320px'
            }
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
                  style={responsive.input}
                  required
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    style={{
                      ...responsive.input,
                      padding: '10px 40px 10px 10px'
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
                      fontSize: '16px',
                      padding: '0',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

               {/* Add registration redirect button in login modal */}
               {errors.general && (
  <div style={{
    color: errors.showCreateAccount ? '#007bff' : '#dc3545',
    backgroundColor: errors.showCreateAccount ? '#e3f2fd' : '#f8d7da',
    border: errors.showCreateAccount ? '1px solid #bbdefb' : '1px solid #f5c6cb',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '15px',
    textAlign: 'center'
  }}>
    {errors.general}
     {console.log('errors.showCreateAccount:', errors.showCreateAccount)}
    {errors.showCreateAccount && (
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
            fontSize: '14px',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#0056b3';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#007bff';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          Create New Account
        </button>
      </div>
    )}
  </div>
)}
              <div style={responsive.buttonGroup}>
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
                  disabled={loading}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegister && (
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
            width: '500px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
            [responsive.mediaQuery('768px')]: {
              padding: '25px',
              borderRadius: '8px',
              width: '450px'
            },
            [responsive.mediaQuery('480px')]: {
              padding: '20px',
              borderRadius: '6px',
              width: '350px'
            }
          }}>
            <h3>Register</h3>
            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: '15px' }}>
                <input
                  type="text"
                  name="username"
                  placeholder="Username (3-20 characters)"
                  value={formData.username}
                  onChange={handleInputChange}
                  style={{
                     ...responsive.input,
                     border: errors.username ? '1px solid red' : '1px solid #ddd'
                  }}
                  required
                />
                 {errors.username && (
    <div style={{ color: 'red', fontSize: '0.9rem', marginTop: '5px' }}>
      {errors.username}
    </div>
  )}
                {usernameCheck && (
                  <div style={{
                    color: usernameCheck.warning ? '#ff9800' : (usernameCheck.available ? 'green' : 'red'),
                    fontSize: '0.9rem',
                    marginTop: '5px'
                  }}>
                    {usernameCheck.message}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '15px' }}>
                <input
                  type="text"
                  name="realName"
                  placeholder="Real Name"
                  value={formData.realName}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: errors.realName ? '1px solid red' : '1px solid #ddd',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                  required
                />
                  {errors.realName && (
    <div style={{ color: 'red', fontSize: '0.9rem', marginTop: '5px' }}>
      {errors.realName}
    </div>
  )}
              </div>

              <div style={{ marginBottom: '15px' }}>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: errors.dateOfBirth ? '1px solid red' : '1px solid #ddd',
                    borderRadius: '4px',
                    boxSizing: 'border-box'
                  }}
                  required
                />
                  {errors.dateOfBirth && (
    <div style={{ color: 'red', fontSize: '0.9rem', marginTop: '5px' }}>
      {errors.dateOfBirth}
    </div>
  )}
              </div>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password (min 6 characters)"
                    value={formData.password}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px 40px 10px 10px',
                      border: errors.password ? '1px solid red' : '1px solid #ddd',
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
                      fontSize: '16px',
                      padding: '0',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.password && (
    <div style={{ color: 'red', fontSize: '0.9rem', marginTop: '5px' }}>
      {errors.password}
    </div>
  )}
              </div>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '10px 40px 10px 10px',

                      border: errors.confirmPassword ? '1px solid red' : '1px solid #ddd',
                      borderRadius: '4px',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '16px',
                      padding: '0',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {showConfirmPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div style={{ color: 'red', fontSize: '0.9rem', marginTop: '5px' }}>
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '15px' }}>
                <textarea
                  name="description"
                  placeholder="Brief description about yourself (optional)"
                  value={formData.description}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: errors.description ? '1px solid red' : '1px solid #ddd',
                    borderRadius: '4px',
                    height: '60px',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
                  {errors.description && (
    <div style={{ color: 'red', fontSize: '0.9rem', marginTop: '5px' }}>
      {errors.description}
    </div>
  )}
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Choose Avatar:</label>
                {avatarLoading ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    Loading avatars...
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {avatars.map((avatar, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, avatar }))}
                        style={{
                          padding: '8px',
                          border: formData.avatar === avatar ? '2px solid #007bff' : '1px solid #ddd',
                          borderRadius: '4px',
                          backgroundColor: formData.avatar === avatar ? '#e3f2fd' : 'white',
                          cursor: 'pointer',
                          fontSize: '1.2rem'
                        }}
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div style={responsive.buttonGroup}>
                <button
                  type="button"
                  onClick={() => setShowRegister(false)}
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
                  disabled={
                    loading || 
                    errors.username || 
                    errors.realName || 
                    errors.password || 
                    errors.confirmPassword || 
                    errors.dateOfBirth ||
                    errors.description ||
                    !formData.username ||
                    !formData.realName ||
                    !formData.password ||
                    !formData.confirmPassword ||
                    !formData.dateOfBirth ||
                    formData.password !== formData.confirmPassword
                  }
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Creating Account...' : 'Register'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


export default UserAuth;

