import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 2 })
  @Column('int')
  quantity: number;

  @ApiProperty({ example: 25.5 })
  @Column('float')
  priceAtPurchase: number;

  @ApiProperty({ type: () => Order })
  @ManyToOne(() => Order, (order) => order.items)
  order: Order;

  @ApiProperty({ type: () => Product })
  @ManyToOne(() => Product, (product) => product.id)
  product: Product;
}
