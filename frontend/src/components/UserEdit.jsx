import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const UserEdit = ({ user, onUpdate, onLogout }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
      username: '',
      realName: '',
      dateOfBirth: '',
      description: '',
      avatar: '👤'
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [avatars, setAvatars] = useState([]);
    const [avatarLoading, setAvatarLoading] = useState(true);

 // Use useMemo to wrap fallbackAvatars
 const fallbackAvatars = useMemo(() => [
    '👤', '👨', '👩', '🧑', '👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓',
    '👨‍🔬', '👩‍🔬', '👨‍💻', '👩‍💻', '👨‍🎨', '👩‍🎨', '👨‍🚀', '👩‍🚀'
  ], []);

  // Define API base URL
  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://your-production-api.com' 
    : 'http://localhost:5000';

  useEffect(() => {
    // Initialize form data
    if (user) {
      setFormData({
        username: user.username || '',
        realName: user.realName || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
        description: user.description || '',
        avatar: user.avatar || '👤'
      });
    }

    // Get avatar options
    const fetchAvatars = async () => {
      try {
        setAvatarLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/users/avatars`);
        setAvatars(res.data.avatars || fallbackAvatars);
      } catch (err) {
        console.error('Failed to load avatars from API, using fallback:', err);
        setAvatars(fallbackAvatars);
      } finally {
        setAvatarLoading(false);
      }
    };

    fetchAvatars();
  }, [user, API_BASE_URL, fallbackAvatars]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear related errors
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Real-time validation
    const newErrors = { ...errors };

    // Username validation
    if (name === 'username') {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Client-side validation
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (!formData.realName.trim()) {
      newErrors.realName = 'Real name is required';
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_BASE_URL}/api/users/me`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      onUpdate(res.data.user);
      alert('Profile updated successfully!');
      navigate('/');
    } catch (err) {
      console.error('Update error:', err);
      
      if (err.response?.data?.error) {
        setErrors({ general: err.response.data.error });
      } else if (err.response?.status === 400) {
        setErrors({ general: 'Please check your input and try again' });
      } else if (err.response?.status === 500) {
        setErrors({ general: 'Server error. Please try again later.' });
      } else {
        setErrors({ general: 'Update failed. Please check your connection and try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      localStorage.removeItem('token');
      onLogout();
      alert('Account deleted successfully.');
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete account. Please try again.');
    }
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '40px',
      background: 'white',
      borderRadius: '15px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        <h2 style={{
          fontSize: '2rem',
          color: '#2c3e50',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '1.5rem' }}>✏️</span>
          Edit Profile
        </h2>
        <p style={{
          color: '#6c757d',
          fontSize: '1.1rem',
          margin: '0'
        }}>
          Update your personal information
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '600',
            color: '#495057'
          }}>
            Username *
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '12px 15px',
              border: errors.username ? '2px solid #dc3545' : '2px solid #dee2e6',
              borderRadius: '8px',
              fontSize: '1rem',
              boxSizing: 'border-box',
              transition: 'border-color 0.3s ease'
            }}
            placeholder="Enter your username"
            required
          />
          {errors.username && (
            <div style={{ color: '#dc3545', fontSize: '0.9rem', marginTop: '5px' }}>
              {errors.username}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '600',
            color: '#495057'
          }}>
            Real Name *
          </label>
          <input
            type="text"
            name="realName"
            value={formData.realName}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '12px 15px',
              border: errors.realName ? '2px solid #dc3545' : '2px solid #dee2e6',
              borderRadius: '8px',
              fontSize: '1rem',
              boxSizing: 'border-box',
              transition: 'border-color 0.3s ease'
            }}
            placeholder="Enter your real name"
            required
          />
          {errors.realName && (
            <div style={{ color: '#dc3545', fontSize: '0.9rem', marginTop: '5px' }}>
              {errors.realName}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '600',
            color: '#495057'
          }}>
            Date of Birth *
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '12px 15px',
              border: errors.dateOfBirth ? '2px solid #dc3545' : '2px solid #dee2e6',
              borderRadius: '8px',
              fontSize: '1rem',
              boxSizing: 'border-box',
              transition: 'border-color 0.3s ease'
            }}
            required
          />
          {errors.dateOfBirth && (
            <div style={{ color: '#dc3545', fontSize: '0.9rem', marginTop: '5px' }}>
              {errors.dateOfBirth}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '600',
            color: '#495057'
          }}>
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            style={{
              width: '100%',
              padding: '12px 15px',
              border: errors.description ? '2px solid #dc3545' : '2px solid #dee2e6',
              borderRadius: '8px',
              fontSize: '1rem',
              height: '100px',
              resize: 'vertical',
              boxSizing: 'border-box',
              transition: 'border-color 0.3s ease'
            }}
            placeholder="Tell us about yourself (optional)"
          />
          {errors.description && (
            <div style={{ color: '#dc3545', fontSize: '0.9rem', marginTop: '5px' }}>
              {errors.description}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '600',
            color: '#495057'
          }}>
            Choose Avatar
          </label>
          {avatarLoading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
              Loading avatars...
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {avatars.map((avatar, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, avatar }))}
                  style={{
                    padding: '10px',
                    border: formData.avatar === avatar ? '3px solid #007bff' : '2px solid #dee2e6',
                    borderRadius: '8px',
                    backgroundColor: formData.avatar === avatar ? '#e3f2fd' : 'white',
                    cursor: 'pointer',
                    fontSize: '1.5rem',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {avatar}
                </button>
              ))}
            </div>
          )}
        </div>

        {errors.general && (
          <div style={{
            color: '#dc3545',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {errors.general}
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            type="submit"
            disabled={loading || Object.keys(errors).some(key => errors[key])}
            style={{
              padding: '12px 30px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>

          <button
            type="button"
            onClick={handleDeleteAccount}
            style={{
              padding: '12px 30px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Delete Account
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserEdit;