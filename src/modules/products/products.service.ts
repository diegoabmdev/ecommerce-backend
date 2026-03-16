import {
  Injectable,
  BadRequestException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FilesService } from '../files/files.service';
import { CategoriesService } from '../categories/categories.service';

interface DBError {
  code: string;
  detail: string;
}

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly filesService: FilesService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { categoryId, ...details } = createProductDto;
    const product = this.productRepository.create(details);

    if (categoryId) {
      const category = await this.categoriesService.findOneInternal(categoryId);
      if (!category) throw new NotFoundException('Categoría no encontrada');
      product.category = category;
    }

    try {
      return await this.productRepository.save(product);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async uploadMultipleImages(productId: string, files: Express.Multer.File[]) {
    const product = await this.findOne(productId);

    const uploadResults = await Promise.all(
      files.map((file) => this.filesService.uploadImage(file)),
    );

    const newUrls = uploadResults.map((res) => res.secure_url);
    product.images = [...(product.images || []), ...newUrls];

    await this.productRepository.save(product);
    return { images: product.images };
  }

  private handleDBExceptions(error: unknown): never {
    const dbError = error as DBError;

    if (dbError.code === '23505') {
      throw new BadRequestException(dbError.detail);
    }

    this.logger.error(error);
    throw new BadRequestException(
      'Error inesperado, revise los logs del servidor',
    );
  }

  async deleteProductImage(productId: string, imageUrl: string) {
    const product = await this.findOne(productId);

    const initialLength = product.images.length;
    product.images = product.images.filter((img) => img !== imageUrl);

    if (product.images.length === initialLength) {
      throw new BadRequestException('La imagen no existe en este producto');
    }

    await this.productRepository.save(product);

    try {
      await this.filesService.deleteImage(imageUrl);
    } catch (error) {
      this.logger.error(
        'No se pudo borrar de Cloudinary, pero se quitó de la DB',
        error,
      );
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0, search, categoryId } = paginationDto;
    const whereOptions: FindOptionsWhere<Product> = { isActive: true };

    if (search) whereOptions.title = ILike(`%${search}%`);
    if (categoryId) whereOptions.category = { id: categoryId };

    const [data, total] = await this.productRepository.findAndCount({
      take: limit,
      skip: offset,
      where: whereOptions,
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      meta: { total, limit, offset, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product)
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const { categoryId, ...toUpdate } = updateProductDto;

    const product = await this.productRepository.preload({
      id: id,
      ...toUpdate,
    });

    if (!product)
      throw new NotFoundException(`Producto con id ${id} no encontrado`);

    if (categoryId) {
      const category = await this.categoriesService.findOneInternal(categoryId);
      if (!category) throw new NotFoundException('Categoría no encontrada');
      product.category = category;
    }

    await this.productRepository.save(product);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);

    if (product.images?.length > 0) {
      const deletePromises = product.images.map((img) =>
        this.filesService.deleteImage(img),
      );
      await Promise.all(deletePromises).catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Unknown';
        this.logger.error(
          `Error limpiando Cloudinary al borrar producto: ${msg}`,
        );
      });
    }

    await this.productRepository.remove(product);
  }
}
