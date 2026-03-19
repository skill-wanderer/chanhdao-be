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
    const bootstrapLogger = new Logger(KeycloakStrategy.name);
    const keycloakBaseUrl = configService.get<string>('keycloak.baseUrl');
    const keycloakRealm = configService.get<string>('keycloak.realm');
    const jwksUri = configService.get<string>('keycloak.jwksUri');
    const issuer = configService.get<string>('keycloak.issuerUrl');

    if (!jwksUri || !issuer) {
      throw new Error(
        'Keycloak configuration is incomplete. Please provide KEYCLOAK_BASE_URL/KEYCLOAK_REALM or explicit KEYCLOAK_ISSUER_URL and KEYCLOAK_JWKS_URI.',
      );
    }

    if (keycloakBaseUrl?.includes('/realms/')) {
      bootstrapLogger.warn(
        'KEYCLOAK_BASE_URL appears to contain a realm path. Use only host base URL (e.g. https://sso.example.com) and set KEYCLOAK_REALM separately.',
      );
    }

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
    this.logger.log(`Realm: ${keycloakRealm}`);
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
