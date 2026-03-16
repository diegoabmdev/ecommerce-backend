import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Address } from './entities/address.entity';
import { MailService } from '../mail/mail.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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
  } as unknown as User;

  const mockUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[mockUser], 1]),
    })),
  };

  const mockAddressRepository = {
    findOne: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and return a user without password', async () => {
      const dto: CreateUserDto = {
        email: 'test@test.com',
        password: 'password123',
      };
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(dto);

      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe(mockUser.email);
    });
  });

  describe('findOne', () => {
    it('should return a user if found', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.findOne('uuid-123');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return user without password', async () => {
      const updateDto: UpdateUserDto = { fullName: 'New Name' };
      const updatedUser = { ...mockUser, ...updateDto };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.merge.mockReturnValue(updatedUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update('uuid-123', updateDto);

      expect(result.fullName).toBe('New Name');
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('addAddress', () => {
    const addressDto = {
      street: 'Calle Falsa',
      number: '123',
      city: 'Springfield',
      region: 'santiago',
      isDefault: true,
    };

    it('should throw BadRequestException if address already exists', async () => {
      mockAddressRepository.findOne.mockResolvedValue({ id: 'existing-addr' });

      await expect(service.addAddress(mockUser, addressDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should add address and set others to non-default if isDefault is true', async () => {
      mockAddressRepository.findOne.mockResolvedValue(null);
      mockAddressRepository.create.mockReturnValue(addressDto);
      mockAddressRepository.save.mockResolvedValue({
        id: 'new-addr',
        ...addressDto,
      });

      const result = await service.addAddress(mockUser, addressDto);

      expect(mockAddressRepository.update).toHaveBeenCalled();
      expect(result.message).toContain('correctamente');
    });
  });
});
