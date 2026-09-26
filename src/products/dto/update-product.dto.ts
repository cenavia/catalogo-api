import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

// PartialType de @nestjs/swagger: además de validación, hereda la documentación.
export class UpdateProductDto extends PartialType(CreateProductDto) {}
