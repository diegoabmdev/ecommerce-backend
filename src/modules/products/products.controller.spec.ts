/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UploadApiResponse } from 'cloudinary';

import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { FilesService } from '../files/files.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PassportModule } from '@nestjs/passport';

describe('ProductsController', () => {
  let controller: ProductsController;
  let productsService: jest.Mocked<ProductsService>;
  let filesService: jest.Mocked<FilesService>;

  const mockProduct = {
    id: 'uuid-123',
    title: 'Silla Gamer',
    price: 250,
    images: ['url1.jpg'],
  } as Product;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            uploadMultipleImages: jest.fn(),
            deleteProductImage: jest.fn(),
          },
        },
        {
          provide: FilesService,
          useValue: {
            uploadImage: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    productsService = module.get(ProductsService);
    filesService = module.get(FilesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debería llamar a productsService.create', async () => {
      const dto: CreateProductDto = {
        title: 'Test',
        price: 100,
        categoryId: 'cat1',
      };
      productsService.create.mockResolvedValue(mockProduct);

      const result = await controller.create(dto);

      expect(productsService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('findAll', () => {
    it('debería retornar el listado de productos', async () => {
      const paginationDto: PaginationDto = { limit: 10, offset: 0 };
      const mockResponse = {
        data: [mockProduct],
        meta: { total: 1, limit: 10, offset: 0, totalPages: 1 },
      };

      productsService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(paginationDto);

      expect(productsService.findAll).toHaveBeenCalledWith(paginationDto);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('uploadTempImage', () => {
    it('debería subir una imagen y retornar la URL', async () => {
      const mockFile = { buffer: Buffer.from('test') } as Express.Multer.File;
      const mockUploadRes = {
        secure_url: 'https://cloudinary.com/img.jpg',
      } as UploadApiResponse;

      filesService.uploadImage.mockResolvedValue(mockUploadRes);

      const result = await controller.uploadTempImage(mockFile);

      expect(filesService.uploadImage).toHaveBeenCalledWith(mockFile);
      expect(result).toEqual({ imageUrl: mockUploadRes.secure_url });
    });

    it('debería lanzar BadRequestException si no hay archivo', async () => {
      const nullFile = undefined as unknown as Express.Multer.File;

      await expect(controller.uploadTempImage(nullFile)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOne', () => {
    it('debería obtener un producto por ID', async () => {
      productsService.findOne.mockResolvedValue(mockProduct);

      const result = await controller.findOne('uuid-123');

      expect(productsService.findOne).toHaveBeenCalledWith('uuid-123');
      expect(result).toEqual(mockProduct);
    });
  });

  describe('update', () => {
    it('debería actualizar un producto', async () => {
      const dto: UpdateProductDto = { title: 'Nuevo Titulo' };
      productsService.update.mockResolvedValue(mockProduct);

      const result = await controller.update('uuid-123', dto);

      expect(productsService.update).toHaveBeenCalledWith('uuid-123', dto);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('deleteImage', () => {
    it('debería llamar a deleteProductImage con los parámetros correctos', async () => {
      productsService.deleteProductImage.mockResolvedValue({
        id: 'uuid-123',
        images: [],
      } as unknown as ReturnType<ProductsService['deleteProductImage']>);

      await controller.deleteImage('uuid-123', 'https://img.jpg');
      expect(productsService.deleteProductImage).toHaveBeenCalledWith(
        'uuid-123',
        'https://img.jpg',
      );
    });

    it('debería fallar si no se envía imageUrl', async () => {
      await expect(controller.deleteImage('uuid-123', '')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('remove', () => {
    it('debería eliminar el producto', async () => {
      productsService.remove.mockResolvedValue(undefined);

      await controller.remove('uuid-123');

      expect(productsService.remove).toHaveBeenCalledWith('uuid-123');
    });
  });
});
