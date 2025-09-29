import React from 'react';
import DOMPurify from 'dompurify';
import { responsive } from '../utils/responsive';
const MockAppUI = ({ data }) => {
  const cleanHtml = DOMPurify.sanitize(data.mockHtml || '');

  return (
    <div style={responsive.container}>
      <h2>🎨 Generated Mock UI</h2>
      <div
        style={{
          ...responsive.card,
          border: '1px solid #ddd',
          backgroundColor: '#f9f9f9',
          overflow: 'auto'
        }}
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />
    </div>
  );
};

export default MockAppUI;
