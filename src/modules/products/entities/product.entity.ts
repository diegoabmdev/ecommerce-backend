import { ApiProperty } from '@nestjs/swagger';
import { Category } from 'src/modules/categories/entities/category.entity';
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
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID único del producto (UUID)',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Silla Gamer Pro v2',
    description: 'Título descriptivo del producto',
    uniqueItems: true,
  })
  @Column('text', { unique: true })
  title: string;

  @ApiProperty({
    example: 249.99,
    description: 'Precio del producto',
    default: 0,
  })
  @Column('float', { default: 0 })
  price: number;

  @ApiProperty({
    example: 'Una silla ergonómica diseñada para largas sesiones de juego.',
    description: 'Descripción detallada del producto',
    nullable: true,
  })
  @Column('text', { nullable: true })
  description: string;

  @ApiProperty({
    example: 'silla_gamer_pro_v2',
    description: 'URL amigable (Slug). Si no se envía, se genera del título.',
    uniqueItems: true,
  })
  @Column('text', { unique: true })
  slug: string;

  @ApiProperty({
    example: 50,
    description: 'Cantidad disponible en almacén',
    default: 0,
  })
  @Column('int', { default: 0 })
  stock: number;

  @ApiProperty({
    example: { material: 'Cuero sintético', color: 'Negro/Rojo' },
    description: 'Características técnicas del producto',
  })
  @Column('jsonb', { nullable: true })
  specifications: Record<string, string | number>;

  @ApiProperty({
    example: ['https://res.cloudinary.com/image1.jpg'],
    description: 'Arreglo de URLs de imágenes alojadas en la nube',
  })
  @Column('text', { array: true, default: [] })
  images: string[];

  @Column('float', { default: 0 })
  weight: number;

  @Column('jsonb', { nullable: true })
  dimensions: { width: number; height: number; depth: number };

  @Column('boolean', { default: true })
  isActive: boolean;

  @ApiProperty({
    example: ['cama', 'mueble', 'sillas'],
    description: 'Arreglo de tags del producto',
  })
  @Column('text', { array: true, default: [] })
  tags: string[];

  @ApiProperty({ example: 4.5, description: 'Promedio de calificaciones' })
  @Column('float', { default: 0 })
  ratingAverage: number;

  @Column('int', { default: 0 })
  reviewCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  checkSlug() {
    if (!this.slug) {
      this.slug = this.title;
    }
    this.slug = this.slug
      .toLowerCase()
      .replaceAll(' ', '_')
      .replaceAll("'", '');
  }

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
