---
assurance:
  id: t-3
  base: sha256:8f924c8810f1cd45b7720ddd84708f0ab5d25a784617b57162b9a370f61119e7
---
# Browser rejects eight-character password before request

> Submit otherwise-valid details with username of at least ten characters and exactly eight-character matching password; observe password field minimum error and no signup request.

## Step 1

At {{start_url}}, reach the demo signup form with username, email, password and password-confirmation fields.

## Step 2 @verifies ac-15, ac-16

On the demo signup form, supply username {{signup_username_10}} (at least ten characters), email {{signup_email}}, password {{signup_password_8}} (exactly eight characters) and matching confirmation; attempt to submit while inspecting browser network traffic, then assert a password-associated 10-character-minimum error appears and no POST /api/signup is sent for this attempt.
