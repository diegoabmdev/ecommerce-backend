import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Address } from './entities/address.entity';
import { MailService } from '../mail/mail.service';
import { CreateUserDto } from './dto/create-user.dto';
import { OrderType, PaginationDto } from '../../common/dtos/pagination.dto';

describe('UsersService', () => {
  let service: UsersService;

  const mockUser = {
    id: 'uuid-123',
    email: 'test@test.com',
    fullName: 'Test User',
    password: 'hashedPassword',
    addresses: [],
    role: 'customer',
    isActive: true,
    ordersCount: 0,
  } as unknown as User;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    loadRelationCountAndMap: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[mockUser], 1]),
  };

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockAddressRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    findOneBy: jest.fn(),
    remove: jest.fn(),
  };

  const mockMailService = {
    sendResetPasswordEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        {
          provide: getRepositoryToken(Address),
          useValue: mockAddressRepository,
        },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated users with ordersCount', async () => {
      const paginationDto: PaginationDto = {
        limit: 5,
        offset: 0,
        search: 'test',
        gender: 'male',
        order: OrderType.ASC,
      };

      const result = await service.findAll(paginationDto);

      expect(mockUserRepository.createQueryBuilder).toHaveBeenCalledWith(
        'user',
      );
      expect(mockQueryBuilder.loadRelationCountAndMap).toHaveBeenCalledWith(
        'user.ordersCount',
        'user.orders',
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'user.createdAt',
        'ASC',
      );

      expect(result).toHaveProperty('users');
      expect(result.users).toBeInstanceOf(Array);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.lastPage).toBe(1);
    });

    it('should use default values if paginationDto is empty', async () => {
      await service.findAll({});
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'user.createdAt',
        'DESC',
      );
    });
  });

  describe('create', () => {
    it('should create and return a user without password', async () => {
      const dto: CreateUserDto = {
        email: 'test@test.com',
        password: 'Password123!',
        fullName: 'Diego Abanto',
      };
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(dto);

      expect(result).not.toHaveProperty('password');
      expect(mockUserRepository.create).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a user if found', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.remove.mockResolvedValue(mockUser);

      const result = await service.remove('uuid-123');

      expect(result.message).toBe('Usuario eliminado correctamente');
      expect(mockUserRepository.remove).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.findOne('uuid-123');
      expect(result).toEqual(mockUser);
    });
  });
});
