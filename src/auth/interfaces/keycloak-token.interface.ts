/**
 * Represents the decoded Keycloak JWT access token payload.
 */
export interface KeycloakTokenPayload {
  /** Keycloak user ID (subject) */
  sub: string;

  /** Token issued-at timestamp */
  iat: number;

  /** Token expiration timestamp */
  exp: number;

  /** Issuer URL (Keycloak realm) */
  iss: string;

  /** Audience */
  aud: string | string[];

  /** Authorized party (client ID) */
  azp: string;

  /** Email address */
  email?: string;

  /** Whether the email is verified */
  email_verified?: boolean;

  /** User's preferred username */
  preferred_username?: string;

  /** User's given (first) name */
  given_name?: string;

  /** User's family (last) name */
  family_name?: string;

  /** Full display name */
  name?: string;

  /** Realm-level roles */
  realm_access?: {
    roles: string[];
  };

  /** Client-level roles keyed by client ID */
  resource_access?: {
    [clientId: string]: {
      roles: string[];
    };
  };

  /** Session state */
  session_state?: string;

  /** Token scope */
  scope?: string;
}

/**
 * Authenticated user object attached to the request after JWT validation.
 */
export interface AuthenticatedUser {
  /** Keycloak user ID */
  id: string;

  /** Email address */
  email: string;

  /** Whether the email is verified */
  emailVerified: boolean;

  /** Username */
  username: string;

  /** First name */
  firstName: string;

  /** Last name */
  lastName: string;

  /** Full name */
  name: string;

  /** All roles (realm + client combined) */
  roles: string[];

  /** Realm-level roles only */
  realmRoles: string[];

  /** Client-level roles only */
  clientRoles: string[];

  /** Raw token payload for advanced use */
  tokenPayload: KeycloakTokenPayload;
}
