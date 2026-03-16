import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('addresses')
@Unique(['street', 'number', 'apartment', 'city', 'user'])
export class Address {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ example: 'Av. Siempre Viva' })
  @Column()
  street: string;

  @ApiProperty({ example: '742' })
  @Column()
  number: string;

  @ApiProperty({ example: 'Apt 4B', nullable: true })
  @Column({ nullable: true })
  apartment: string;

  @ApiProperty({ example: 'Santiago' })
  @Column()
  city: string;

  @ApiProperty({ example: 'Región Metropolitana' })
  @Column()
  region: string;

  @ApiProperty({ example: false })
  @Column({ default: false })
  isDefault: boolean;

  @ManyToOne(() => User, (user) => user.addresses, { onDelete: 'CASCADE' })
  user: User;
}
