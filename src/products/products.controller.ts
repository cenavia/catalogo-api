import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthUser } from '../auth/interfaces/jwt-payload.interface';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { ProductsService } from './products.service';

// A diferencia de /health (público), TODO /products exige token.
@ApiTags('products')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Falta token o es inválido' })
@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOkResponse({ type: [Product] })
  findAll(@CurrentUser() user: AuthUser) {
    return this.productsService.findAllByOwner(user.id);
  }

  @Get(':id')
  @ApiOkResponse({ type: Product })
  @ApiNotFoundResponse({ description: 'No existe' })
  @ApiForbiddenResponse({ description: 'Es de otro usuario' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.productsService.findOneOwned(id, user.id);
  }

  @Post()
  @ApiCreatedResponse({ type: Product })
  create(@Body() dto: CreateProductDto, @CurrentUser() user: AuthUser) {
    return this.productsService.create(dto, user.id);
  }

  @Put(':id')
  @ApiOkResponse({ type: Product })
  @ApiNotFoundResponse({ description: 'No existe' })
  @ApiForbiddenResponse({ description: 'Es de otro usuario' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProductDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.productsService.update(id, dto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Producto eliminado' })
  @ApiNotFoundResponse({ description: 'No existe' })
  @ApiForbiddenResponse({ description: 'Es de otro usuario' })
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.productsService.remove(id, user.id);
  }
}
