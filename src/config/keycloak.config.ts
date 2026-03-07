import { registerAs } from '@nestjs/config';

export default registerAs('keycloak', () => ({
  baseUrl: process.env.KEYCLOAK_BASE_URL || 'http://localhost:8080',
  realm: process.env.KEYCLOAK_REALM || 'lms',
  clientId: process.env.KEYCLOAK_CLIENT_ID || undefined,
  get issuerUrl() {
    return `${this.baseUrl}/realms/${this.realm}`;
  },
  get jwksUri() {
    return `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/certs`;
  },
  get tokenEndpoint() {
    return `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token`;
  },
  get userInfoEndpoint() {
    return `${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/userinfo`;
  },
}));
