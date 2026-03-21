import React from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate

const navStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');

  .nav-container {
    background-color: #1e3a6e;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 25px;
    font-family: 'Poppins', sans-serif;
    color: white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }

  .logo-section {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .logo-circle {
    background: white;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1e3a6e;
  }

  .brand-name {
    font-weight: 600;
    font-size: 1.2rem;
    letter-spacing: 0.5px;
  }

  .btn-logout {
    background-color: #3182ce;
    color: white;
    border: none;
    padding: 6px 35px;
    border-radius: 6px;
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
  }

  .btn-logout:hover {
    background-color: #2b6cb0;
  }
`;

export default function Navbar() {
  const navigate = useNavigate(); // 2. Initialize navigate

  const handleLogout = () => {
    // Add any logout logic here (e.g., clearing localStorage/tokens)
    navigate('/login'); // 3. Redirect to login route
  };

  return (
    <>
      <style>{navStyles}</style>
      <nav className="nav-container">
        <div className="logo-section">
          <div className="logo-circle">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20,8H17V4H3C1.89,4 1,4.89 1,6V17H3A3,3 0 0,0 6,20A3,3 0 0,0 9,17H15A3,3 0 0,0 18,20A3,3 0 0,0 21,17H23V12L20,8M6,18.5A1.5,1.5 0 0,1 4.5,17A1.5,1.5 0 0,1 6,15.5A1.5,1.5 0 0,1 7.5,17A1.5,1.5 0 0,1 6,18.5M18,18.5A1.5,1.5 0 0,1 16.5,17A1.5,1.5 0 0,1 18,15.5A1.5,1.5 0 0,1 19.5,17A1.5,1.5 0 0,1 18,18.5M19,11.5H15.5V9.5H19V11.5Z" />
            </svg>
          </div>
          <span className="brand-name">MediPORT</span>
        </div>
        
        {/* 4. Attach the click handler */}
        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </nav>
    </>
  );
}