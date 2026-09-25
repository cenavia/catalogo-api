import { ApiProperty } from '@nestjs/swagger';

// Solo documenta la respuesta de POST /auth/login.
export class TokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;
}
