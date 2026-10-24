import { NextResponse } from 'next/server';

type SignupBody = {
  username?: unknown;
  email?: unknown;
  password?: unknown;
  confirmPassword?: unknown;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function characterCount(value: string) {
  return Array.from(value).length;
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: 'Please enter your signup details.' }, { status: 400 });
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return NextResponse.json({ message: 'Please enter your signup details.' }, { status: 400 });
  }
  const body = payload as SignupBody;

  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const confirmPassword = typeof body.confirmPassword === 'string' ? body.confirmPassword : '';

  if (!username) {
    return NextResponse.json({ message: 'Enter a username.' }, { status: 400 });
  }
  if (characterCount(username) < 8) {
    return NextResponse.json({ message: 'Username must be at least 8 characters.' }, { status: 400 });
  }
  if (characterCount(username) > 64) {
    return NextResponse.json({ message: 'Username must be 64 characters or fewer.' }, { status: 400 });
  }
  if (!email || characterCount(email) > 254 || !emailPattern.test(email)) {
    return NextResponse.json({ message: 'Enter a valid email address.' }, { status: 400 });
  }
  if (!password) {
    return NextResponse.json({ message: 'Enter a password.' }, { status: 400 });
  }
  if (characterCount(password) < 8) {
    return NextResponse.json({ message: 'Password must be at least 8 characters.' }, { status: 400 });
  }
  if (characterCount(password) > 128) {
    return NextResponse.json({ message: 'Password must be 128 characters or fewer.' }, { status: 400 });
  }
  if (password !== confirmPassword) {
    return NextResponse.json({ message: 'Passwords do not match.' }, { status: 400 });
  }

  // This demo validates the signup payload but has no account store.
  return NextResponse.json(
    { message: 'Signup details accepted. This demo does not create or save an account.' },
    { status: 202 },
  );
}
