---
assurance:
  id: t-2
  base: sha256:cefe12019b7be5c53a3fb1be4ddb3ee45a522a97809c5411b3e03d645b65bf53
---
# Valid browser signup acknowledges a non-persistent demo

> Submit valid signup details through the browser and observe 202 plus explicit acknowledgment that no account was saved, without a signup-created session cookie.

## Step 1 @verifies ac-3

Open {{start_url}} in the browser and inspect the signup form's username, email, password, and confirmation fields, then assert all four fields are required.

## Step 2 @verifies ac-2, ac-4, ac-6, ac-10, ac-11

On the signup form at {{start_url}}, submit username {{signup_username_8}} of exactly eight characters after trimming, email {{signup_email}}, password {{signup_password_10}} of exactly ten raw characters, and matching confirmation {{signup_password_10}}; inspect the submission in browser network traffic, then assert a JSON POST to /api/signup returned 202 and the page explicitly acknowledges that no account was created or saved.

## Step 3 @verifies ac-1

After the accepted signup on {{start_url}}, inspect the browser's cookies for the signup origin, then assert the signup did not create a session cookie.
