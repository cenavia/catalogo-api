import { Exclude } from 'class-transformer';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

export type Role = 'user' | 'admin';

// 'user' es palabra reservada en PostgreSQL: nombramos la tabla en plural.
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude() // nunca se serializa en las respuestas (ver ClassSerializerInterceptor)
  password: string;

  @Column({ type: 'varchar', length: 20, default: 'user' })
  role: Role;

  @OneToMany(() => Product, (p) => p.owner)
  products: Product[];
}
