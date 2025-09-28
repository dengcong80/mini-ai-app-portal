import React from 'react';
import DOMPurify from 'dompurify';

const MockAppUI = ({ data }) => {
  const cleanHtml = DOMPurify.sanitize(data.mockHtml || '');

  return (
    <div style={{ padding: '20px' }}>
      <h2>🎨 Generated Mock UI</h2>
      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          backgroundColor: '#f9f9f9',
          overflow: 'auto'
        }}
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />
    </div>
  );
};

export default MockAppUI;
