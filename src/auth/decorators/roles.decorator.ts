import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator to restrict access to users with specific Keycloak roles.
 * Roles can be realm-level or client-level — both are checked.
 *
 * @example
 * @Roles('admin', 'instructor')
 * @UseGuards(RolesGuard)
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
