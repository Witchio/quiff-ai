---
mode: testing
max_steps: 50
target: chrome
---

# Session: login-check

## Step 1
Open http://localhost:3000. Verify a successful login with username admin and password admin, confirm the welcome success state, then sign out. Submit username admin with an incorrect password and verify an inline incorrect-credentials error is shown.
