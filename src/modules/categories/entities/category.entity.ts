import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../../products/entities/product.entity';

@Entity('categories')
export class Category {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID único de la categoría (UUID)',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Electrónica',
    description: 'Nombre de la categoría',
    uniqueItems: true,
  })
  @Column('text', { unique: true })
  name: string;

  @ApiProperty({
    example: 'Dispositivos tecnológicos y gadgets de última generación',
    description: 'Breve descripción de la categoría',
    nullable: true,
  })
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty({ example: 'Mesas' })
  @Column('text', { unique: true })
  slug: string;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @ApiProperty({
    example: 15,
    description: 'Cantidad de productos activos en esta categoría',
    required: false,
  })
  productsCount?: number;

  @BeforeInsert()
  @BeforeUpdate()
  checkSlug() {
    if (!this.slug && this.name) {
      this.slug = this.name;
    }

    if (this.slug) {
      this.slug = this.slug
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '_')
        .replace(/[^\w-]+/g, '');
    }
  }
}
