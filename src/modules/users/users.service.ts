import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
}
