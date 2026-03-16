import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../../categories/entities/category.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

@Entity('products')
export class Product {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Silla Gamer Pro v2', uniqueItems: true })
  @Column('text', { unique: true })
  title: string;

  @ApiProperty({ example: 249.99 })
  @Column('float', { default: 0 })
  price: number;

  @ApiProperty({ example: 'Descripción detallada...', nullable: true })
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty({ example: 'silla_gamer_pro_v2' })
  @Column('text', { unique: true })
  slug: string;

  @ApiProperty({ example: 50 })
  @Column('int', { default: 0 })
  stock: number;

  @ApiProperty({ example: { color: 'Rojo' } })
  @Column('jsonb', { nullable: true })
  specifications: Record<string, string | number>;

  @ApiProperty({ example: ['https://image.com/1.jpg'] })
  @Column('text', { array: true, default: [] })
  images: string[];

  @ApiProperty({
    example: 1.5,
    description: 'Peso del producto en kilogramos (kg)',
    default: 0,
  })
  @Column('float', { default: 0 })
  weight: number;

  @ApiProperty({
    example: { width: 20, height: 10, depth: 5 },
    description: 'Dimensiones físicas del producto (Ancho, Alto, Profundidad)',
    nullable: true,
  })
  @Column('jsonb', { nullable: true })
  dimensions: { width: number; height: number; depth: number };

  @ApiProperty({
    example: true,
    description:
      'Indica si el producto está visible y disponible para la venta',
    default: true,
  })
  @Column('boolean', { default: true })
  isActive: boolean;

  @ApiProperty({
    example: ['hogar', 'muebles', 'oferta'],
    description: 'Etiquetas o palabras clave para facilitar la búsqueda',
    isArray: true,
  })
  @Column('text', { array: true, default: [] })
  tags: string[];

  @ApiProperty({ example: 4.5 })
  @Column('float', { default: 0 })
  ratingAverage: number;

  @ApiProperty({ example: 10 })
  @Column('int', { default: 0 })
  reviewCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @BeforeInsert()
  @BeforeUpdate()
  checkSlug() {
    if (!this.slug) this.slug = this.title;
    this.slug = this.slug
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^\w-]+/g, '');
  }
}
