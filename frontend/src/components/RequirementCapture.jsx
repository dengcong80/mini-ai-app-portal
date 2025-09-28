// frontend/src/components/RequirementCapture.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RequirementCapture = () => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    try {
      // Only call extractRAOS, don't generate HTML
      const res = await axios.post('/api/requirements', { description });
      // Navigate to RAOS page
      navigate(`/raos/${res.data.id}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to extract RAOS');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>📝 Describe Your App</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., I want a task app where managers can assign tasks..."
          rows="5"
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <br />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Extracting RAOS...' : 'Generate Prototype'}
        </button>
      </form>
    </div>
  );
};

export default RequirementCapture;