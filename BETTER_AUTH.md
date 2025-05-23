# Better Auth Integration

Integrating Better Auth for authentication in the application.

## Completed Tasks

- [x] Create API Route (`app/api/auth/[...all]/route.ts`)
- [x] Create Auth Client (`lib/auth-client.ts`)
- [x] Configure Middleware (`middleware.ts`)
- [x] Enable Email & Password Auth (`lib/auth.ts`)
- [x] Implement Sign Up (`components/auth/sign-up.tsx` with link to sign-in)
- [x] Implement Sign In (`components/auth/sign-in.tsx` with link to sign-up)

## In Progress Tasks

- [x] Implement Sign Out (`components/nav-user.tsx`)
- [x] Implement Client-Side Session Management (`components/nav-user.tsx` using `useSession`)
- [ ] Implement Server-Side Session Management
- [ ] Associate user with workspace on sign-up (`lib/auth.ts` - done for email/pass, TODO for social)

## Future Tasks

- [ ] Implement Social Sign-On (e.g., GitHub, Google)
- [ ] Implement Two-Factor Authentication (if needed)

## Implementation Plan

Follow the Better Auth documentation to integrate authentication features.

### Relevant Files

- `app/api/auth/[...all]/route.ts` - API route for Better Auth handler.
- `lib/auth-client.ts` - Better Auth client instance.
- `middleware.ts` - Middleware for protecting routes and handling subdomain rewrites.
- `lib/auth.ts` - Better Auth server configuration (including hooks for workspace creation).
- `components/auth/sign-in.tsx` - Sign-in form component.
- `components/auth/sign-up.tsx` - Sign-up form component.
- `components/nav-user.tsx` - Navigation component displaying user info and logout. 