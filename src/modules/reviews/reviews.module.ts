import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from './entities/review.entity';
import { ProductsModule } from '../products/products.module';
import { OrdersModule } from '../orders/orders.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review]),
    ProductsModule,
    OrdersModule,
    AuthModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
