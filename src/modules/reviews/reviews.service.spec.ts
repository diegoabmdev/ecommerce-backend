import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

import { ReviewsService } from './reviews.service';
import { Review } from './entities/review.entity';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { OrdersService } from '../orders/orders.service';
import { ProductsService } from '../products/products.service';
import { CreateReviewDto } from './dto/create-review.dto';

describe('ReviewsService', () => {
  let service: ReviewsService;

  const mockUser = {
    id: 'user-uuid',
    email: 'test@test.com',
  } as unknown as User;
  const mockProduct = {
    id: 'prod-uuid',
    title: 'Test Product',
  } as unknown as Product;
  const mockReview = {
    id: 'rev-uuid',
    rating: 5,
    comment: 'Excelente producto',
    user: { ...mockUser },
    product: { ...mockProduct },
  } as unknown as Review;

  const queryBuilderMock = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getRawOne: jest.fn().mockResolvedValue({ avgRating: '4.5', count: '10' }),
  };

  const mockReviewRepository = {
    create: jest.fn().mockReturnValue(mockReview),
    save: jest.fn().mockResolvedValue(mockReview),
    findOne: jest.fn(),
    find: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => queryBuilderMock),
  };

  const mockOrdersService = {
    checkUserBoughtProduct: jest.fn(),
  };

  const mockProductsService = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: getRepositoryToken(Review), useValue: mockReviewRepository },
        { provide: OrdersService, useValue: mockOrdersService },
        { provide: ProductsService, useValue: mockProductsService },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateReviewDto = {
      productId: 'prod-uuid',
      rating: 5,
      comment: 'Muy buena calidad',
    };

    it('should create a review successfully', async () => {
      mockProductsService.findOne.mockResolvedValue(mockProduct);
      mockOrdersService.checkUserBoughtProduct.mockResolvedValue(true);
      mockReviewRepository.findOne.mockResolvedValue(null);

      const result = await service.create(createDto, mockUser);

      expect(result).toBeDefined();
      expect(mockReviewRepository.save).toHaveBeenCalled();
      expect(mockProductsService.update).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user has not bought the product', async () => {
      mockProductsService.findOne.mockResolvedValue(mockProduct);
      mockOrdersService.checkUserBoughtProduct.mockResolvedValue(false);

      await expect(service.create(createDto, mockUser)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw BadRequestException if user already reviewed the product', async () => {
      mockProductsService.findOne.mockResolvedValue(mockProduct);
      mockOrdersService.checkUserBoughtProduct.mockResolvedValue(true);
      mockReviewRepository.findOne.mockResolvedValue(mockReview);

      await expect(service.create(createDto, mockUser)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateProductRating', () => {
    it('should calculate average and call productsService.update', async () => {
      queryBuilderMock.getRawOne.mockResolvedValue({
        avgRating: '4.3333',
        count: '3',
      });

      mockReviewRepository.findOne.mockResolvedValue(mockReview);
      await service.remove('rev-uuid', { ...mockUser, role: 'admin' } as User);

      expect(mockProductsService.update).toHaveBeenCalledWith('prod-uuid', {
        ratingAverage: 4.3,
        reviewCount: 3,
      });
    });
  });

  describe('remove', () => {
    it('should remove review if user is the owner', async () => {
      mockReviewRepository.findOne.mockResolvedValue(mockReview);

      const result = await service.remove('rev-uuid', mockUser);

      expect(result.message).toContain('correctamente');
      expect(mockReviewRepository.remove).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user is not the owner and not admin', async () => {
      const strangerUser = { id: 'other-user', role: 'customer' } as User;
      mockReviewRepository.findOne.mockResolvedValue(mockReview);

      await expect(service.remove('rev-uuid', strangerUser)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
