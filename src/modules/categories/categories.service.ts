import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger('CategoriesService');

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAllWithCount() {
    return await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoin('category.products', 'product')
      .select(['category.id', 'category.name', 'category.description'])
      .loadRelationCountAndMap(
        'category.productsCount',
        'category.products',
        'product',
        (qb) => qb.andWhere('product.isActive = :isActive', { isActive: true }),
      )
      .getMany();
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const category = this.categoryRepository.create(createCategoryDto);
    await this.categoryRepository.save(category);
    return category;
  }

  async getFlatList() {
    const categories = await this.categoryRepository.find({ select: ['slug'] });
    return categories.map((cat) => cat.slug);
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
      id,
      ...updateCategoryDto,
    });

    if (!category)
      throw new NotFoundException(`Categoría con id ${id} no encontrada`);

    await this.categoryRepository.save(category);
    return category;
  }

  async remove(id: string) {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
    return { message: 'Categoría eliminada con éxito' };
  }

  async findOneInternal(id: string) {
    return await this.categoryRepository.findOneBy({ id });
  }
}
