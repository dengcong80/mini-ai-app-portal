// frontend/src/components/DebugPanel.jsx
import React from 'react';
import { responsive } from '../utils/responsive';
const DebugPanel = ({ data }) => {
  // Format RAOS JSON
  const raosJson = JSON.stringify(
    {
      appName: data.appName,
      entities: data.entities,
      roles: data.roles,
      features: data.features,
      raos: data.raos
    },
    null,
    2
  );

  // Copy RAOS JSON to clipboard
  const copyJson = () => {
    navigator.clipboard.writeText(raosJson);
    alert('RAOS JSON copied to clipboard!');
  };

  return (
    <div style={{ 
      ...responsive.container,
  maxWidth: '1000px', 
  margin: '0 auto 40px', 
  backgroundColor: '#f8f9fa', 
  border: '1px solid #dee2e6', 
  borderRadius: '8px',
  [responsive.mediaQuery('768px')]: {
    padding: '15px',
    borderRadius: '6px'
  },
  [responsive.mediaQuery('480px')]: {
    padding: '10px',
    borderRadius: '4px'
  }
    }}>
      <div style={{  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '15px',
  [responsive.mediaQuery('768px')]: {
    flexDirection: 'column',
    gap: '10px',
    alignItems: 'stretch'
  }
   }}>
        <h3 style={{ color: '#495057', margin: 0 }}>🔍 AI API Response (Debug View)</h3>
        <button 
          onClick={copyJson} 
          style={{ 
            padding: '6px 12px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            [responsive.mediaQuery('480px')]: {
              padding: '8px 16px',
              fontSize: '16px',
              width: '100%'
            }
          }}
        >
          📋 Copy RAOS
        </button>
      </div>

      {/* RAOS JSON */}
      <div style={{ marginBottom: '20px' }}>
        <h4>1. Extracted RAOS (Structured Data)</h4>
        <pre
          style={{
            backgroundColor: '#2d2d2d',
            color: '#f8f8f2',
            padding: '15px',
            borderRadius: '6px',
            overflowX: 'auto',
            fontSize: '14px',
            lineHeight: 1.4,
            [responsive.mediaQuery('768px')]: {
              padding: '12px',
              fontSize: '13px'
            },
            [responsive.mediaQuery('480px')]: {
              padding: '10px',
              fontSize: '12px',
              lineHeight: 1.3
            }
          }}
        >
          {raosJson}
        </pre>
      </div>

      {/* Generated HTML */}
      <div>
        <h4>2. Generated HTML (Mock UI Source)</h4>
        <pre
          style={{
            backgroundColor: '#2d2d2d',
            color: '#a6e22e',
            padding: '15px',
            borderRadius: '6px',
            overflowX: 'auto',
            fontSize: '14px',
            lineHeight: 1.4,
            whiteSpace: 'pre-wrap',
            [responsive.mediaQuery('768px')]: {
              padding: '12px',
              fontSize: '13px'
            },
            [responsive.mediaQuery('480px')]: {
              padding: '10px',
              fontSize: '12px',
              lineHeight: 1.3
            }
          }}
        >
          {data.mockHtml}
        </pre>
      </div>
    </div>
  );
};

export default DebugPanel;