import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import bgImage from '../assets/register.png';

const regStyles = `
  .auth-container {
    height: 100vh; width: 100vw; display: flex; align-items: center; justify-content: center;
    background: url(${bgImage}) center/cover;
  }
  .auth-card {
    background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px);
    padding: 40px; border-radius: 40px; width: 450px; text-align: center;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  }
  .input-group { text-align: left; margin-bottom: 12px; }
  .input-group label { font-size: 0.85rem; font-weight: 500; color: #4a5568; margin-left: 5px; }
  
  .input-wrapper {
    display: flex; border: 1.5px solid #2d4a8a; border-radius: 10px;
    padding: 10px; background: white; margin-top: 5px;
  }
  
  .input-wrapper input, .input-wrapper select {
    border: none; outline: none; width: 100%; font-family: 'Poppins';
    background: transparent; color: #2d3748; font-size: 0.9rem;
  }

  /* Specific styling for the dropdown arrow and appearance */
  .input-wrapper select {
    cursor: pointer;
    appearance: none; /* Removes default browser styling */
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%232d4a8a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 10px center;
    background-size: 1em;
    padding-right: 30px;
  }

  .btn-submit {
    background: #2d82cc; color: white; border: none; padding: 12px 40px;
    border-radius: 8px; cursor: pointer; margin-top: 20px; width: 100%;
    font-weight: 600; font-family: 'Poppins'; transition: 0.3s;
  }
  .btn-submit:hover { background: #1e6fb3; }

  .register-row {
    margin: 25px 0;
    font-size: 1.05rem;
    font-weight: 500;
    color: #3f51b5;
  }

  .login-link { color: #4a90e2;
    text-decoration: none;
    font-weight: 600; }
  .login-link a { color: #2d82cc; text-decoration: none; font-weight: 600; }

  /* Popup Styles */
  .modal-overlay {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 2000;
  }
  .modal-content {
    background: white; padding: 40px; border-radius: 30px; text-align: center; width: 380px;
  }
  .generated-id {
    font-size: 2.2rem; font-weight: 700; color: #2d82cc; margin: 20px 0;
    padding: 15px; border: 2px dashed #2d82cc; border-radius: 15px; background: #f0f7ff;
  }
  .btn-cancel { background: #e53e3e; color: white; border: none; padding: 10px 30px; border-radius: 8px; cursor: pointer; }
`;

export default function Register() {
  const navigate = useNavigate();
  const [boxId, setBoxId] = useState('');
  const [role, setRole] = useState('driver');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [newId, setNewId] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    // Password Match Check
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        medicineBoxId: boxId,
        userRole: role,
        password: password
      });
      setNewId(response.data.generatedUserId);
      setShowPopup(true);
    } catch (error) {
      alert(error.response?.data?.message || "Error registering user");
    }
  };

  return (
    <div className="auth-container">
      <style>{regStyles}</style>
      <div className="auth-card">
        <h1 style={{ color: '#2d4a8a', marginBottom: '25px' }}>Register</h1>
        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label>Medicine Box ID</label>
            <div className="input-wrapper">
              <input type="text" placeholder="Enter Box ID" onChange={(e) => setBoxId(e.target.value)} required />
            </div>
          </div>

          <div className="input-group">
            <label>User Role</label>
            <div className="input-wrapper">
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="driver">Driver</option>
                <option value="report">Report Manager</option>
                <option value="system">System Manager</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <input type="password" placeholder="••••••••" onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>

          <div className="input-group">
            <label>Re-enter Password</label>
            <div className="input-wrapper">
              <input type="password" placeholder="••••••••" onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
          </div>
          <div className="register-row">
          Already have an account? <Link to="/login" className="login-link">Login</Link>
        </div>
          <button type="submit" className="btn-submit">Register</button>
        </form>

        
      </div>

      {showPopup && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ color: '#1e3a6e' }}>Success!</h2>
            <p style={{ color: '#718096' }}>Your unique Login ID is:</p>
            <div className="generated-id">{newId}</div>
            <p style={{ fontSize: '0.8rem', color: '#a0aec0', marginBottom: '20px' }}>
              Please save this ID to login to your dashboard.
            </p>
            <button className="btn-cancel" onClick={() => setShowPopup(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}