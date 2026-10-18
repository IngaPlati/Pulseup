import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import api from '../api/api';
import AuthBackground from '../components/AuthBackground';
import ResponsiveHeader from '../components/ResponsiveHeader';

import './RegisterPage.css';

// PulseUp is only available at the District Six campus.
const CAMPUS = 'District Six Campus';

const INITIAL_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  studentNumber: '',
  campus: CAMPUS,
  password: '',
  confirmPassword: '',
};

function EyeIcon({ visible }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
      <circle cx="12" cy="12" r="2.5" />

      {visible && <path d="M4 4 20 20" />}
    </svg>
  );
}

function getRegistrationError(error) {
  if (!error.response) {
    return (
      'Unable to connect to the PulseUp backend. ' +
      'Make sure Spring Boot is running on port 8080.'
    );
  }

  const responseData = error.response.data;

  const serverMessage =
    typeof responseData === 'string'
      ? responseData
      : responseData?.message || responseData?.error;

  if (serverMessage) {
    return serverMessage;
  }

  switch (error.response.status) {
    case 400:
      return 'The registration details were rejected by the server.';

    case 403:
      return 'Student registration is blocked by the security configuration.';

    case 409:
      return 'That email address or student number is already registered.';

    default:
      if (error.response.status >= 500) {
        return 'The server could not create the student account.';
      }

      return 'Registration could not be completed.';
  }
}

function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Live check: null until the confirm box has text, then true/false.
  const passwordsMatch = form.confirmPassword
    ? form.password === form.confirmPassword
    : null;

  function updateField(event) {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    setMessage('');
  }

  function validateForm() {
    const requiredValues = Object.values(form);

    if (requiredValues.some((value) => !String(value).trim())) {
      return 'Please complete every required field.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return 'Enter a valid email address.';
    }

    if (!/^\d{8,12}$/.test(form.studentNumber.trim())) {
      return 'The student number must contain 8 to 12 digits.';
    }

    if (!/^0\d{9}$/.test(form.phoneNumber.trim())) {
      return 'Enter a valid 10-digit South African phone number.';
    }

    if (form.password.length < 8) {
      return 'Your password must contain at least 8 characters.';
    }

    if (form.password !== form.confirmPassword) {
      return 'The passwords do not match.';
    }

    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationMessage = validateForm();

    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }

    setMessage('');
    setIsSubmitting(true);

    try {
      const response = await api.post('/auth/register/student', {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phoneNumber: form.phoneNumber.trim(),
        studentNumber: form.studentNumber.trim(),
        campus: CAMPUS,
        password: form.password,
      });

      const user = response.data || {};

      // Backend asks for email verification before the account can be used.
      if (user.emailVerificationRequired) {
        const pendingEmail = form.email.trim().toLowerCase();

        sessionStorage.setItem('pulseupPendingEmail', pendingEmail);

        navigate('/check-email', {
          replace: true,
          state: { email: pendingEmail },
        });

        return;
      }

      const token = user.token || user.accessToken || user.jwt || '';

      if (token) {
        localStorage.setItem(
          'pulseupUser',
          JSON.stringify({
            ...user,
            token,
            role: user.role || 'STUDENT',
          }),
        );

        navigate('/student/dashboard', {
          replace: true,
        });

        return;
      }

      navigate('/login', {
        replace: true,
      });
    } catch (error) {
      console.error(
        'Student registration failed:',
        error.response?.status,
        error.response?.data || error.message,
      );

      setMessage(getRegistrationError(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="pulse-auth-page pulse-register-page">
      <AuthBackground />

      <section
        className="pulse-auth-card pulse-register-card"
        aria-label="PulseUp student registration"
      >
        <ResponsiveHeader
          variant="auth"
          ariaLabel="Registration page navigation"
          desktopAction={{ label: 'Back to home', to: '/' }}
          menuItems={[
            { label: 'Home', to: '/' },
            { label: 'Sign in', to: '/login' },
            {
              label: 'Create student account',
              to: '/register',
              active: true,
            },
          ]}
        />

        <div className="pulse-register-content">
          <div className="pulse-register-heading">
            <p className="pulse-auth-eyebrow">
              STUDENT REGISTRATION
            </p>

            <h1 className="pulse-auth-title">Create your account</h1>

            <span className="pulse-auth-lead">
              Complete your details to get started. PulseUp is available to District Six Campus students.
            </span>
          </div>

          <form className="pulse-register-form" onSubmit={handleSubmit}>
            <label className="pulse-auth-field">
              <span>First name</span>

              <input
                name="firstName"
                value={form.firstName}
                onChange={updateField}
                autoComplete="given-name"
                disabled={isSubmitting}
                required
              />
            </label>

            <label className="pulse-auth-field">
              <span>Last name</span>

              <input
                name="lastName"
                value={form.lastName}
                onChange={updateField}
                autoComplete="family-name"
                disabled={isSubmitting}
                required
              />
            </label>

            <label className="pulse-auth-field">
              <span>Email address</span>

              <input
                name="email"
                type="email"
                value={form.email}
                onChange={updateField}
                autoComplete="email"
                disabled={isSubmitting}
                required
              />
            </label>

            <label className="pulse-auth-field">
              <span>Phone number</span>

              <input
                name="phoneNumber"
                type="tel"
                value={form.phoneNumber}
                onChange={updateField}
                placeholder="0712345678"
                maxLength={10}
                disabled={isSubmitting}
                required
              />
            </label>

            <label className="pulse-auth-field">
              <span>Student number</span>

              <input
                name="studentNumber"
                value={form.studentNumber}
                onChange={updateField}
                inputMode="numeric"
                maxLength={12}
                disabled={isSubmitting}
                required
              />
            </label>

            <label className="pulse-auth-field">
              <span>Password</span>

              <div className="pulse-register-password">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={updateField}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  minLength={8}
                  disabled={isSubmitting}
                  required
                />

                <button
                  type="button"
                  className="pulse-register-eye"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((current) => !current)}
                  disabled={isSubmitting}
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
            </label>

            <label className="pulse-auth-field">
              <span>Confirm password</span>

              <div
                className={
                  passwordsMatch === null
                    ? 'pulse-register-password'
                    : passwordsMatch
                      ? 'pulse-register-password is-match'
                      : 'pulse-register-password is-mismatch'
                }
              >
                <input
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={updateField}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  minLength={8}
                  aria-invalid={passwordsMatch === false}
                  aria-describedby="pulse-password-match"
                  disabled={isSubmitting}
                  required
                />

                <button
                  type="button"
                  className="pulse-register-eye"
                  aria-label={
                    showConfirm ? 'Hide confirm password' : 'Show confirm password'
                  }
                  onClick={() => setShowConfirm((current) => !current)}
                  disabled={isSubmitting}
                >
                  <EyeIcon visible={showConfirm} />
                </button>
              </div>

              <small
                id="pulse-password-match"
                className={
                  passwordsMatch === null
                    ? 'pulse-register-match'
                    : passwordsMatch
                      ? 'pulse-register-match is-match'
                      : 'pulse-register-match is-mismatch'
                }
                aria-live="polite"
              >
                {passwordsMatch === null
                  ? '\u00a0'
                  : passwordsMatch
                    ? '\u2713 Passwords match'
                    : '\u2717 Passwords do not match'}
              </small>
            </label>

            {message && (
              <p className="pulse-auth-message pulse-register-message" role="alert">
                {message}
              </p>
            )}

            <button
              className="pulse-auth-submit pulse-register-submit"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating account...' : 'Create student account'}
            </button>
          </form>

          <p className="pulse-register-footer">
            Already registered?{' '}
            <Link className="pulse-auth-link" to="/login">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default RegisterPage;
