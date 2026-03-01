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

  .register-root {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    background: #b8cde8;
  }

  .bg-image {
    position: absolute;
    inset: 0;
    background-image: url('https://images.unsplash.com/photo-1606813902630-fcb8f3c0c3b7?w=1200&q=80');
    background-size: cover;
    background-position: center;
    filter: brightness(0.9) saturate(0.85);
    z-index: 0;
  }

  .bg-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      160deg,
      rgba(160, 195, 230, 0.35) 0%,
      rgba(100, 150, 210, 0.15) 100%
    );
    z-index: 1;
  }

  .card {
    position: relative;
    z-index: 2;
    background: rgba(255, 255, 255, 0.91);
    backdrop-filter: blur(22px);
    -webkit-backdrop-filter: blur(22px);
    border-radius: 20px;
    padding: 48px 44px;
    width: 100%;
    max-width: 440px;
    box-shadow:
      0 32px 80px rgba(0, 0, 0, 0.2),
      0 8px 24px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.85);
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
    color: #1e3a6e;
    text-align: center;
    margin-bottom: 32px;
    letter-spacing: -0.3px;
  }

  .form-group {
    margin-bottom: 18px;
  }

  .form-label {
    display: block;
    font-size: 0.82rem;
    font-weight: 500;
    color: #4a5568;
    margin-bottom: 7px;
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

  .input-wrapper:focus-within .input-icon {
    color: #3b82f6;
  }

  .login-row {
    text-align: center;
    margin-top: 22px;
    margin-bottom: 18px;
    font-size: 0.9rem;
    color: #6b7280;
  }

  .login-link {
    color: #3b82f6;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.2s;
  }

  .login-link:hover {
    color: #2563eb;
    text-decoration: underline;
  }

  .btn-register {
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

  .btn-register:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.45);
    transform: translateY(-1px);
  }

  .btn-register:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  }

  /* Password strength indicator */
  .strength-bar {
    display: flex;
    gap: 4px;
    margin-top: 6px;
  }

  .strength-segment {
    height: 3px;
    flex: 1;
    border-radius: 2px;
    background: #e2e8f0;
    transition: background 0.3s;
  }

  .strength-segment.active-weak   { background: #ef4444; }
  .strength-segment.active-fair   { background: #f59e0b; }
  .strength-segment.active-strong { background: #10b981; }

  /* Error state */
  .form-input.error {
    border-color: #ef4444;
  }

  .error-msg {
    font-size: 0.76rem;
    color: #ef4444;
    margin-top: 5px;
    padding-left: 2px;
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
      margin-bottom: 24px;
    }

    .form-input {
      padding: 12px 12px 12px 40px;
      font-size: 0.9rem;
    }

    .btn-register {
      padding: 12px;
    }
  }

  @media (max-width: 360px) {
    .card {
      margin: 10px;
      padding: 28px 16px;
    }

    .card-title {
      font-size: 1.65rem;
    }
  }
`;

// Icons
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

const IdIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/>
    <circle cx="9" cy="12" r="2.5"/>
    <path d="M13 10h5M13 14h5"/>
  </svg>
);

function getStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[0-9!@#$%^&*]/.test(pw)) score++;
  return score;
}

function getStrengthClass(score, index) {
  if (index >= score) return "";
  if (score === 1) return "active-weak";
  if (score === 2) return "active-fair";
  return "active-strong";
}

export default function Register() {
  const [form, setForm] = useState({ medicineBoxId: "", password: "", rePassword: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const pwStrength = getStrength(form.password);

  const validate = () => {
    const e = {};
    if (!form.medicineBoxId.trim()) e.medicineBoxId = "Medicine Box ID is required.";
    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 6) e.password = "Password must be at least 6 characters.";
    if (!form.rePassword) e.rePassword = "Please re-enter your password.";
    else if (form.password !== form.rePassword) e.rePassword = "Passwords do not match.";
    return e;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length) { setErrors(e2); return; }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <>
        <style>{styles}</style>
        <div className="register-root">
          <div className="bg-image" />
          <div className="bg-overlay" />
          <div className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>✅</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#1e3a6e", marginBottom: "10px" }}>
              Registered!
            </h2>
            <p style={{ color: "#6b7280", marginBottom: "24px" }}>
              Your account has been created successfully.
            </p>
            <a href="/signin" style={{ color: "#3b82f6", fontWeight: 600, textDecoration: "none" }}>
              Go to Sign In →
            </a>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="register-root">
        <div className="bg-image" />
        <div className="bg-overlay" />

        <div className="card">
          <h1 className="card-title">Register</h1>

          <form onSubmit={handleSubmit} noValidate>
            {/* Medicine Box ID */}
            <div className="form-group">
              <label className="form-label" htmlFor="medicineBoxId">
                Medicine Box ID
              </label>
              <div className="input-wrapper">
                <span className="input-icon"><IdIcon /></span>
                <input
                  id="medicineBoxId"
                  name="medicineBoxId"
                  type="text"
                  className={`form-input${errors.medicineBoxId ? " error" : ""}`}
                  placeholder="Enter Medicine Box ID"
                  value={form.medicineBoxId}
                  onChange={handleChange}
                  autoComplete="username"
                />
              </div>
              {errors.medicineBoxId && <p className="error-msg">{errors.medicineBoxId}</p>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <div className="input-wrapper">
                <span className="input-icon"><MailIcon /></span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className={`form-input${errors.password ? " error" : ""}`}
                  placeholder="Enter email address"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>
              {form.password && (
                <div className="strength-bar">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`strength-segment ${getStrengthClass(pwStrength, i)}`}
                    />
                  ))}
                </div>
              )}
              {errors.password && <p className="error-msg">{errors.password}</p>}
            </div>

            {/* Re-enter Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="rePassword">
                Re-enter Password
              </label>
              <div className="input-wrapper">
                <span className="input-icon"><LockIcon /></span>
                <input
                  id="rePassword"
                  name="rePassword"
                  type="password"
                  className={`form-input${errors.rePassword ? " error" : ""}`}
                  placeholder="Enter contact number"
                  value={form.rePassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
              </div>
              {errors.rePassword && <p className="error-msg">{errors.rePassword}</p>}
            </div>

            <div className="login-row">
              Has an Account?{" "}
              <a href="/" className="login-link">
                Login
              </a>
            </div>

            <button type="submit" className="btn-register">
              Register
            </button>
          </form>
        </div>
      </div>
    </>
  );
}