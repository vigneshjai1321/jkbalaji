# (auth) route group

Public, unauthenticated pages. The group name does not appear in the URL.

| Folder              | URL                | Purpose                         |
|---------------------|--------------------|---------------------------------|
| `login/`            | `/login`           | Email/mobile + password sign-in |
| `forgot-password/`  | `/forgot-password` | Request reset link/OTP          |
| `reset-password/`   | `/reset-password`  | Set new password from token     |

A `layout.tsx` here will hold the centred auth card layout (branding).
