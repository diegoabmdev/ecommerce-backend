/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { ProductsService } from './products.service';
import { Product } from './entities/product.entity';
import { FilesService } from '../files/files.service';
import { CategoriesService } from '../categories/categories.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Category } from '../categories/entities/category.entity';
import { UploadApiResponse } from 'cloudinary';
import { Wishlist } from '../wishlist/entities/wishlist.entity';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: jest.Mocked<Repository<Product>>;
  let wishlistRepository: jest.Mocked<Repository<Wishlist>>;
  let filesService: jest.Mocked<FilesService>;
  let categoriesService: jest.Mocked<CategoriesService>;

  const mockProduct = {
    id: 'uuid-123',
    title: 'Producto Test',
    price: 100,
    images: ['url1.jpg'],
    category: { id: 'cat-123' },
    isActive: true,
  } as Product;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            preload: jest.fn(),
            remove: jest.fn(),
            findAndCount: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Wishlist),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: FilesService,
          useValue: {
            uploadImage: jest.fn(),
            deleteImage: jest.fn(),
          },
        },
        {
          provide: CategoriesService,
          useValue: {
            findOneInternal: jest.fn(),
            getFlatList: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get(getRepositoryToken(Product));
    wishlistRepository = module.get(getRepositoryToken(Wishlist));
    filesService = module.get(FilesService);
    categoriesService = module.get(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateProductDto = {
      title: 'Nuevo Producto',
      price: 50,
      categoryId: 'cat-123',
    };

    it('debería crear un producto exitosamente con categoría', async () => {
      productRepository.create.mockReturnValue(mockProduct);
      categoriesService.findOneInternal.mockResolvedValue({
        id: 'cat-123',
      } as Category);
      productRepository.save.mockResolvedValue(mockProduct);

      const result = await service.create(createDto);

      expect(categoriesService.findOneInternal).toHaveBeenCalledWith('cat-123');
      expect(productRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockProduct);
    });

    it('debería lanzar NotFoundException si la categoría no existe', async () => {
      categoriesService.findOneInternal?.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('debería retornar productos paginados', async () => {
      const products = [mockProduct];
      productRepository.findAndCount.mockResolvedValue([products, 1]);

      const result = await service.findAll({ limit: 10, offset: 0 });

      const expectedData = products.map((p) => ({
        ...p,
        isFavorite: false,
      }));

      expect(result.data).toEqual(expectedData);
      expect(result.meta.total).toBe(1);
    });

    it('debería retornar productos paginados y marcar favoritos si hay userId', async () => {
      const products = [mockProduct];
      productRepository.findAndCount.mockResolvedValue([products, 1]);

      wishlistRepository.find.mockResolvedValue([
        { product: { id: 'uuid-123' } },
      ] as Wishlist[]);

      const result = await service.findAll(
        { limit: 10, offset: 0 },
        'user-123',
      );

      expect(result.data[0]).toHaveProperty('isFavorite', true);
      expect(result.meta.total).toBe(1);
      expect(wishlistRepository.find).toHaveBeenCalled();
    });

    it('debería filtrar por categoryId si se proporciona en el DTO', async () => {
      productRepository.findAndCount.mockResolvedValue([[mockProduct], 1]);

      await service.findAll({ limit: 10, offset: 0, categoryId: 'cat-123' });

      expect(productRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          where: expect.objectContaining({
            category: { id: 'cat-123' },
          } as any),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('debería retornar un producto por ID', async () => {
      productRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findOne('uuid-123');

      expect(result).toEqual(mockProduct);
    });

    it('debería lanzar NotFoundException si no existe', async () => {
      productRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('any-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('uploadMultipleImages', () => {
    it('debería subir imágenes y agregarlas al producto', async () => {
      const mockFiles = [
        { buffer: Buffer.from('test') },
      ] as Express.Multer.File[];

      const mockUploadResponse = {
        secure_url: 'new-url.jpg',
      } as UploadApiResponse;

      jest.spyOn(service, 'findOne').mockResolvedValue(mockProduct);
      filesService.uploadImage.mockResolvedValue(mockUploadResponse);
      productRepository.save.mockResolvedValue({
        ...mockProduct,
        images: ['url1.jpg', 'new-url.jpg'],
      } as Product);

      const result = await service.uploadMultipleImages('uuid-123', mockFiles);

      expect(result.images).toContain('new-url.jpg');
      expect(productRepository.save).toHaveBeenCalled();
    });
  });

  describe('deleteProductImage', () => {
    it('debería eliminar una imagen específica del producto', async () => {
      const productWithImages = {
        ...mockProduct,
        images: ['url1.jpg', 'url2.jpg'],
      } as Product;
      jest.spyOn(service, 'findOne').mockResolvedValue(productWithImages);

      await service.deleteProductImage('uuid-123', 'url1.jpg');

      expect(productRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ images: ['url2.jpg'] }),
      );
      expect(filesService.deleteImage).toHaveBeenCalledWith('url1.jpg');
    });

    it('debería lanzar BadRequestException si la imagen no pertenece al producto', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockProduct);

      await expect(
        service.deleteProductImage('uuid-123', 'non-existent.jpg'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('debería eliminar el producto de la DB', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockProduct);
      productRepository.remove.mockResolvedValue(mockProduct);

      await service.remove('uuid-123');

      expect(productRepository.remove).toHaveBeenCalled();
    });
  });

  describe('handleDBExceptions', () => {
    it('debería lanzar BadRequestException con el detalle del error', () => {
      const error = { code: '23505', detail: 'Key already exists' };

      expect(() => {
        // @ts-expect-error: ddd
        service.handleDBExceptions(error);
      }).toThrow(BadRequestException);
    });
  });
});
