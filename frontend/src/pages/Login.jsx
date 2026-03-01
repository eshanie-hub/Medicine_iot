import { useState } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'DM Sans', sans-serif;
  }

  .signin-root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    background: #1a1a1a;
  }

  .bg-image {
    position: absolute;
    inset: 0;
    background-image: url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80');
    background-size: cover;
    background-position: center;
    filter: brightness(0.85);
    z-index: 0;
  }

  .bg-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      135deg,
      rgba(255, 200, 100, 0.15) 0%,
      rgba(255, 140, 0, 0.08) 40%,
      rgba(255, 255, 255, 0.05) 100%
    );
    z-index: 1;
  }

  .card {
    position: relative;
    z-index: 2;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 48px 44px;
    width: 100%;
    max-width: 440px;
    box-shadow:
      0 32px 80px rgba(0, 0, 0, 0.25),
      0 8px 24px rgba(0, 0, 0, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.8);
    animation: cardIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  @keyframes cardIn {
    from {
      opacity: 0;
      transform: translateY(24px) scale(0.97);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .card-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 2.2rem;
    font-weight: 600;
    color: #1a2340;
    text-align: center;
    margin-bottom: 36px;
    letter-spacing: -0.3px;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-label {
    display: block;
    font-size: 0.82rem;
    font-weight: 500;
    color: #4a5568;
    margin-bottom: 8px;
    letter-spacing: 0.01em;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input-icon {
    position: absolute;
    left: 14px;
    color: #a0aec0;
    display: flex;
    align-items: center;
    pointer-events: none;
    transition: color 0.2s;
  }

  .form-input {
    width: 100%;
    padding: 13px 14px 13px 42px;
    border: 1.5px solid #dde3ef;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.92rem;
    color: #1a2340;
    background: rgba(255, 255, 255, 0.9);
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
  }

  .form-input::placeholder {
    color: #b0b8cc;
    font-weight: 300;
  }

  .form-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.12);
    background: #fff;
  }

  .form-input:focus + .input-icon-after,
  .input-wrapper:focus-within .input-icon {
    color: #3b82f6;
  }

  .register-row {
    text-align: center;
    margin-top: 24px;
    margin-bottom: 20px;
    font-size: 0.9rem;
    color: #6b7280;
  }

  .register-link {
    color: #3b82f6;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.2s;
  }

  .register-link:hover {
    color: #2563eb;
    text-decoration: underline;
  }

  .btn-logout {
    width: 100%;
    padding: 13px;
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
    color: #fff;
    border: none;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition: transform 0.15s, box-shadow 0.2s, background 0.2s;
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.35);
  }

  .btn-logout:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.45);
    transform: translateY(-1px);
  }

  .btn-logout:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  }

  /* Mobile responsive */
  @media (max-width: 480px) {
    .card {
      margin: 16px;
      padding: 36px 24px;
      border-radius: 16px;
    }

    .card-title {
      font-size: 1.85rem;
      margin-bottom: 28px;
    }

    .form-input {
      padding: 12px 12px 12px 40px;
      font-size: 0.9rem;
    }

    .btn-logout {
      padding: 12px;
    }
  }

  @media (max-width: 360px) {
    .card {
      margin: 12px;
      padding: 28px 18px;
    }
  }
`;

// SVG icons
const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

export default function SignIn() {
  const [medicineBoxId, setMedicineBoxId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogout = (e) => {
    e.preventDefault();
    alert("Logout clicked");
  };

  return (
    <>
      <style>{styles}</style>
      <div className="signin-root">
        <div className="bg-image" />
        <div className="bg-overlay" />

        <div className="card">
          <h1 className="card-title">Log in</h1>

          <form onSubmit={handleLogout} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="medicineBoxId">
                Medicine Box ID
              </label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <MailIcon />
                </span>
                <input
                  id="medicineBoxId"
                  type="text"
                  className="form-input"
                  placeholder="Enter Medicine Box ID"
                  value={medicineBoxId}
                  onChange={(e) => setMedicineBoxId(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <div className="input-wrapper">
                <span className="input-icon">
                  <LockIcon />
                </span>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="register-row">
              Don't have an Account?{" "}
              <a href="/register" className="register-link">
                Register
              </a>
            </div>

            <button type="submit" className="btn-logout">
              Log in
            </button>
          </form>
        </div>
      </div>
    </>
  );
}