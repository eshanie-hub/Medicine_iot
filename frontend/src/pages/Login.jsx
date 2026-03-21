import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import bgImage from '../assets/login.png';

const loginStyles = `
  .auth-container {
    height: 100vh; width: 100vw; display: flex; align-items: center; justify-content: center;
    background: url(${bgImage}) center/cover;
  }
  .auth-card {
    background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(10px);
    padding: 40px; border-radius: 40px; width: 450px; text-align: center;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  }
  .input-group { text-align: left; margin-bottom: 15px; }
  .input-wrapper {
    display: flex; border: 1.5px solid #2d4a8a; border-radius: 10px;
    padding: 10px; background: white; margin-top: 5px;
  }
  .input-wrapper input { border: none; outline: none; width: 100%; font-family: 'Poppins'; }
  .btn-submit {
    background: #2d82cc; color: white; border: none; padding: 12px;
    border-radius: 8px; cursor: pointer; width: 100%; font-weight: 600; margin-top: 20px;
  }
  .register-row {
    margin: 25px 0;
    font-size: 1.05rem;
    font-weight: 500;
    color: #3f51b5;
  }
  .reg-link { color: #4a90e2;
    text-decoration: none;
    font-weight: 600;  }

`;

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ medicineBoxId: '', userId: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      
      if (response.data.success) {
        const id = response.data.user.userId;

        // Conditional Navigation Logic
        if (id.startsWith('d')) {
          navigate('/driver');
        } else if (id.startsWith('r')) {
          navigate('/report');
        } else if (id.startsWith('s')) {
          navigate('/system');
        } else {
          alert("Unauthorized role");
        }
      }
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-container">
      <style>{loginStyles}</style>
      <div className="auth-card">
        <h1 style={{ color: '#2d4a8a', marginBottom: '30px' }}>Sign in</h1>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Medicine Box ID</label>
            <div className="input-wrapper">
              <input type="text" placeholder="Enter Box ID" 
                onChange={(e) => setFormData({...formData, medicineBoxId: e.target.value})} required />
            </div>
          </div>
          <div className="input-group">
            <label>User ID</label>
            <div className="input-wrapper">
              <input type="text" placeholder="e.g. d1234" 
                onChange={(e) => setFormData({...formData, userId: e.target.value})} required />
            </div>
          </div>
          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <input type="password" placeholder="••••••••" 
                onChange={(e) => setFormData({...formData, password: e.target.value})} required />
            </div>
          </div>
          <div className="register-row">
          Don't have an account? <Link to="/register" className="reg-link">Register</Link>
        </div>
          <button type="submit" className="btn-submit">Login</button>
        </form>
        
      </div>
    </div>
  );
}