// frontend/src/components/MockUIPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DOMPurify from 'dompurify';
import API_BASE_URL from '../config/api';
import { responsive } from '../utils/responsive';
export default function MockUIPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [html, setHtml] = useState('');
  const [viewMode, setViewMode] = useState('ui'); // 'ui' or 'html'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/api/requirements/${id}`)
      .then(res => {
        setHtml(DOMPurify.sanitize(res.data.mockHtml || ''));
        setLoading(false);
      })
      .catch(() => {
        navigate('/');
        setLoading(false);
      });
  }, [id, navigate]);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px' }}>Loading Mock UI...</div>
      </div>
    );
  }

  return (
    <div style={responsive.container}>
      {/* Navigation buttons */}
      <div style={{  marginBottom: '20px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  [responsive.mediaQuery('768px')]: {
    flexDirection: 'column',
    gap: '15px',
    alignItems: 'stretch'
  } }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ← Back
        </button>

        {/* Toggle buttons */}
        <div style={{ display: 'flex',
  gap: '10px',
  [responsive.mediaQuery('480px')]: {
    flexDirection: 'column',
    gap: '8px'
  } }}>
          <button
            onClick={() => setViewMode('ui')}
            style={{
              padding: '10px 20px',
              backgroundColor: viewMode === 'ui' ? '#007bff' : '#e9ecef',
              color: viewMode === 'ui' ? 'white' : '#333',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            🖼️ UI Preview
          </button>
          <button
            onClick={() => setViewMode('html')}
            style={{
              padding: '10px 20px',
              backgroundColor: viewMode === 'html' ? '#007bff' : '#e9ecef',
              color: viewMode === 'html' ? 'white' : '#333',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            📄 HTML Code
          </button>
        </div>
      </div>

      {/* Content area */}
      {viewMode === 'ui' ? (
        // UI preview mode
        <div  lang="en"
          style={{
            ...responsive.card,
            border: '1px solid #ddd',
            backgroundColor: 'white',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            minHeight: '400px'
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        // HTML code mode
        <div style={{
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '15px' 
          }}>
            <h3 style={{ margin: 0, color: '#495057' }}>📄 Generated HTML Code</h3>
            <button
              onClick={() => {
                navigator.clipboard.writeText(html);
                alert('HTML code copied to clipboard!');
              }}
              style={{
                padding: '6px 12px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              📋 Copy Code
            </button>
          </div>
          
          <pre style={{
            backgroundColor: '#2d2d2d',
            color: '#a6e22e',
            padding: '20px',
            borderRadius: '6px',
            overflowX: 'auto',
            fontSize: '14px',
            lineHeight: 1.4,
            whiteSpace: 'pre-wrap',
            maxHeight: '600px',
            overflow: 'auto',
            margin: 0
          }}>
            {html}
          </pre>
        </div>
      )}

      {/* Bottom information */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#e9ecef', 
        borderRadius: '6px',
        fontSize: '14px',
        color: '#6c757d'
      }}>
        <strong>💡 Tip:</strong> Use the toggle buttons above to switch between UI preview and HTML code view. 
        You can copy the HTML code to use in your own projects.
      </div>
    </div>
  );
}