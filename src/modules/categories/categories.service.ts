import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

interface DbError {
  code?: string;
  detail?: string;
}

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger('CategoriesService');

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAllWithCount() {
    const categories = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoin('category.products', 'product')
      .select(['category.id', 'category.name', 'category.description'])
      .loadRelationCountAndMap(
        'category.productsCount',
        'category.products',
        'product', // Alias
        (qb) => qb.andWhere('product.isActive = :isActive', { isActive: true }),
      )
      .getMany();

    return categories;
  }

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const category = this.categoryRepository.create(createCategoryDto);
      await this.categoryRepository.save(category);
      return category;
    } catch (error) {
      this.handleDbErrors(error as DbError);
    }
  }

  async findAll() {
    return await this.categoryRepository.find({});
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!category)
      throw new NotFoundException(`Categoría con id ${id} no encontrada`);

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.preload({
      id: id,
      ...updateCategoryDto,
    });

    if (!category)
      throw new NotFoundException(`Categoría con id ${id} no encontrada`);

    try {
      await this.categoryRepository.save(category);
      return category;
    } catch (error) {
      this.handleDbErrors(error as DbError);
    }
  }

  async remove(id: string) {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
    return { message: 'Categoría eliminada con éxito' };
  }

  async findOneInternal(id: string) {
    return await this.categoryRepository.findOneBy({ id });
  }

  private handleDbErrors(error: DbError): never {
    if (error.code === '23505')
      throw new BadRequestException(
        'Esa categoría ya existe (nombre duplicado)',
      );

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Error inesperado en CategoriesService, revise los logs',
    );
  }
}
