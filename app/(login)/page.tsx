'use client';

import { FormEvent, useState } from 'react';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const result: { message: string } = await response.json();
      setStatus(response.ok ? 'success' : 'error');
      setMessage(result.message);
    } catch {
      setStatus('error');
      setMessage('Could not reach the server. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <main className="page-shell">
        <section className="card success-card" aria-live="polite">
          <div className="success-icon" aria-hidden="true">✓</div>
          <p className="eyebrow">SIGNED IN</p>
          <h1>Welcome back.</h1>
          <p className="subtitle">You’re successfully logged in as <strong>{username}</strong>.</p>
          <button className="secondary-button" onClick={() => { setStatus('idle'); setPassword(''); }}>Sign out</button>
        </section>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="card">
        <div className="brand-mark" aria-hidden="true">✳</div>
        <p className="eyebrow">WELCOME BACK</p>
        <h1>Sign in</h1>
        <p className="subtitle">Enter your details to continue.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input id="username" name="username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your username" required />

          <div className="password-label"><label htmlFor="password">Password</label></div>
          <input id="password" name="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" required />

          {status === 'error' && <p className="error-message" role="alert">{message}</p>}
          <button className="primary-button" type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Signing in…' : 'Sign in'} <span aria-hidden="true">→</span>
          </button>
        </form>
        <p className="footnote">Simple demo login · No account data is stored</p>
      </section>
    </main>
  );
}
