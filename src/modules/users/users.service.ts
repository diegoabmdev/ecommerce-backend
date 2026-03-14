import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { User } from './entities/user.entity';
import { Address } from './entities/address.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { IsNull } from 'typeorm';
import * as crypto from 'crypto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { MailService } from '../mail/mail.service';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    private readonly mailService: MailService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...userData } = createUserDto;

    const user = this.userRepository.create({
      ...userData,
      password: bcrypt.hashSync(password, 10),
    });

    await this.userRepository.save(user);

    const userResponse = { ...user };
    delete (userResponse as Partial<User>).password;
    return userResponse;
  }

  async findOneByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'role'],
    });
  }

  async findAll() {
    return await this.userRepository.find({
      relations: ['addresses'],
    });
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['addresses'],
    });

    if (!user) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { password, ...toUpdate } = updateUserDto;

    const user = await this.findOne(id);

    if (password) {
      user.password = bcrypt.hashSync(password, 10);
    }

    this.userRepository.merge(user, toUpdate);
    const updatedUser = await this.userRepository.save(user);

    const userResponse = { ...updatedUser };
    delete (userResponse as Partial<User>).password;
    return userResponse;
  }

  async addAddress(user: User, createAddressDto: CreateAddressDto) {
    const { street, number, apartment, city, isDefault, ...addressData } =
      createAddressDto;

    const existingAddress = await this.addressRepository.findOne({
      where: {
        street,
        number,
        apartment: apartment ? apartment : IsNull(),
        city,
        user: { id: user.id },
      },
    });

    if (existingAddress) {
      throw new BadRequestException(
        'Esta dirección ya se encuentra registrada en tu perfil',
      );
    }

    if (isDefault) {
      await this.addressRepository.update(
        { user: { id: user.id }, isDefault: true },
        { isDefault: false },
      );
    }

    const newAddress = this.addressRepository.create({
      street,
      number,
      apartment,
      city,
      ...addressData,
      isDefault: isDefault || false,
      user,
    });

    const savedAddress = await this.addressRepository.save(newAddress);
    const addressResponse: Omit<Address, 'user'> = { ...savedAddress };
    delete (addressResponse as Partial<Address>).user;

    return addressResponse;
  }

  async findAddresses(userId: string) {
    return await this.addressRepository.find({
      where: { user: { id: userId } },
      order: { isDefault: 'DESC', street: 'ASC' },
    });
  }

  async removeAddress(addressId: string, userId: string) {
    const address = await this.addressRepository.findOneBy({
      id: addressId,
      user: { id: userId },
    });

    if (!address) throw new NotFoundException('Dirección no encontrada');

    await this.addressRepository.remove(address);
    return { message: 'Dirección eliminada correctamente' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user)
      return { message: 'Si el correo existe, recibirás un mensaje pronto.' };

    if (user.resetPasswordExpires) {
      const now = new Date();
      if (user.resetPasswordExpires.getTime() - now.getTime() > 58 * 60000) {
        throw new BadRequestException('Espera antes de pedir otro correo.');
      }
    }

    const token = crypto.randomBytes(20).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;

    await this.userRepository.save(user);

    await this.mailService.sendResetPasswordEmail(user.email, token);

    return { message: 'Correo de recuperación enviado.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    const user = await this.userRepository.findOne({
      where: { resetPasswordToken: token },
      select: ['id', 'password', 'resetPasswordToken', 'resetPasswordExpires'],
    });

    if (!user) {
      throw new BadRequestException('El token de recuperación es inválido');
    }

    const now = new Date();
    if (user.resetPasswordExpires && now > user.resetPasswordExpires) {
      throw new BadRequestException(
        'El token ha expirado. Solicita uno nuevo.',
      );
    }

    user.password = bcrypt.hashSync(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await this.userRepository.save(user);

    return {
      message: 'Tu contraseña ha sido actualizada exitosamente',
    };
  }
}
