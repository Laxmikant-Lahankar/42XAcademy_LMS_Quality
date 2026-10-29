import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import Logo from "../../components/common/Logo/Logo";
import Icon from "../../components/common/Icon/Icon";
import { useAuth } from "../../hooks/useAuth";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { authService, ROLES } from "../../services/auth/authService";
import { homePathFor } from "../../routes/paths";
import LoginBackdrop from "./LoginBackdrop";
import "./Login.css";

// "Remember me" keeps only the email on this device, never the password.
const REMEMBER_KEY = "42x-lms-remember-email";

function readRememberedEmail() {
  try {
    return localStorage.getItem(REMEMBER_KEY) || "";
  } catch {
    return "";
  }
}

function rememberEmail(email) {
  try {
    if (email) localStorage.setItem(REMEMBER_KEY, email);
    else localStorage.removeItem(REMEMBER_KEY);
  } catch {
    // Storage blocked (private mode): nothing to remember.
  }
}

function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState(ROLES.STUDENT);
  const [email, setEmail] = useState(readRememberedEmail);
  const [remember, setRemember] = useState(() => Boolean(readRememberedEmail()));
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState("login");
  const [resetSentTo, setResetSentTo] = useState("");
  useDocumentTitle(mode === "login" ? "Sign in" : "Reset password");

  if (user) {
    return <Navigate to={homePathFor(user.role)} replace />;
  }

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const signedIn = await login({ email, password, role });
      rememberEmail(remember ? email.trim() : "");
      const from = location.state?.from;
      const target = from && from.startsWith(homePathFor(signedIn.role)) ? from : homePathFor(signedIn.role);
      navigate(target, { replace: true });
    } catch (loginError) {
      setError(loginError.message || "Login failed. Please try again.");
      setSubmitting(false);
    }
  }

  async function handleReset(event) {
    event.preventDefault();
    if (!email.trim()) {
      setError("Enter the email you use to sign in.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await authService.requestPasswordReset(email.trim());
      setResetSentTo(email.trim());
    } catch (resetError) {
      setError(resetError.message);
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
    setResetSentTo("");
  }

  return (
    <div className="login-page">
      <LoginBackdrop />

      <header className="login-header">
        <Logo variant="dark" size="lg" />
      </header>

      <section className="login-brand">
        <div className="login-brand-copy">
          <h1>
            Your <span className="login-gradient-text">42X</span> Academy learning space
          </h1>
          <p>Recorded lectures, notes and your progress for every course, in one place.</p>

          <ul>
            <li><span className="login-feature-icon"><Icon name="play-circle" size={18} /></span> Watch recorded lectures and continue where you stopped</li>
            <li><span className="login-feature-icon"><Icon name="folder" size={18} /></span> Download syllabus, notes and assignments</li>
            <li><span className="login-feature-icon"><Icon name="chart" size={18} /></span> Track your course progress module by module</li>
          </ul>

          <p className="login-brand-tagline"><span className="login-gradient-text">Learn · Grow · Build Your Future</span></p>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          {mode === "login" ? (
            <>
              <h2>Sign in</h2>
              <p className="muted">Choose your role and sign in with your 42X Academy account.</p>

              <div className="login-roles" role="radiogroup" aria-label="Sign in as">
                {[ROLES.STUDENT, ROLES.ADMIN].map((item) => (
                  <button
                    key={item}
                    type="button"
                    role="radio"
                    aria-checked={role === item}
                    className={`login-role ${role === item ? "is-active" : ""}`}
                    onClick={() => {
                      setRole(item);
                      setError("");
                    }}
                  >
                    <Icon name={item === ROLES.ADMIN ? "shield" : "user"} size={17} />
                    {item === ROLES.ADMIN ? "Admin" : "Student"}
                  </button>
                ))}
              </div>

              <form className="login-form" onSubmit={handleLogin} noValidate>
                <div className="field">
                  <label className="field-label" htmlFor="login-email">Email</label>
                  <div className="login-input">
                    <Icon name="mail" size={18} />
                    <input
                      id="login-email"
                      className="input"
                      type="email"
                      autoComplete="username"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="login-password">Password</label>
                  <div className="login-input login-password">
                    <Icon name="lock" size={18} />
                    <input
                      id="login-password"
                      className="input"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      onKeyUp={(event) => setCapsLock(event.getModifierState("CapsLock"))}
                      onBlur={() => setCapsLock(false)}
                    />
                    <button
                      type="button"
                      className="login-password-toggle"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <Icon name={showPassword ? "eye-off" : "eye"} size={18} />
                    </button>
                  </div>
                  {capsLock && (
                    <p className="login-caps" role="status">
                      <Icon name="alert" size={14} /> Caps Lock is on
                    </p>
                  )}
                </div>

                <div className="login-row">
                  <label className="login-remember">
                    <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
                    Remember me
                  </label>
                  <button type="button" className="login-link" onClick={() => switchMode("forgot")}>
                    Forgot password?
                  </button>
                </div>

                {error && (
                  <p className="login-error" role="alert">
                    <Icon name="alert" size={16} /> {error}
                  </p>
                )}

                <button type="submit" className="btn btn-primary btn-block login-submit" disabled={submitting}>
                  {submitting ? (
                    <><span className="login-spinner" aria-hidden="true" /> Signing in…</>
                  ) : (
                    <>
                      Sign in as {role === ROLES.ADMIN ? "Admin" : "Student"}
                      <svg className="login-submit-arrow" viewBox="0 0 26 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M1 7h23M18 1l6 6-6 6" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2>Reset your password</h2>
              <p className="muted">Enter your email and we will send you a link to set a new password.</p>

              {resetSentTo ? (
                <p className="login-success" role="status">
                  If an account exists for {resetSentTo}, a reset link will be sent to it.
                  {" "}Reset emails will start once an email service is connected.
                </p>
              ) : (
                <form className="login-form" onSubmit={handleReset} noValidate>
                  <div className="field">
                    <label className="field-label" htmlFor="reset-email">Email</label>
                    <div className="login-input">
                      <Icon name="mail" size={18} />
                      <input
                        id="reset-email"
                        className="input"
                        type="email"
                        autoComplete="username"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="login-error" role="alert">
                      <Icon name="alert" size={16} /> {error}
                    </p>
                  )}

                  <button type="submit" className="btn btn-primary btn-block login-submit" disabled={submitting}>
                    {submitting ? "Sending…" : "Send reset link"}
                  </button>
                </form>
              )}

              <button type="button" className="login-link login-back" onClick={() => switchMode("login")}>
                <Icon name="chevron-left" size={16} /> Back to sign in
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default Login;
