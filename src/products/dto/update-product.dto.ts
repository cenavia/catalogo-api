import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

// Mismas reglas que CreateProductDto, pero todos los campos opcionales.
export class UpdateProductDto extends PartialType(CreateProductDto) {}
