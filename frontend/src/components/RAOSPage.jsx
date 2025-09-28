import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RAOSPage = ({ user }) => {
  const [requirement, setRequirement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState(false); // New: editing state
  const [editData, setEditData] = useState({ // New: edit data state
    appName: '',
    roles: [],
    entities: [],
    raos: []
  });
  const [saving, setSaving] = useState(false); // New: saving state
  const { id } = useParams();
  const navigate = useNavigate();

  const fetchRequirement = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/requirements/${id}`);
     // console.log('Fetched requirement:', res.data);
     // console.log('Created by:', res.data.createdBy);
     // console.log('Current user:', user);
      setRequirement(res.data);
      
      // Initialize edit data
      setEditData({
        appName: res.data.appName || '',
        roles: res.data.roles || [],
        entities: res.data.entities || [],
        raos: res.data.raos || []
      });
    } catch (err) {
      console.error('Error fetching requirement:', err);
      setError('Failed to load requirement');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchRequirement();
  }, [fetchRequirement]);

  const handleGenerateUI = async () => {
    // If in editing state, confirm whether to save first
    if (editing) {
      const shouldSave = window.confirm(
        'You have unsaved changes. Do you want to save them before generating UI?'
      );
      
      if (shouldSave) {
        // Save edited content first
        setSaving(true);
        try {
          const res = await axios.put(`/api/requirements/${id}`, editData, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          });
          setRequirement(res.data);
          setEditing(false);
         // console.log('Changes saved successfully before generating UI');
        } catch (err) {
          console.error('Error saving before generating UI:', err);
          alert('Failed to save changes: ' + (err.response?.data?.error || err.message));
          setSaving(false);
          return; // Save failed, do not continue generating UI
        } finally {
          setSaving(false);
        }
      } else {
        // User chose not to save, cancel editing state
        setEditing(false);
      }
    }
  
    // Generate UI
    setGenerating(true);
    try {
      await axios.post(`/api/requirements/${id}/generate-ui`);
      navigate(`/mock/${id}`);
    } catch (err) {
      console.error('Error generating UI:', err);
      alert('Failed to generate UI: ' + (err.response?.data?.error || err.message));
    } finally {
      setGenerating(false);
    }
  };

  // New: handle edit data changes
  const handleEditChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // New: handle role changes
  const handleRoleChange = (index, value) => {
    const newRoles = [...editData.roles];
    newRoles[index] = value;
    handleEditChange('roles', newRoles);
  };

  // New: add role
  const addRole = () => {
    handleEditChange('roles', [...editData.roles, '']);
  };

  // New: remove role
  const removeRole = (index) => {
    const newRoles = editData.roles.filter((_, i) => i !== index);
    handleEditChange('roles', newRoles);
  };

  // New: handle entity changes
  const handleEntityChange = (index, value) => {
    const newEntities = [...editData.entities];
    newEntities[index] = value;
    handleEditChange('entities', newEntities);
  };

  // New: add entity
  const addEntity = () => {
    handleEditChange('entities', [...editData.entities, '']);
  };

  // New: remove entity
  const removeEntity = (index) => {
    const newEntities = editData.entities.filter((_, i) => i !== index);
    handleEditChange('entities', newEntities);
  };

  // New: handle RAOS changes
  const handleRaoChange = (index, field, value) => {
    const newRaos = [...editData.raos];
    newRaos[index] = { ...newRaos[index], [field]: value };
    handleEditChange('raos', newRaos);
  };

  // New: add RAOS
  const addRao = () => {
    handleEditChange('raos', [...editData.raos, {
      role: '',
      action: '',
      object: '',
      supplementary: ''
    }]);
  };

  // New: remove RAOS
  const removeRao = (index) => {
    const newRaos = editData.raos.filter((_, i) => i !== index);
    handleEditChange('raos', newRaos);
  };

  // New: save edit
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await axios.put(`/api/requirements/${id}`, editData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setRequirement(res.data);
      setEditing(false);
      alert('Updated successfully!');
    } catch (err) {
      console.error('Error saving:', err);
      alert('Failed to save: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  // New: cancel edit
  const handleCancel = () => {
    setEditData({
      appName: requirement.appName || '',
      roles: requirement.roles || [],
      entities: requirement.entities || [],
      raos: requirement.raos || []
    });
    setEditing(false);
  };

  // Check if user has permission to generate UI (only creator can generate UI)
  const canGenerateUI = (() => {
    if (!user) {
      //console.log('No user logged in');
      return false;
    }
    if (!requirement) {
      //console.log('No requirement loaded');
      return false;
    }
    if (!requirement.createdBy) {
      //console.log('No createdBy field in requirement');
      return false;
    }
    
    const userId = user.id || user._id;
    let creatorId;
    
    // Handle case where createdBy might be string or object
    if (typeof requirement.createdBy === 'string') {
      creatorId = requirement.createdBy;
    } else if (typeof requirement.createdBy === 'object') {
      creatorId = requirement.createdBy._id || requirement.createdBy.id;
    }
    
    //console.log('User ID:', userId);
    //console.log('Creator ID:', creatorId);
    //console.log('CreatedBy type:', typeof requirement.createdBy);
    //console.log('CreatedBy value:', requirement.createdBy);
    //console.log('IDs match:', userId === creatorId);
    
    return userId === creatorId;
  })();

  // Check if in In Process status (has RAOS but no UI)
  const isInProcess = requirement && requirement.raos && requirement.raos.length > 0 && !requirement.mockHtml;

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
       {/* Overlay and prompt during UI generation */}
    {generating && (
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
            🔄
          </div>
          <h3 style={{
            margin: '0 0 10px 0',
            color: '#333',
            fontSize: '24px'
          }}>
            Generating UI
          </h3>
          <p style={{
            margin: '0',
            color: '#666',
            fontSize: '16px'
          }}>
            Please wait while we generate your UI mockup...
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

      
      
      <div style={{ marginBottom: '30px' }}>
        <h2>📋 RAOS Analysis</h2>
        <h3 style={{ color: '#6c757d', margin: '0' }}>
          APP Name: <strong>{requirement.appName}</strong>
        </h3>
        {requirement.createdBy && (
          <h3 style={{ color: '#6c757d', margin: '5px 0 0 0', fontSize: '0.9rem' }}>
            Created by: {requirement.createdBy.realName || requirement.createdBy.username} 
            {requirement.createdBy.avatar && ` ${requirement.createdBy.avatar}`}
          </h3>
        )}
        {/* User's original input content */}
<div style={{ marginBottom: '30px' }}>
  <h4 style={{ color: '#6c757d', margin: '5px 0 0 0', fontSize: '0.9rem' }}>Description:</h4>
  <div style={{
    backgroundColor: '#f8f9fa',
    border: '1px solid #e9ecef',
    borderRadius: '8px',
    padding: '15px',
    marginTop: '8px'
  }}>
    <p style={{ 
      margin: '0', 
      color: '#495057', 
      lineHeight: '1.6',
      fontSize: '14px',
      fontStyle: 'italic'
    }}>
      {requirement.userDescription || requirement.appDescription || 'No description available'}
    </p>
  </div>
  <p style={{ 
    fontSize: '12px', 
    color: '#6c757d', 
    margin: '8px 0 0 0',
    fontStyle: 'italic'
  }}>
    This is what you originally described when creating this prototype
  </p>
</div>
      </div>

     {/* Edit mode toggle button - disabled during UI generation */}
    {canGenerateUI && isInProcess && !generating && (
      <div style={{ marginBottom: '20px', textAlign: 'right' }}>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ✏️ Edit
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              onClick={handleCancel}
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
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: saving ? 'not-allowed' : 'pointer'
              }}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>
    )}
  {/* Show disabled editing prompt during UI generation */}
  {generating && (
      <div style={{
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '6px',
        textAlign: 'center'
      }}>
        <p style={{ margin: '0', color: '#856404', fontWeight: '500' }}>
          🔒 Editing is disabled while generating UI. Please wait...
        </p>
      </div>
    )}
      {/* APP Name */}
      <div style={{ marginBottom: '30px' }}>
      <h3>App Name</h3>
      {editing && !generating ? (
        <input
          type="text"
          value={editData.appName}
          onChange={(e) => handleEditChange('appName', e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px'
          }}
          placeholder="Enter app name"
        />
      ) : (
        <p style={{ fontSize: '18px', fontWeight: 'bold', margin: '0' }}>
          {requirement.appName}
        </p>
      )}
    </div>

      {/* Roles */}
      <div style={{ marginBottom: '30px' }}>
      <h3>Roles</h3>
      {editing && !generating ? (
        <div>
          {editData.roles.map((role, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                type="text"
                value={role}
                onChange={(e) => handleRoleChange(index, e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
                placeholder="Enter role"
              />
              <button
                onClick={() => removeRole(index)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={addRole}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            + Add Role
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {requirement.roles.map((role, index) => (
            <span
              key={index}
              style={{
                padding: '8px 16px',
                backgroundColor: '#e3f2fd',
                color: '#1976d2',
                borderRadius: '20px',
                fontSize: '14px'
              }}
            >
              {role}
            </span>
          ))}
        </div>
      )}
    </div>


      {/* Entities */}
      <div style={{ marginBottom: '30px' }}>
      <h3>Entities</h3>
      {editing && !generating ? (
        <div>
          {editData.entities.map((entity, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                type="text"
                value={entity}
                onChange={(e) => handleEntityChange(index, e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
                placeholder="Enter entity"
              />
              <button
                onClick={() => removeEntity(index)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={addEntity}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            + Add Entity
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {requirement.entities.map((entity, index) => (
            <span
              key={index}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f3e5f5',
                color: '#7b1fa2',
                borderRadius: '20px',
                fontSize: '14px'
              }}
            >
              {entity}
            </span>
          ))}
        </div>
      )}
    </div>

      {/* RAOS Behaviors */}
      <div style={{ marginBottom: '30px' }}>
      <h3>RAOS Behaviors</h3>
      {editing && !generating ? (
        <div>
          {editData.raos.map((rao, index) => (
            <div key={index} style={{ 
              border: '1px solid #ddd', 
              borderRadius: '8px', 
              padding: '15px', 
              marginBottom: '15px',
              backgroundColor: '#f9f9f9'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Role:</label>
                  <input
                    type="text"
                    value={rao.role}
                    onChange={(e) => handleRaoChange(index, 'role', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                    placeholder="Enter role"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Action:</label>
                  <input
                    type="text"
                    value={rao.action}
                    onChange={(e) => handleRaoChange(index, 'action', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                    placeholder="Enter action"
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Object:</label>
                  <input
                    type="text"
                    value={rao.object}
                    onChange={(e) => handleRaoChange(index, 'object', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                    placeholder="Enter object"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Supplementary:</label>
                  <input
                    type="text"
                    value={rao.supplementary}
                    onChange={(e) => handleRaoChange(index, 'supplementary', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                    placeholder="Enter supplementary"
                  />
                </div>
              </div>
              <button
                onClick={() => removeRao(index)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Remove RAOS
              </button>
            </div>
          ))}
          <button
            onClick={addRao}
            style={{
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            + Add RAOS
          </button>
        </div>
      ) : (
        <div>
          {requirement.raos.map((rao, index) => (
            <div key={index} style={{ 
              border: '1px solid #ddd', 
              borderRadius: '8px', 
              padding: '15px', 
              marginBottom: '15px',
              backgroundColor: '#f9f9f9'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <strong>Role:</strong> {rao.role}
                </div>
                <div>
                  <strong>Action:</strong> {rao.action}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <strong>Object:</strong> {rao.object}
                </div>
                <div>
                  <strong>Supplementary:</strong> {rao.supplementary}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    <div style={{ 
      display: 'flex', 
      gap: '15px', 
      justifyContent: 'flex-end',
      alignItems: 'center',
      paddingTop: '20px',
      borderTop: '1px solid #e9ecef'
    }}>
      <button
        onClick={() => navigate('/dashboard')}
        disabled={generating} // Disable back button during UI generation
        style={{
          padding: '10px 20px',
          backgroundColor: generating ? '#6c757d' : '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: generating ? 'not-allowed' : 'pointer',
          opacity: generating ? 0.6 : 1
        }}
      >
        ← Back to Dashboard
      </button>
      
      {requirement.mockHtml ? (
        <button
          onClick={() => navigate(`/mock/${id}`)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          🎨 View UI
        </button>
      ) : (
        canGenerateUI ? (
          <button
            onClick={handleGenerateUI}
            disabled={generating || saving}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: (generating || saving) ? 'not-allowed' : 'pointer'
            }}
          >
            {generating ? '🔄 Generating...' : saving ? '💾 Saving...' : '🎨 Generate UI'}
          </button>
        ) : (
          <div style={{
            padding: '10px 20px',
            backgroundColor: '#f8f9fa',
            color: '#6c757d',
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            🔒 Only creator can generate UI
          </div>
        )
      )}
    </div>

    {/* Add CSS animation */}
    <style>
      {`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}
    </style>
  </div>
);
};

export default RAOSPage;