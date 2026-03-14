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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
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
}
