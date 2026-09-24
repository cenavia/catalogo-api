import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  // Endpoint de salud: permite comprobar que la API está arriba.
  @Get('health')
  health() {
    return { status: 'ok' };
  }
}