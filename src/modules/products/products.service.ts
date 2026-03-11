import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

interface DbError {
  code?: string;
  detail?: string;
}

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      const product = this.productRepository.create(createProductDto);
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleDbErrors(error as DbError);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0, search } = paginationDto;

    // En lugar de 'any', usamos el tipo oficial de TypeORM para filtros
    const whereOptions: FindOptionsWhere<Product> = { isActive: true };

    if (search) {
      whereOptions.title = ILike(`%${search}%`);
    }

    const [products, total] = await this.productRepository.findAndCount({
      take: limit,
      skip: offset,
      where: whereOptions,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data: products,
      meta: {
        total,
        limit,
        offset,
        totalPages: Math.ceil(total / limit),
        search: search || null,
      },
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOneBy({ id });
    if (!product)
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto,
    });

    if (!product)
      throw new NotFoundException(`Producto con id ${id} no encontrado`);

    try {
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleDbErrors(error as DbError);
    }
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  private handleDbErrors(error: DbError): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException('Error inesperado, revise los logs');
  }
}
