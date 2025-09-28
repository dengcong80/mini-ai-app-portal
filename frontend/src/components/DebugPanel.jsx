// frontend/src/components/DebugPanel.jsx
import React from 'react';

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
      maxWidth: '1000px', 
      margin: '0 auto 40px', 
      padding: '20px', 
      backgroundColor: '#f8f9fa', 
      border: '1px solid #dee2e6', 
      borderRadius: '8px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
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
            fontSize: '14px'
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
            lineHeight: 1.4
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
            whiteSpace: 'pre-wrap'
          }}
        >
          {data.mockHtml}
        </pre>
      </div>
    </div>
  );
};

export default DebugPanel;