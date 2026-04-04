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
import { OrderType, PaginationDto } from '../../common/dtos/pagination.dto';

interface AuthMessageResponse {
  message: string;
}

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

  async findAll(paginationDto: PaginationDto) {
    const {
      limit = 10,
      offset = 0,
      search,
      sortBy = 'createdAt',
      order = OrderType.DESC,
      gender,
      role,
    } = paginationDto;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.addresses', 'addresses')
      .leftJoin('user.orders', 'orders')
      .loadRelationCountAndMap('user.ordersCount', 'user.orders');

    if (search) {
      queryBuilder.andWhere(
        '(user.fullName ILIKE :search OR user.email ILIKE :search OR user.username ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (gender) {
      queryBuilder.andWhere('user.gender = :gender', { gender });
    }

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    const validSortFields = ['createdAt', 'fullName', 'email', 'username'];
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    queryBuilder.orderBy(`user.${finalSortBy}`, order);

    const [users, total] = await queryBuilder
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    return {
      users,
      total,
      skip: offset,
      limit,
      page: Math.floor(offset / limit) + 1,
      lastPage: Math.ceil(total / limit),
    };
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
    return { message: 'Usuario eliminado correctamente' };
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

  async addAddress(user: User, dto: CreateAddressDto) {
    const { isDefault, ...addressData } = dto;
    await this.checkExistingAddress(user.id, dto);

    if (isDefault) {
      await this.addressRepository.update(
        { user: { id: user.id }, isDefault: true },
        { isDefault: false },
      );
    }

    const newAddress = this.addressRepository.create({
      ...addressData,
      isDefault: isDefault ?? false,
      user,
    });

    const savedAddress = await this.addressRepository.save(newAddress);
    const addressResponse: Omit<Address, 'user'> = { ...savedAddress };
    delete (addressResponse as Partial<Address>).user;

    return {
      message: 'Dirección añadida correctamente a tu perfil',
      data: savedAddress,
    };
  }

  private async checkExistingAddress(userId: string, dto: CreateAddressDto) {
    const exists = await this.addressRepository.findOne({
      where: {
        street: dto.street,
        number: dto.number,
        apartment: dto.apartment ?? IsNull(),
        city: dto.city,
        user: { id: userId },
      },
    });

    if (exists) {
      throw new BadRequestException('Esta dirección ya existe en tu cuenta');
    }
  }

  async findAddresses(userId: string, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const [addresses, total] = await this.addressRepository.findAndCount({
      where: { user: { id: userId } },
      order: { isDefault: 'DESC', street: 'ASC' },
      take: limit,
      skip: offset,
    });

    return {
      data: addresses,
      meta: { total, limit, offset },
    };
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

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<AuthMessageResponse> {
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

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = this.hashToken(resetToken);

    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = expires;

    await this.userRepository.save(user);

    await this.mailService.sendResetPasswordEmail(user.email, resetToken);

    return { message: 'Correo de recuperación enviado.' };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<AuthMessageResponse> {
    const { token, newPassword } = resetPasswordDto;

    const hashedToken = this.hashToken(token);

    const user = await this.userRepository.findOne({
      where: { resetPasswordToken: hashedToken },
      select: ['id', 'password', 'resetPasswordToken', 'resetPasswordExpires'],
    });

    if (!user) {
      throw new BadRequestException(
        'El token de recuperación es inválido o ya fue usado',
      );
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
