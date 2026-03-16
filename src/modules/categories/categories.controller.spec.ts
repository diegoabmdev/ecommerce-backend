/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { PassportModule } from '@nestjs/passport';

import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: jest.Mocked<CategoriesService>;

  const mockCategory = {
    id: 'uuid-123',
    name: 'Electrónica',
    description: 'Gadgets tecnológicos',
  } as Category;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findAllWithCount: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get(CategoriesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debería crear una categoría', async () => {
      const dto: CreateCategoryDto = { name: 'Libros', description: 'Cultura' };
      service.create.mockResolvedValue(mockCategory);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockCategory);
    });
  });

  describe('findAll', () => {
    it('debería retornar todas las categorías', async () => {
      const categories = [mockCategory];
      service.findAll.mockResolvedValue(categories);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(categories);
    });
  });

  describe('getMenuStats', () => {
    it('debería retornar categorías con conteo', async () => {
      const categoriesWithCount = [
        { ...mockCategory, productsCount: 5 },
      ] as Category[];
      service.findAllWithCount.mockResolvedValue(categoriesWithCount);

      const result = await controller.getMenuStats();

      expect(service.findAllWithCount).toHaveBeenCalled();
      expect(result).toEqual(categoriesWithCount);
    });
  });

  describe('findOne', () => {
    it('debería retornar una categoría por ID', async () => {
      service.findOne.mockResolvedValue(mockCategory);

      const result = await controller.findOne('uuid-123');

      expect(service.findOne).toHaveBeenCalledWith('uuid-123');
      expect(result).toEqual(mockCategory);
    });
  });

  describe('update', () => {
    it('debería actualizar una categoría', async () => {
      const dto: UpdateCategoryDto = { name: 'Electrónica Pro' };
      service.update.mockResolvedValue({
        ...mockCategory,
        name: 'Electrónica Pro',
      } as Category);

      const result = await controller.update('uuid-123', dto);

      expect(service.update).toHaveBeenCalledWith('uuid-123', dto);
      expect(result.name).toBe('Electrónica Pro');
    });
  });

  describe('remove', () => {
    it('debería eliminar una categoría', async () => {
      const mockRes = { message: 'Categoría eliminada con éxito' };
      service.remove.mockResolvedValue(
        mockRes as Awaited<ReturnType<CategoriesService['remove']>>,
      );

      const result = await controller.remove('uuid-123');

      expect(service.remove).toHaveBeenCalledWith('uuid-123');
      expect(result).toEqual(mockRes);
    });
  });
});
