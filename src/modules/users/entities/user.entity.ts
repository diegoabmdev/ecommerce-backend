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
}
