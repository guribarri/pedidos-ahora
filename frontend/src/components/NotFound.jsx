import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = ({ message }) => {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f8f9fa' }}>
      <div style={{ textAlign: 'center', background: '#fff', padding: '32px', borderRadius: '12px', boxShadow: '0 6px 20px rgba(0,0,0,0.08)' }}>
        <h1 style={{ margin: 0, fontSize: '36px', color: '#ff4757' }}>404</h1>
        <p style={{ marginTop: '12px', color: '#333' }}>{message || 'Página no encontrada'}</p>
        
      </div>
    </div>
  );
};

export default NotFound;
