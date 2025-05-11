import React from 'react';

const Input = ({ label, type, value, onChange, name, placeholder }) => (
    <div className="mb-3">
        <label htmlFor={name} className="form-label fw-semibold">{label}</label>
        <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="form-control"
        />
    </div>
);

export default Input;