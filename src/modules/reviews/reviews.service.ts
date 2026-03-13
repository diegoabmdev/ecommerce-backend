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

    const hasBought = await this.ordersService.checkUserBoughtProduct(
      user.id,
      productId,
    );
    if (!hasBought) {
      throw new ForbiddenException(
        'Debes haber comprado este producto antes de dejar una reseña',
      );
    }

    const existingReview = await this.reviewRepository.findOne({
      where: { user: { id: user.id }, product: { id: productId } },
    });
    if (existingReview)
      throw new BadRequestException('Ya has calificado este producto');

    const review = this.reviewRepository.create({
      rating,
      comment,
      user,
      product: { id: productId },
    });

    await this.reviewRepository.save(review);

    await this.updateProductRating(productId);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = review.user;
    review.user = userWithoutPassword as User;

    return review;
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
    const reviews = await this.reviewRepository.find({
      where: { product: { id: productId } },
    });

    const reviewCount = reviews.length;
    const ratingAverage =
      reviewCount > 0
        ? reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviewCount
        : 0;

    const updateData: UpdateProductDto = {
      ratingAverage: Number(ratingAverage.toFixed(1)),
      reviewCount: reviewCount,
    };

    await this.productsService.update(productId, updateData);
  }
}
