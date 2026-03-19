import { registerAs } from '@nestjs/config';

const removeTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

export default registerAs('keycloak', () => ({
  baseUrl: removeTrailingSlash(
    process.env.KEYCLOAK_BASE_URL || 'http://localhost:8080',
  ),
  realm: process.env.KEYCLOAK_REALM || 'lms',
  clientId: process.env.KEYCLOAK_CLIENT_ID || undefined,
  get issuerUrl() {
    if (process.env.KEYCLOAK_ISSUER_URL) {
      return removeTrailingSlash(process.env.KEYCLOAK_ISSUER_URL);
    }

    return `${this.baseUrl}/realms/${this.realm}`;
  },
  get jwksUri() {
    if (process.env.KEYCLOAK_JWKS_URI) {
      return removeTrailingSlash(process.env.KEYCLOAK_JWKS_URI);
    }

    return `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/certs`;
  },
  get tokenEndpoint() {
    const issuerUrl = this.issuerUrl as string;
    return `${issuerUrl}/protocol/openid-connect/token`;
  },
  get userInfoEndpoint() {
    const issuerUrl = this.issuerUrl as string;
    return `${issuerUrl}/protocol/openid-connect/userinfo`;
  },
}));
