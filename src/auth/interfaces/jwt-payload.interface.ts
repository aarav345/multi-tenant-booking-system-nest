// this is what lives inside the token
// Keep it minimal - this is decoded on every request
// Never put sensitive data here.

export interface JwtPayload {
  sub: string; // tenantID ( standard JWT "subject" clain )
  email: string;
  slug: string;
}
