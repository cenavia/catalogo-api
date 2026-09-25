import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('products')
export class Product {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Teclado mecánico' })
  @Column({ length: 150 })
  name: string;

  @ApiProperty({ example: 49.9 })
  // pg devuelve DECIMAL como string para no perder precisión: lo convertimos a number.
  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string | null) => (value === null ? null : Number(value)),
    },
  })
  price: number;

  @ApiProperty({ example: 10 })
  @Column({ default: 0 })
  stock: number;

  @ApiProperty({ type: () => User })
  // eager: el owner se carga siempre junto al producto.
  // nullable: false -> todo producto tiene dueño.
  // onDelete: 'CASCADE' -> si se borra el usuario, se borran sus productos.
  @ManyToOne(() => User, (u) => u.products, {
    eager: true,
    nullable: false,
    onDelete: 'CASCADE',
  })
  owner: User;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;
}
