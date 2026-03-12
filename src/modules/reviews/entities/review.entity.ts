import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Check,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('reviews')
@Check(`"rating" >= 1 AND "rating" <= 5`)
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int')
  rating: number;

  @Column('text')
  comment: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Product, (product) => product.id, { onDelete: 'CASCADE' })
  product: Product;
}
