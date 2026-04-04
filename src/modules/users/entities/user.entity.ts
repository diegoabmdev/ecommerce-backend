import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Address } from './address.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Wishlist } from '../../wishlist/entities/wishlist.entity';

@Entity('users')
export class User {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID único del usuario (UUID)',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'admin@ejemplo.com',
    description: 'Correo electrónico único',
  })
  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @ApiProperty({ example: 'diego_dev', description: 'Nombre de usuario único' })
  @Column({ unique: true, nullable: true })
  username: string;

  @ApiProperty({ example: 'male', enum: ['male', 'female', 'other'] })
  @Column({ type: 'text', nullable: true })
  gender: string;

  @ApiProperty({ example: '1995-10-25', description: 'Fecha de nacimiento' })
  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @ApiProperty({
    example: 'Diego Abanto',
    description: 'Nombre completo',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  fullName: string;

  @ApiProperty({
    example: '+56912345678',
    description: 'Teléfono',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  phone: string;

  @ApiProperty({
    example: 'customer',
    description: 'Rol del usuario en la plataforma',
    enum: ['customer', 'admin', 'superAdmin'],
  })
  @Column({ default: 'customer' })
  role: string;

  @Column('text', {
    nullable: true,
    select: false,
  })
  resetPasswordToken?: string | null;

  @Column('timestamp', {
    nullable: true,
    select: false,
  })
  resetPasswordExpires?: Date | null;

  @ApiProperty({
    example: true,
    description: 'Estado de la cuenta',
  })
  @Column({ default: true })
  isActive: boolean;

  @ApiProperty({ example: 5, description: 'Cantidad de pedidos realizados' })
  ordersCount?: number;

  @ApiProperty({
    type: () => [Address],
    description: 'Lista de direcciones asociadas',
  })
  @OneToMany(() => Address, (address) => address.user, { cascade: true })
  addresses: Address[];

  @ApiProperty({ example: '2026-03-15T17:00:00.000Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2026-03-15T17:00:00.000Z' })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({
    type: () => [Wishlist],
    description: 'Productos en la lista de deseos del usuario',
  })
  @OneToMany(() => Wishlist, (wishlist) => wishlist.user)
  wishlist: Wishlist[];
}
