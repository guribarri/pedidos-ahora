import React from 'react';

const overlayStyle = {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    zIndex: 10000,
};

const modalStyle = {
    background: '#fff',
    borderRadius: '18px',
    padding: '32px',
    width: '100%',
    maxWidth: '680px',
    boxShadow: '0 12px 40px rgba(15,23,42,0.15)',
    position: 'relative',
};

const closeBtnStyle = {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: '#f1f2f6',
    border: 'none',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

const Modal = ({ children, onClose, ariaLabel = 'modal' }) => {
    return (
        <div style={overlayStyle} role="dialog" aria-label={ariaLabel} onClick={onClose}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                <button style={closeBtnStyle} onClick={onClose} aria-label="Cerrar">
                    ×
                </button>
                {children}
            </div>
        </div>
    );
};

export default Modal;
