'use client';

import { FormEvent, useState } from 'react';

type Field = 'username' | 'email' | 'password' | 'confirmPassword';
type FormValues = Record<Field, string>;
type FormErrors = Partial<Record<Field, string>>;
type Status = 'idle' | 'loading' | 'success';

const initialValues: FormValues = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
};

function getErrors(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  const usernameLength = Array.from(values.username.trim()).length;
  const emailLength = Array.from(values.email.trim()).length;
  const passwordLength = Array.from(values.password).length;

  if (!values.username.trim()) errors.username = 'Enter a username.';
  else if (usernameLength < 8) errors.username = 'Username must be at least 8 characters.';
  else if (usernameLength > 64) errors.username = 'Username must be 64 characters or fewer.';

  if (!values.email.trim()) errors.email = 'Enter your email address.';
  else if (emailLength > 254) errors.email = 'Email address must be 254 characters or fewer.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (!values.password) errors.password = 'Enter a password.';
  else if (passwordLength < 8) errors.password = 'Password must be at least 8 characters.';
  else if (passwordLength > 128) errors.password = 'Password must be 128 characters or fewer.';

  if (!values.confirmPassword) errors.confirmPassword = 'Confirm your password.';
  else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}

export default function SignupPage() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  function updateField(field: Field, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = getErrors(values);
    setErrors(nextErrors);
    setFormError('');
    if (Object.keys(nextErrors).length > 0) return;

    setStatus('loading');
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: values.username.trim(),
          email: values.email.trim(),
          password: values.password,
          confirmPassword: values.confirmPassword,
        }),
      });
      const result: { message?: string } = await response.json();
      if (!response.ok) {
        setStatus('idle');
        setFormError(result.message || 'We could not accept your signup details. Please review them and try again.');
        return;
      }
      setStatus('success');
    } catch {
      setStatus('idle');
      setFormError('Could not reach the server. Please try again.');
    }
  }

  function startOver() {
    setValues(initialValues);
    setErrors({});
    setFormError('');
    setShowPassword(false);
    setShowConfirmation(false);
    setStatus('idle');
  }

  if (status === 'success') {
    return (
      <main className="signup-layout">
        <aside className="welcome-panel" aria-label="Welcome">
          <div className="welcome-orbit orbit-one" />
          <div className="welcome-orbit orbit-two" />
          <Brand />
          <div className="welcome-copy">
            <p className="eyebrow">A FRESH START</p>
            <h1>Good things<br />start here.</h1>
            <p>Your signup details are ready for the next step.</p>
          </div>
          <div className="panel-caption"><span className="caption-dot" /> A simpler way to get started</div>
        </aside>
        <section className="form-panel success-panel" aria-live="polite">
          <div className="success-mark" aria-hidden="true">✓</div>
          <p className="eyebrow form-eyebrow">SIGNUP RECEIVED</p>
          <h2>Thanks, {values.username.trim()}.</h2>
          <p className="form-intro">Your details passed the signup checks. This demo does not create or save an account yet.</p>
          <button className="primary-button" type="button" onClick={startOver}>Back to signup <span aria-hidden="true">→</span></button>
          <p className="privacy-note">Your details are not stored after this request.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="signup-layout">
      <aside className="welcome-panel" aria-label="Welcome">
        <div className="welcome-orbit orbit-one" />
        <div className="welcome-orbit orbit-two" />
        <Brand />
        <div className="welcome-copy">
          <p className="eyebrow">YOUR NEXT CHAPTER</p>
          <h1>Start with<br />the essentials.</h1>
          <p>Create your account in a few simple steps.</p>
        </div>
        <div className="panel-caption"><span className="caption-dot" /> Thoughtfully made for you</div>
      </aside>

      <section className="form-panel">
        <div className="form-content">
          <div className="mobile-brand"><Brand /></div>
          <div className="form-heading">
            <p className="eyebrow form-eyebrow">CREATE AN ACCOUNT</p>
            <h2>Sign up</h2>
            <p className="form-intro">Add your details below to get started.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-grid">
              <div className="field-group">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  name="username"
                  autoComplete="username"
                  autoCapitalize="none"
                  value={values.username}
                  onChange={(event) => updateField('username', event.target.value)}
                  placeholder="Choose a username"
                  minLength={8}
                  required
                  aria-invalid={Boolean(errors.username)}
                  aria-describedby={errors.username ? 'username-error' : 'username-help'}
                />
                {errors.username ? <p className="field-error" id="username-error">{errors.username}</p> : <p className="field-help" id="username-help">At least 8 characters</p>}
              </div>

              <div className="field-group">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  value={values.email}
                  onChange={(event) => updateField('email', event.target.value)}
                  placeholder="you@example.com"
                  required
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && <p className="field-error" id="email-error">{errors.email}</p>}
              </div>

              <div className="field-group">
                <label htmlFor="password">Password</label>
                <div className="password-wrap">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={values.password}
                    onChange={(event) => updateField('password', event.target.value)}
                    placeholder="Create a password"
                    minLength={8}
                    required
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? 'password-error' : 'password-help'}
                  />
                  <button className="reveal-button" type="button" onClick={() => setShowPassword((show) => !show)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.password ? <p className="field-error" id="password-error">{errors.password}</p> : <p className="field-help" id="password-help">At least 8 characters</p>}
              </div>

              <div className="field-group">
                <label htmlFor="confirm-password">Confirm password</label>
                <div className="password-wrap">
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type={showConfirmation ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={values.confirmPassword}
                    onChange={(event) => updateField('confirmPassword', event.target.value)}
                    placeholder="Enter it again"
                    required
                    aria-invalid={Boolean(errors.confirmPassword)}
                    aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                  />
                  <button className="reveal-button" type="button" onClick={() => setShowConfirmation((show) => !show)} aria-label={showConfirmation ? 'Hide password confirmation' : 'Show password confirmation'}>
                    {showConfirmation ? 'Hide' : 'Show'}
                  </button>
                </div>
                {errors.confirmPassword && <p className="field-error" id="confirm-password-error">{errors.confirmPassword}</p>}
              </div>
            </div>

            {formError && <p className="form-error" role="alert">{formError}</p>}
            <button className="primary-button" type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Submitting…' : 'Submit signup details'} <span aria-hidden="true">→</span>
            </button>
          </form>
          <p className="privacy-note">Demo only. Your information is checked for this request and is not saved.</p>
        </div>
      </section>
    </main>
  );
}

function Brand() {
  return (
    <div className="brand-lockup">
      <span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>
      <span className="brand-name">Account</span>
    </div>
  );
}
