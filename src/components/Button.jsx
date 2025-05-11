import React from 'react';

const Button = ({ children, onClick, type = "button", disabled = false }) => (
    <button
        onClick={onClick}
        type={type}
        disabled={disabled}
        className={`btn btn-primary ${disabled ? 'opacity-75' : ''}`}
    >
        {children}
    </button>
);

export default Button;