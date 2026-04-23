import React from 'react';
import { useNavigate } from 'react-router-dom';

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
    overflow: hidden;
  }

  .logo-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
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
    padding: 6px 25px;
    border-radius: 6px;
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
    white-space: nowrap;
  }

  .btn-logout:hover {
    background-color: #2b6cb0;
  }

  /* Responsive Adjustments */
  @media (max-width: 480px) {
    .nav-container {
      padding: 0 15px; /* Less horizontal padding */
    }

    .brand-name {
      font-size: 1rem; /* Smaller font for smaller screens */
    }

    .btn-logout {
      padding: 5px 15px; /* Narrower button */
      font-size: 0.85rem;
    }

    .logo-circle {
      width: 30px;
      height: 30px;
    }
  }
`;

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Optional: localStorage.clear();
    navigate('/login');
  };

  return (
    <>
      <style>{navStyles}</style>
      <nav className="nav-container">
        <div className="logo-section">
          <div className="logo-circle">
            <img 
              src="/logo.png" 
              alt="MediPORT Logo" 
              className="logo-img" 
            />
          </div>
          <span className="brand-name">MediPORT</span>
        </div>
        
        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </nav>
    </>
  );
}