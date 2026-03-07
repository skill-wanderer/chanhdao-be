import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import {
  KeycloakTokenPayload,
  AuthenticatedUser,
} from '../interfaces/keycloak-token.interface';

@Injectable()
export class KeycloakStrategy extends PassportStrategy(Strategy, 'keycloak') {
  private readonly logger = new Logger(KeycloakStrategy.name);

  constructor(private readonly configService: ConfigService) {
    const keycloakBaseUrl = configService.get<string>('keycloak.baseUrl');
    const keycloakRealm = configService.get<string>('keycloak.realm');
    const jwksUri = `${keycloakBaseUrl}/realms/${keycloakRealm}/protocol/openid-connect/certs`;
    const issuer = `${keycloakBaseUrl}/realms/${keycloakRealm}`;

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri,
      }),
      issuer,
      algorithms: ['RS256'],
    });

    this.logger.log(`Keycloak JWT strategy initialized`);
    this.logger.log(`JWKS URI: ${jwksUri}`);
    this.logger.log(`Issuer: ${issuer}`);
  }

  /**
   * Validates the decoded Keycloak JWT and returns the authenticated user.
   * Called automatically by Passport after successful JWT verification.
   */
  validate(payload: KeycloakTokenPayload): AuthenticatedUser {
    const clientId = this.configService.get<string>('keycloak.clientId');

    const realmRoles = payload.realm_access?.roles ?? [];
    const clientRoles =
      (clientId ? payload.resource_access?.[clientId]?.roles : undefined) ?? [];
    const allRoles = [...new Set([...realmRoles, ...clientRoles])];

    return {
      id: payload.sub,
      email: payload.email ?? '',
      emailVerified: payload.email_verified ?? false,
      username: payload.preferred_username ?? '',
      firstName: payload.given_name ?? '',
      lastName: payload.family_name ?? '',
      name: payload.name ?? '',
      roles: allRoles,
      realmRoles,
      clientRoles,
      tokenPayload: payload,
    };
  }
}
