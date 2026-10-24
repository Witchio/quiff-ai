import { NextResponse } from 'next/server';

// Demo-only credentials. Validation happens server-side; this route creates no session.
export async function POST(request: Request) {
  let body: { username?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: 'Please enter a username and password.' }, { status: 400 });
  }

  if (body.username === 'admin' && body.password === 'admin') {
    return NextResponse.json({ message: 'Login successful.' });
  }

  return NextResponse.json(
    { message: 'Incorrect username or password. Please try again.' },
    { status: 401 },
  );
}
