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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  title: string;

  @Column('float', { default: 0 })
  price: number;

  @Column('text', { nullable: true })
  description: string;

  @Column('text', { unique: true })
  slug: string;

  @Column('int', { default: 0 })
  stock: number;

  @Column('jsonb', { nullable: true })
  specifications: Record<string, string | number>;

  @Column('text', { array: true, default: [] })
  images: string[];

  @Column('float', { default: 0 })
  weight: number;

  @Column('jsonb', { nullable: true })
  dimensions: { width: number; height: number; depth: number };

  @Column('boolean', { default: true })
  isActive: boolean;

  @Column('text', { array: true, default: [] })
  tags: string[];

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
