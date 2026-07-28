// The Next.js app is the session boundary (httpOnly cookie on the browser
// origin); FastAPI itself stays stateless and only ever sees a Bearer token
// forwarded from here. See app/api/auth/*/route.ts and middleware.ts.
export const SESSION_COOKIE = "donum_dei_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days — mirrors AUTH_TOKEN_TTL_DAYS
