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
import { Wishlist } from '../wishlist/entities/wishlist.entity';

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

    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,

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

    if (dbError && dbError.code === '23505') {
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

  async getCategoryList() {
    return await this.categoriesService.getFlatList();
  }

  async findAll(paginationDto: PaginationDto, userId?: string) {
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

    let favoriteProductIds: string[] = [];

    if (userId) {
      const favorites = await this.wishlistRepository.find({
        where: { user: { id: userId } },
        select: ['product'],
        relations: ['product'],
      });
      favoriteProductIds = favorites.map((fav) => fav.product.id);
    }

    const productsWithFavorite = products.map((product) => ({
      ...product,
      isFavorite: favoriteProductIds.includes(product.id),
    }));

    return {
      data: productsWithFavorite,
      meta: { total, limit, offset, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(term: string): Promise<Product> {
    const isUUID =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
        term,
      );

    const product = isUUID
      ? await this.productRepository.findOne({
          where: { id: term },
          relations: ['category'],
        })
      : await this.productRepository.findOne({
          where: { slug: term.toLowerCase().trim() },
          relations: ['category'],
        });

    if (!product)
      throw new NotFoundException(`Producto con término ${term} no encontrado`);

    return product;
  }

  async search(q: string, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const [products, total] = await this.productRepository.findAndCount({
      where: [
        { title: ILike(`%${q}%`), isActive: true },
        { description: ILike(`%${q}%`), isActive: true },
        { brand: ILike(`%${q}%`), isActive: true },
      ],
      take: limit,
      skip: offset,
      relations: ['category'],
    });

    return { products, total, limit, skip: offset };
  }

  async findByCategorySlug(slug: string, paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const [products, total] = await this.productRepository.findAndCount({
      where: {
        category: { slug: slug.toLowerCase() },
        isActive: true,
      },
      take: limit,
      skip: offset,
      relations: ['category'],
    });

    return { products, total, limit, skip: offset };
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
        const errorMessage =
          err instanceof Error ? err.message : 'Error desconocido';
        this.logger.error(
          `Error limpiando Cloudinary al borrar producto: ${errorMessage}`,
        );
      });
    }

    await this.productRepository.remove(product);
  }
}
