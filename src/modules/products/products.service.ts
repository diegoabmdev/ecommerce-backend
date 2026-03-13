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
    const { categoryId, ...productDetails } = createProductDto;

    const product = this.productRepository.create({ ...productDetails });

    if (categoryId) {
      const category = await this.categoriesService.findOneInternal(categoryId);
      if (!category) throw new NotFoundException('Categoría no encontrada');
      product.category = category;
    }

    await this.productRepository.save(product);
    return product;
  }

  async uploadMultipleImages(productId: string, files: Express.Multer.File[]) {
    const product = await this.productRepository.findOneBy({ id: productId });

    if (!product) {
      throw new NotFoundException(`Producto con ID ${productId} no encontrado`);
    }

    const uploadPromises = files.map((file) =>
      this.filesService.uploadImage(file),
    );
    const results = await Promise.all(uploadPromises);

    if (!product.images) product.images = [];

    const newUrls = results.map((res) => res.secure_url);
    product.images = [...product.images, ...newUrls];

    await this.productRepository.save(product);

    return {
      message: `${files.length} imágenes subidas con éxito`,
      images: product.images,
    };
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

    return { message: 'Imagen eliminada correctamente' };
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0, search, categoryId } = paginationDto;
    const whereOptions: FindOptionsWhere<Product> = { isActive: true };

    if (search) whereOptions.title = ILike(`%${search}%`);
    if (categoryId) whereOptions.category = { id: categoryId };

    const [products, total] = await this.productRepository.findAndCount({
      take: limit,
      skip: offset,
      where: whereOptions,
      relations: ['category'],
      order: { createdAt: 'DESC' },
    });

    return {
      data: products,
      meta: {
        total,
        limit,
        offset,
        totalPages: Math.ceil(total / limit),
      },
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
      await Promise.all(deletePromises).catch((err) =>
        this.logger.error('Error limpiando Cloudinary al borrar producto', err),
      );
    }

    await this.productRepository.remove(product);
  }
}
