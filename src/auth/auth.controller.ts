import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthenticatedUser } from './interfaces/keycloak-token.interface';

@ApiTags('Auth')
@ApiBearerAuth('keycloak')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Returns the current authenticated user's profile from the Keycloak token.
   */
  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile from Keycloak token' })
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getProfile(user);
  }
}
