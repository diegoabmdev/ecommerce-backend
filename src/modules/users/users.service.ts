import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      const hashedPassword: string = bcrypt.hashSync(password, 10);

      const user = this.userRepository.create({
        ...userData,
        password: hashedPassword,
      });

      await this.userRepository.save(user);

      const userResponse = { ...user };
      delete (userResponse as Partial<User>).password;
      return userResponse;
    } catch (error) {
      this.handleDbErrors(error);
    }
  }

  async findOneByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'role'],
    });
  }

  private handleDbErrors(error: any): never {
    const dbError = error as { code?: string };

    if (dbError.code === '23505')
      throw new BadRequestException('El correo ya existe en la base de datos');

    throw new InternalServerErrorException(
      'Error inesperado, revise los logs del servidor',
    );
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
      throw new BadRequestException(`Usuario con id ${id} no encontrado`);
    }

    return user;
  }
}
