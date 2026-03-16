/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: jest.Mocked<Repository<Category>>;

  const mockCategory = {
    id: 'uuid-123',
    name: 'Electrónica',
    description: 'Gadgets y más',
    products: [],
  } as Category;

  const mockQueryBuilder = {
    leftJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    loadRelationCountAndMap: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            preload: jest.fn(),
            remove: jest.fn(),
            findOneBy: jest.fn(),
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
          },
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    repository = module.get(getRepositoryToken(Category));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debería crear una categoría exitosamente', async () => {
      const dto: CreateCategoryDto = { name: 'Ropa', description: 'Moda' };
      repository.create.mockReturnValue(mockCategory);
      repository.save.mockResolvedValue(mockCategory);

      const result = await service.create(dto);

      expect(repository.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockCategory);
    });
  });

  describe('findAllWithCount', () => {
    it('debería llamar al queryBuilder y retornar categorías', async () => {
      const categories = [mockCategory];
      mockQueryBuilder.getMany.mockResolvedValue(categories);

      const result = await service.findAllWithCount();

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('category');
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(result).toEqual(categories);
    });
  });

  describe('findOne', () => {
    it('debería retornar una categoría si existe', async () => {
      repository.findOne.mockResolvedValue(mockCategory);

      const result = await service.findOne('uuid-123');

      expect(result).toEqual(mockCategory);
    });

    it('debería lanzar NotFoundException si no existe', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('debería actualizar una categoría exitosamente', async () => {
      repository.preload.mockResolvedValue(mockCategory);
      repository.save.mockResolvedValue(mockCategory);

      const result = await service.update('uuid-123', { name: 'Nuevo Nombre' });

      expect(repository.preload).toHaveBeenCalled();
      expect(result.name).toBe('Electrónica');
    });
  });

  describe('remove', () => {
    it('debería eliminar una categoría', async () => {
      repository.findOne.mockResolvedValue(mockCategory);
      repository.remove.mockResolvedValue(mockCategory);

      const result = await service.remove('uuid-123');

      expect(repository.remove).toHaveBeenCalledWith(mockCategory);
      expect(result.message).toContain('éxito');
    });
  });

  describe('findOneInternal', () => {
    it('debería usar findOneBy para una búsqueda rápida', async () => {
      repository.findOneBy.mockResolvedValue(mockCategory);

      const result = await service.findOneInternal('uuid-123');

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 'uuid-123' });
      expect(result).toEqual(mockCategory);
    });
  });
});
