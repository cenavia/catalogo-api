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
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  name: string;

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

  @Column({ default: 0 })
  stock: number;

  // eager: el owner se carga siempre junto al producto.
  // nullable: false -> todo producto tiene dueño.
  // onDelete: 'CASCADE' -> si se borra el usuario, se borran sus productos.
  @ManyToOne(() => User, (u) => u.products, {
    eager: true,
    nullable: false,
    onDelete: 'CASCADE',
  })
  owner: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}