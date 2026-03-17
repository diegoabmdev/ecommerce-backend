import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('cart_items')
export class CartItem {
  @ApiProperty({
    example: 'cd3a63e0-488d-4526-9e3a-5a1d2626f1d7',
    description: 'ID único del ítem en el carrito',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 1,
    description: 'Cantidad de unidades',
  })
  @Column('int', { default: 1 })
  quantity: number;

  @ApiProperty({
    description: 'Datos del usuario propietario',
    type: () => User,
    example: {
      id: '2eca5084-3efc-4e35-90b5-3c8dc41baa02',
      email: 'aaaa@ejemplo.com',
      fullName: null,
      phone: null,
      role: 'admin',
      isActive: true,
      createdAt: '2026-03-15T21:18:43.182Z',
      updatedAt: '2026-03-16T11:31:21.913Z',
    },
  })
  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  user: User;

  @ApiProperty({
    description: 'Datos del producto agregado',
    type: () => Product,
    example: {
      id: '436cd5b2-c14e-495f-9e7a-6defb882a1de',
      title: 'Silla Herman Miller Embody',
      price: 1800,
      description: 'La mejor silla para cuidar tu espalda.',
      slug: 'silla_herman_miller_embody',
      stock: 3,
      specifications: {
        Garantia: '12 años',
        Material: 'Teclado Sync',
      },
      images: ['https://ejemplo.com/embody.jpg'],
      weight: 0,
      dimensions: null,
      isActive: true,
      tags: ['muebles', 'ergonomia', 'luxury'],
      ratingAverage: 0,
      reviewCount: 0,
      createdAt: '2026-03-11T03:07:31.512Z',
      updatedAt: '2026-03-11T09:32:26.665Z',
      category: null,
    },
  })
  @ManyToOne(() => Product, (product) => product.id, {
    onDelete: 'CASCADE',
    eager: true,
  })
  product: Product;

  @ApiProperty({ example: '2026-03-17T00:34:07.265Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2026-03-17T00:34:07.265Z' })
  @UpdateDateColumn()
  updatedAt: Date;
}
