import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import Logo from "../../components/common/Logo/Logo";
import Icon from "../../components/common/Icon/Icon";
import { useAuth } from "../../hooks/useAuth";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { authService, ROLES } from "../../services/auth/authService";
import { homePathFor } from "../../routes/paths";
import "./Login.css";

function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState(ROLES.STUDENT);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      <section className="login-brand">
        <Logo variant="dark" size="lg" />

        <div className="login-brand-copy">
          <h1>Your 42X Academy learning space</h1>
          <p>Recorded lectures, notes and your progress for every course, in one place.</p>

          <ul>
            <li><Icon name="play-circle" size={18} /> Watch recorded lectures and continue where you stopped</li>
            <li><Icon name="folder" size={18} /> Download syllabus, notes and assignments</li>
            <li><Icon name="chart" size={18} /> Track your course progress module by module</li>
          </ul>
        </div>

        <p className="login-brand-tagline">Learn · Grow · Build Your Future</p>
      </section>

      <section className="login-panel">
        <div className="login-card card">
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

                <div className="field">
                  <label className="field-label" htmlFor="login-password">Password</label>
                  <div className="login-password">
                    <input
                      id="login-password"
                      className="input"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
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
                </div>

                <button type="button" className="login-link" onClick={() => switchMode("forgot")}>
                  Forgot password?
                </button>

                {error && <p className="login-error" role="alert">{error}</p>}

                <button type="submit" className="btn btn-primary btn-block login-submit" disabled={submitting}>
                  {submitting ? "Signing in…" : `Sign in as ${role === ROLES.ADMIN ? "Admin" : "Student"}`}
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

                  {error && <p className="login-error" role="alert">{error}</p>}

                  <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
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
