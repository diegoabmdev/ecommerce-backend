import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Review } from './entities/review.entity';
import { User } from '../users/entities/user.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { ProductsService } from '../products/products.service';
import { OrdersService } from '../orders/orders.service';
import { UpdateProductDto } from '../products/dto/update-product.dto';
import { Product } from '../products/entities/product.entity';

interface ReviewStats {
  avgRating: string | null;
  count: string | null;
}

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger('ReviewsService');

  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly ordersService: OrdersService,
    private readonly productsService: ProductsService,
  ) {}

  async create(createReviewDto: CreateReviewDto, user: User) {
    const { productId, rating, comment } = createReviewDto;

    await this.productsService.findOne(productId);
    await this.validateUserCanReview(user.id, productId);

    const review = this.reviewRepository.create({
      rating,
      comment,
      user: { id: user.id } as User,
      product: { id: productId } as Product,
    });

    await this.reviewRepository.save(review);

    this.updateProductRating(productId).catch((err: unknown) => {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(
        `Error updating rating for product ${productId}: ${errorMessage}`,
      );
    });

    const userSafe = { ...review.user } as Partial<User>;
    delete userSafe.password;

    return {
      ...review,
      user: userSafe as User,
    };
  }

  private async validateUserCanReview(userId: string, productId: string) {
    const hasBought = await this.ordersService.checkUserBoughtProduct(
      userId,
      productId,
    );
    if (!hasBought) {
      throw new ForbiddenException(
        'Debes haber comprado este producto antes de dejar una reseña',
      );
    }

    const existingReview = await this.reviewRepository.findOne({
      where: { user: { id: userId }, product: { id: productId } },
    });
    if (existingReview)
      throw new BadRequestException('Ya has calificado este producto');
  }

  async findByProduct(productId: string) {
    await this.productsService.findOne(productId);

    return await this.reviewRepository.find({
      where: { product: { id: productId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string, user: User) {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['user', 'product'],
    });

    if (!review) throw new NotFoundException(`Reseña no encontrada`);

    if (review.user.id !== user.id && user.role !== 'admin') {
      throw new ForbiddenException(
        'No tienes permiso para eliminar esta reseña',
      );
    }

    const productId = review.product.id;
    await this.reviewRepository.remove(review);

    await this.updateProductRating(productId);

    return { message: 'Reseña eliminada correctamente' };
  }

  private async updateProductRating(productId: string): Promise<void> {
    const stats = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avgRating')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.product = :productId', { productId })
      .getRawOne<ReviewStats>();

    const ratingAverage = stats?.avgRating ? parseFloat(stats.avgRating) : 0;
    const reviewCount = stats?.count ? parseInt(stats.count, 10) : 0;

    const updateData: UpdateProductDto = {
      ratingAverage: Number(ratingAverage.toFixed(1)),
      reviewCount: reviewCount,
    };

    await this.productsService.update(productId, updateData);
  }
}
