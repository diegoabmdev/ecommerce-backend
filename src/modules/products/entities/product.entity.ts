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

  @ApiProperty({ example: 'Descripción detallada...', nullable: true })
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty({ example: 'silla_gamer_pro_v2' })
  @Column('text', { unique: true })
  slug: string;

  @ApiProperty({ example: 'Samsung', description: 'Marca del producto' })
  @Column('text', { nullable: true })
  brand: string;

  @ApiProperty({ example: 'SKU123456', uniqueItems: true })
  @Column('text', { unique: true, nullable: true })
  sku: string;

  @ApiProperty({ example: 249.99, description: 'Precio base original' })
  @Column('numeric', { precision: 10, scale: 2, default: 0 })
  price: number;

  @ApiProperty({ example: 15.5, description: 'Porcentaje de descuento' })
  @Column('float', { default: 0 })
  discountPercentage: number;

  @ApiProperty({ example: 50 })
  @Column('int', { default: 0 })
  stock: number;

  @ApiProperty({ example: 'In Stock', description: 'Estado de disponibilidad' })
  @Column('text', { default: 'In Stock' })
  availabilityStatus: string;

  @ApiProperty({ example: { color: 'Rojo' } })
  @Column('jsonb', { nullable: true })
  specifications: Record<string, string | number>;

  @ApiProperty({ example: ['https://image.com/1.jpg'] })
  @Column('text', { array: true, default: [] })
  images: string[];

  @ApiProperty({ example: 1.5, description: 'Peso en kg' })
  @Column('float', { default: 0 })
  weight: number;

  @ApiProperty({
    example: { width: 20, height: 10, depth: 5 },
    description: 'Dimensiones físicas',
    nullable: true,
  })
  @Column('jsonb', { nullable: true })
  dimensions: { width: number; height: number; depth: number };

  @ApiProperty({ example: '1 year warranty' })
  @Column('text', { nullable: true })
  warrantyInformation: string;

  @ApiProperty({ example: 'Ships in 3-5 business days' })
  @Column('text', { nullable: true })
  shippingInformation: string;

  @ApiProperty({ example: '30 days return policy' })
  @Column('text', { nullable: true })
  returnPolicy: string;

  @ApiProperty({ example: 1 })
  @Column('int', { default: 1 })
  minimumOrderQuantity: number;

  @ApiProperty({ example: true, default: true })
  @Column('boolean', { default: true })
  isActive: boolean;

  @ApiProperty({ example: ['hogar', 'muebles'], isArray: true })
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
